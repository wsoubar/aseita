# AGENTS.md

## Comunicação

- Respostas concisas e diretas, em pt-BR.
- Ao concluir uma tarefa, informe em 1-3 linhas o que mudou e o que ficou pendente.
- Não repetir código inalterado; mostrar apenas diff ou trecho relevante quando necessário.

## Eficiência

- Ler só o necessário; localizar arquivos com `rg`/`rg --files` e evitar diretórios gerados.
- Não criar documentação, testes ou exemplos que não foram pedidos.
- Não ler ou expor `.env`, chaves e credenciais.

## Fluxo de trabalho

- Tarefas pequenas e claras: executar direto. Tarefas médias ou grandes: planejar antes de editar.
- Após editar código, rodar build, testes e lint aplicáveis; não há script de testes automatizados neste projeto.
- Em caso de ambiguidade real, fazer uma pergunta objetiva; caso contrário, assumir o padrão razoável e informar a suposição.

## Projeto

- Stack: Vite, React 19, TypeScript, Tailwind CSS v4, React Router v7, TanStack Query v5, React Hook Form, Zod e Supabase.
- Build: `npm run build` (`tsc -b && vite build`).
- Lint: `npm run lint` (ESLint). Testes: `npm test` (runner nativo `node:test`).
- Estrutura: `src/features/*` organiza auth, characters, feed, profile, ranking e systems; `src/components/layout` contém layout/rotas protegidas; `src/components/ui` contém componentes compartilhados; `src/lib` contém Supabase, schemas, tema e utilitários; `supabase/migrations` contém o schema SQL.
- Convenções: manter lógica de acesso a dados junto à feature em `api.ts`; usar tipos de domínio de `src/types.ts`, validação Zod em `src/lib/schemas.ts` e TanStack Query para estado remoto.

## Limites

- Nunca commitar, fazer push ou apagar arquivos sem pedido explícito.
- Antes de comandos destrutivos ou de instalar dependências, confirmar.
