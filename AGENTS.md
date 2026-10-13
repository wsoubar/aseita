# AGENTS.md

Template **Vite + React 19 + TypeScript** praticamente sem modificações. `src/App.tsx` ainda é a landing page padrão; não há código de produto, testes, backend nem CI.

## Comandos

```sh
npm run dev       # servidor de desenvolvimento Vite com HMR
npm run build     # tsc -b (project references) && vite build
npm run lint      # eslint .
npm run preview   # serve o build de produção
```

- **Não existe script de teste nem framework de testes instalado.** Não procure nem presuma testes; adicionar um exige instalar a dependência primeiro.
- `build` roda `tsc -b` antes, então erros de tipo quebram o build independentemente do Vite.

## Restrições do TypeScript (elas quebram o build)

Tanto `tsconfig.app.json` quanto `tsconfig.node.json` ativam regras estritas além do usual:

- `noUnusedLocals` / `noUnusedParameters` — variáveis e parâmetros não usados são erros.
- `verbatimModuleSyntax` — imports apenas de tipo devem usar `import type { X }` (ou inline `import { type X }`).
- `erasableSyntaxOnly` — sem `enum`, `namespace` ou parameter properties de construtor; use objetos/consts simples.
- `allowImportingTsExtensions` + `noEmit` — imports relativos podem incluir a extensão `.ts`/`.tsx` (veja `main.tsx` importando `./App.tsx`).

A config é dividida em project references (`tsconfig.json` → `tsconfig.app.json` para `src`, `tsconfig.node.json` para `vite.config.ts`); edite o arquivo correspondente.

## Skills

As skills deste projeto ficam em `.agents/skills/` e são rastreadas por `skills-lock.json` (fonte upstream + `computedHash`). São sincronizadas de repositórios externos — **não edite esses arquivos à mão**, pois a alteração invalida o hash do lockfile. Adicione/atualize skills pela ferramenta que gerencia o lock, não por edição direta.

- `vercel-react-best-practices` — guia de performance React/Next.js da Vercel (as regras em `rules/` são o conteúdo real).
- `ai-sdk` — Vercel AI SDK (`generateText`, `streamText`, `useChat`, etc.).
- `frontend-design` — direção visual/estética para UI.
- `react` — **atenção:** é o renderer `@json-render/react` (JSON → componentes React), não um guia geral de React.

## Lint

Config flat em `eslint.config.js` usando `defineConfig` de `eslint/config`. Inclui `react-hooks` e `react-refresh`; o React Fast Refresh falha se um arquivo exportar não-componentes junto com componentes.
