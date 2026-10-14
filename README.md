# Grimório

Rede social para jogadores de RPG: cadastre personagens de **diversos sistemas**,
publique no feed, curta e comente, visite perfis de outros jogadores e acompanhe
o **ranking de popularidade** dos personagens.

## Stack

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** (tema escuro próprio, sem UI kit genérico)
- **React Router** (SPA com rotas protegidas)
- **TanStack Query** (cache/estado de servidor)
- **React Hook Form + Zod** (formulários e validação)
- **Supabase** (Auth + Postgres + Row Level Security)

Não há upload de imagens: personagens e avatares usam apenas **URLs externas**.

## Configuração

### 1. Dependências

```sh
npm install
```

### 2. Projeto Supabase

1. Crie um projeto em <https://supabase.com>.
2. No **SQL Editor**, execute o conteúdo de
   [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql).
   Esse script cria tabelas, índices, triggers, policies de RLS, a view de
   ranking e faz o seed dos sistemas.
   _Alternativa com a CLI:_ `supabase link` e depois `supabase db push`.
3. Em **Authentication > Providers**, habilite **Email** (e **Google**, se quiser
   login social). Em **Authentication > URL Configuration**, adicione a URL do
   app (ex.: `http://localhost:5173`) em *Redirect URLs*.

### 3. Variáveis de ambiente

Copie o exemplo e preencha com os dados de **Project Settings > API**:

```sh
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-publica
```

> Use apenas a **anon key** (pública). Nunca coloque a `service_role` no cliente.

## Comandos

```sh
npm run dev       # servidor de desenvolvimento (HMR)
npm run build     # tsc -b && vite build
npm run lint      # eslint
npm run preview   # serve o build de produção
```

Não há testes automatizados neste projeto.

## Estrutura

```
src/
  components/
    layout/        AppLayout (nav) e ProtectedRoute
    ui/            primitivos (Button, Input, Card, Dialog, Toast, ...)
  features/
    auth/          AuthProvider, login/registro/onboarding
    feed/          posts, likes, comentários
    characters/    fichas (CRUD) e atributos dinâmicos
    profile/       perfil público e configurações
    ranking/       ranking de popularidade
    systems/       catálogo de sistemas
  lib/             supabase client, schemas (zod), utils
  types.ts         tipos de domínio
supabase/migrations/  schema SQL
```

## Fluxo do usuário

Cadastro → **onboarding** (escolher nick e sistema preferido) → criar
personagem → publicar no feed (opcionalmente vinculando um personagem) →
curtir/comentar → ver o perfil de quem postou (clicando no nick) → ranking.

## Modelo de dados

`systems`, `profiles`, `characters` (com `data jsonb` para atributos livres por
sistema), `posts`, `likes`, `comments` e a view `character_rankings`
(score = curtidas + comentários em posts vinculados ao personagem).
Todas as tabelas têm **RLS**: leitura pública e escrita restrita ao dono.
