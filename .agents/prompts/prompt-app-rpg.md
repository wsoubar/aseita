# Prompt — App "Grimório" (rede social de fichas de RPG)

> Projeto base: este repositório, template **Vite + React 19 + TypeScript** ainda padrão.
> Backend escolhido: **Supabase** (Postgres + Auth + RLS). Justificativa: ranking, joins
> (autor do post ↔ perfil), likes/comentários e catálogo de sistemas são consultas
> relacionais — resolvidas com SQL/views; no Firestore exigiriam denormalização e Cloud
> Functions. Não há upload de imagem, então não é necessário Storage.

---

## Objetivo
Transformar este projeto (Vite + React 19 + TypeScript, template padrão) em um app web
onde jogadores de RPG cadastram seus personagens de DIVERSOS sistemas, publicam em um feed,
interagem por likes/comentários e disputam um ranking de popularidade.

## Stack e decisões obrigatórias
- Manter Vite + React 19 + TypeScript. Não migrar para Next.js.
- NÃO usar o React Compiler (já desabilitado no template) — siga as regras normais de hooks.
- Roteamento: react-router-dom (SPA, rotas protegidas para área logada).
- Dados/estado servidor: Supabase (@supabase/supabase-js) + TanStack Query (@tanstack/react-query).
- Formulários + validação: react-hook-form + zod.
- Estilo: Tailwind CSS v4 (design tokens próprios; nada de UI kit genérico pesado).
  Componentes acessíveis próprios (dialog, dropdown, tabs) ou Radix primitives pontuais.
- Ícones: lucide-react.
- Backend: Supabase (Auth + Postgres + RLS). Autenticação por e-mail/senha E OAuth Google.
- Nenhum bucket de Storage: imagens são SEMPRE URLs externas fornecidas pelo usuário.

## Restrições do TypeScript (o build quebra se violar)
- `noUnusedLocals` / `noUnusedParameters`: sem variável/param não usado.
- `verbatimModuleSyntax`: use `import type` para tipos.
- `erasableSyntaxOnly`: sem `enum`/`namespace`/parameter properties.
- `build` roda `tsc -b` antes do Vite — corrija erros de tipo antes de finalizar.

## Modelo de dados (Postgres no Supabase)
Crie via migrações SQL versionadas em `supabase/migrations/`.

- systems(id uuid pk, slug text unique, name text, description text)
  Catálogo de sistemas (D&D 5e, Tormenta20, Call of Cthulhu, etc.). Seed inicial com ~8 sistemas.
- profiles(id uuid pk references auth.users, username text unique, display_name text,
  bio text, avatar_url text, preferred_system_id uuid null references systems, created_at, updated_at)
  Criada automaticamente por trigger `handle_new_user` ao inserir em auth.users.
- characters(id uuid pk, owner_id uuid references profiles, system_id uuid references systems,
  name text, description text, image_url text, data jsonb, like_count int default 0,
  created_at, updated_at)
  `data` guarda atributos livres do sistema (classe, nível, raça, etc.) — sem schema rígido.
- posts(id uuid pk, author_id uuid references profiles, character_id uuid null references characters,
  body text, created_at, updated_at)
- likes(post_id uuid, user_id uuid, created_at, pk(post_id,user_id))
- comments(id uuid pk, post_id uuid references posts on delete cascade, author_id uuid,
  body text, created_at)
- View `character_rankings`: id, name, owner username, system name, score, rank
  score = (likes em posts ligados ao personagem) + (comentários nesses posts) + like_count.
  Use window function `rank() over (order by score desc)`.

Índices: posts(created_at desc), likes(post_id), comments(post_id), characters(owner_id, system_id),
posts(character_id).

## Segurança (RLS) — obrigatório
- profiles: SELECT público; UPDATE apenas do próprio registro.
- systems: SELECT público; escrita só via seed/migração.
- characters/posts/comments: SELECT público; INSERT/UPDATE/DELETE apenas do autor.
- likes: SELECT público; INSERT/DELETE apenas do próprio user_id (evitar auto-like repetido).
- Nunca usar service_role no cliente. Apenas a anon key pública via `.env`
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Adicionar `.env` ao .gitignore.
- Validar TODAS as entradas com zod no cliente; RLS é a última linha de defesa.

## Telas e funcionalidades
1. Autenticação
   - /login e /register (e-mail/senha + "Entrar com Google"). Recuperação de senha.
   - Após cadastro, redirecionar para /onboarding: definir username (único, validado) e
     sistema preferido. Bloquear app até completar o onboarding.
2. Feed (tela principal, /)
   - Lista de posts paginada (infinite scroll com TanStack Query).
   - Cada post: avatar + nick do autor (clicável), data relativa, corpo, personagem vinculado
     (card compacto), botão de like com contagem otimista, contador de comentários.
   - Novo post: modal/inline com textarea, seletor opcional de personagem e preview.
   - Comentários expandíveis no próprio post.
3. Perfil público (/u/:username)
   - Dados do jogador, sistema preferido, personagens dele e posts dele.
   - Botão "seguir"? NÃO — fora de escopo (evitar inflar). Apenas visualização.
4. Personagens
   - /characters: grid com busca por nome e filtro por sistema.
   - /characters/new e /characters/:id (detalhe), /characters/:id/edit.
   - Formulário: nome, sistema (select), descrição, image_url (com preview + fallback/placeholder
     e validação de URL), atributos dinâmicos do sistema em pares chave/valor (campo `data`).
5. Editar perfil (/settings)
   - display_name, bio, avatar_url (link), sistema preferido, trocar senha. E-mail somente leitura.
6. Ranking (/ranking)
   - Tabela/lista da view character_rankings, top 100, com medalha para o top 3, filtro por sistema,
     nome do personagem + dono (nick clicável) + sistema + score.
7. Extras
   - Loading skeletons em todas as listas, empty states com CTA, toasts para ações,
     confirmação antes de excluir, responsivo mobile-first, dark mode (toggle persistido).

## Design (usar a skill frontend-design)
- Estética: "grimório moderno" — sério e temático, porém limpo e rápido de usar.
- Paleta escura com 1 cor de destaque (âmbar/dourado) + neutros; tipografia com um display
  para títulos e um sans legível para corpo. Contraste AA.
- Layout: navegação superior (desktop) e barra inferior (mobile). Cards com cantos suaves,
  sombra sutil, bordas de 1px. Muito espaço em branco, hierarquia clara.
- Nada de visual "template default": evitar gradientes roxos genéricos, sombras exageradas e
  emojis como ícones. Layout próprio e intencional.
- Micro-interações discretas (hover, like com animação leve). Respeitar prefers-reduced-motion.

## Boas práticas
- Organização por feature: src/features/{auth,feed,characters,profile,ranking}/ cada uma com
  components/, hooks/, api.ts. src/lib/ para supabase client, query client, utils, zod schemas.
  src/components/ui/ para primitivos reutilizáveis.
- Nunca fazer lógica de dados dentro de componentes de apresentação; isolar em hooks/api.
- Tratar estados: loading, erro, vazio, sucesso em toda operação remota.
- Acessibilidade: navegação por teclado, labels, roles, foco visível.
- Evitar re-render desnecessário seguindo as regras da skill vercel-react-best-practices
  (derivar estado no render, functional setState, não definir componentes dentro de componentes).
- Anti-abuso básico: limite de tamanho do post/comentário via zod + constraint no banco;
  rate limit simples em likes.

## Escopo / não-objetivos (v1)
- Não implementar upload de arquivos, chat em tempo real, seguir usuários, notificações push.
- Não criar backend próprio (Edge Functions) salvo para o seed/trigger do Supabase.

## Entregáveis e verificação
- Migrações SQL + seed de sistemas em `supabase/migrations/`.
- `.env.example` com as variáveis e instruções no README de como criar o projeto Supabase
  e rodar `supabase db push`.
- App funcional de ponta a ponta: cadastro → onboarding → criar personagem → postar →
  curtir/comentar → ver perfil de outro jogador → ranking.
- `npm run lint` e `npm run build` passando sem erros nem warnings de tipo.
- README atualizado: setup local, variáveis de ambiente, comandos.
