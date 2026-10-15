-- A Seita — schema inicial
-- Aplique no Supabase (SQL Editor) ou via `supabase db push`.

-- =========================================================
-- Tabelas
-- =========================================================

create table if not exists public.systems (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text not null,
  bio text,
  avatar_url text,
  preferred_system_id uuid references public.systems (id) on delete set null,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  system_id uuid not null references public.systems (id),
  name text not null,
  description text,
  image_url text,
  data jsonb not null default '{}'::jsonb,
  like_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  character_id uuid references public.characters (id) on delete set null,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

-- =========================================================
-- Índices
-- =========================================================

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_character_idx on public.posts (character_id);
create index if not exists posts_author_idx on public.posts (author_id);
create index if not exists likes_post_idx on public.likes (post_id);
create index if not exists comments_post_idx on public.comments (post_id);
create index if not exists characters_owner_idx on public.characters (owner_id);
create index if not exists characters_system_idx on public.characters (system_id);

-- =========================================================
-- Funções e triggers
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.characters;
create trigger set_updated_at before update on public.characters
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.posts;
create trigger set_updated_at before update on public.posts
  for each row execute function public.set_updated_at();

-- Cria o perfil automaticamente ao registrar um usuário.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    'user_' || substr(replace(new.id::text, '-', ''), 1, 8),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      split_part(coalesce(new.email, 'jogador'), '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mantém characters.like_count quando likes mudam.
create or replace function public.sync_character_likes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
  delta integer;
begin
  select character_id into target
  from public.posts
  where id = coalesce(new.post_id, old.post_id);

  if target is not null then
    delta := case when tg_op = 'INSERT' then 1 else -1 end;
    update public.characters
      set like_count = greatest(0, like_count + delta)
      where id = target;
  end if;
  return null;
end;
$$;

drop trigger if exists on_like_change on public.likes;
create trigger on_like_change
  after insert or delete on public.likes
  for each row execute function public.sync_character_likes();

-- View de ranking de popularidade.
create or replace view public.character_rankings
with (security_invoker = true) as
select
  c.id,
  c.name,
  c.image_url,
  c.system_id,
  p.username as owner_username,
  s.name as system_name,
  (c.like_count + coalesce(cm.total, 0))::int as score,
  (rank() over (
    order by (c.like_count + coalesce(cm.total, 0)) desc
  ))::int as rank
from public.characters c
join public.profiles p on p.id = c.owner_id
join public.systems s on s.id = c.system_id
left join (
  select po.character_id, count(*) as total
  from public.comments co
  join public.posts po on po.id = co.post_id
  where po.character_id is not null
  group by po.character_id
) cm on cm.character_id = c.id;

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.systems enable row level security;
alter table public.profiles enable row level security;
alter table public.characters enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

-- systems: leitura pública (escrita só via seed/serviço).
drop policy if exists "systems_select" on public.systems;
create policy "systems_select" on public.systems for select using (true);

-- profiles: leitura pública; cada um atualiza o próprio.
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select using (true);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- characters: leitura pública; dono escreve.
drop policy if exists "characters_select" on public.characters;
create policy "characters_select" on public.characters for select using (true);
drop policy if exists "characters_insert_own" on public.characters;
create policy "characters_insert_own" on public.characters
  for insert with check (auth.uid() = owner_id);
drop policy if exists "characters_update_own" on public.characters;
create policy "characters_update_own" on public.characters
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "characters_delete_own" on public.characters;
create policy "characters_delete_own" on public.characters
  for delete using (auth.uid() = owner_id);

-- posts: leitura pública; autor escreve.
drop policy if exists "posts_select" on public.posts;
create policy "posts_select" on public.posts for select using (true);
drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own" on public.posts
  for insert with check (auth.uid() = author_id);
drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own" on public.posts
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own" on public.posts
  for delete using (auth.uid() = author_id);

-- likes: leitura pública; só a própria curtida.
drop policy if exists "likes_select" on public.likes;
create policy "likes_select" on public.likes for select using (true);
drop policy if exists "likes_insert_own" on public.likes;
create policy "likes_insert_own" on public.likes
  for insert with check (auth.uid() = user_id);
drop policy if exists "likes_delete_own" on public.likes;
create policy "likes_delete_own" on public.likes
  for delete using (auth.uid() = user_id);

-- comments: leitura pública; autor escreve.
drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments for select using (true);
drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments
  for insert with check (auth.uid() = author_id);
drop policy if exists "comments_update_own" on public.comments;
create policy "comments_update_own" on public.comments
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own" on public.comments
  for delete using (auth.uid() = author_id);

-- =========================================================
-- Seed de sistemas
-- =========================================================

insert into public.systems (slug, name, description) values
  ('dnd-5e', 'D&D 5ª Edição', 'Dungeons & Dragons 5e'),
  ('tormenta20', 'Tormenta20', 'RPG brasileiro de fantasia'),
  ('pathfinder-2e', 'Pathfinder 2ª Edição', 'Fantasia tática'),
  ('call-of-cthulhu', 'Call of Cthulhu', 'Terror e investigação'),
  ('vampiro-mascaras', 'Vampiro: A Máscara', 'Mundo das Trevas'),
  ('ordem-paranormal', 'Ordem Paranormal', 'Terror moderno brasileiro'),
  ('fabula-ultima', 'Fábula Última', 'RPG de mesa narrativo'),
  ('gurps', 'GURPS', 'Sistema genérico e universal')
on conflict (slug) do nothing;
