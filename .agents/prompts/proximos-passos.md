# Próximos passos — Grimório

Backlog de ideias para depois do MVP atual (feed, personagens, perfis, ranking,
temas claro/escuro/sistema).

## Engajamento
- **Curtir personagem direto** — hoje o ranking usa curtidas + comentários em
  posts vinculados e `characters.like_count` (via trigger). Adicionar uma tabela
  `character_likes` (ou reusar `like_count`) e um botão na ficha.
- **Seguir jogadores** — tabela `follows(follower_id, followee_id)`; botão no
  perfil público; opção de feed filtrado ("seguindo").
- **Notificações** — para curtidas, comentários e novos seguidores. Base em
  Supabase Realtime ou tabela `notifications` + contador no header.
- **Compartilhar post** — link direto para um post (`/post/:id`).

## Conteúdo
- **Upload de imagens** — hoje só URLs externas. Avaliar Supabase Storage +
  bucket público para avatar/ficha (contraria o "sem upload" do MVP).
- **Busca de jogadores** — por nick/nome de exibição.
- **Editar/excluir comentário** — a policy de `update` já existe no banco, falta UI.
- **Campos de atributos por sistema** — hoje `data jsonb` livre; oferecer modelos
  prontos por sistema (classe, nível, raça, etc.).

## Ranking
- **Filtros por período** (semana / mês / geral) para o ranking.
- **Critérios adicionais** além de curtidas+comentários (ex.: visualizações).
- **Paginação do top 100** se crescer.

## Qualidade / infra
- **Testes automatizados** — não existe nenhum hoje (sem framework instalado).
  Sugestão: Vitest + Testing Library para componentes/hooks.
- **Rate limiting anti-abuso** — constraints já limitam tamanho; falta limite de
  frequência em posts/comentários/curtidas.
- **Deploy + CI** — publicar (Vercel/Netlify) e rodar `lint`/`build` em CI.
- **Code splitting** — o bundle passa de 500 kB; separar rotas com `lazy`.

## Notas
- Migrações novas devem seguir `supabase/migrations/NNNN_*.sql`.
- Nunca usar `service_role` no cliente; RLS é a última linha de defesa.
