# AGENTS.md

## Comunicação

- Respostas concisas e diretas. Sem preâmbulo, sem recapitular o que o usuário disse, sem fechamento do tipo "espero ter ajudado".
- Só detalhar ou explicar se o usuário pedir.
- Ao concluir uma tarefa: 1-3 linhas dizendo o que mudou e o que ficou pendente.
- Não repetir código inalterado. Mostrar apenas o diff ou o trecho relevante.
- Responder no idioma do usuário (pt-BR).

## Eficiência de tokens

- Ler só o necessário: usar grep/glob para localizar e ler faixas de linhas, não arquivos inteiros.
- Não reler arquivos já lidos na sessão, a menos que tenham mudado.
- Não listar diretórios grandes (node_modules, target, build, dist, .git).
- Saídas longas de comandos: filtrar com `head`, `tail`, `grep`.
- Preferir editar o trecho a reescrever o arquivo.
- Não criar arquivos de documentação, testes ou exemplos que não foram pedidos.

## Fluxo de trabalho

1. Tarefas pequenas e claras: executar direto.
2. Tarefas médias ou grandes: entrar em plan mode antes de editar.
3. Após editar: rodar build/testes/lint e corrigir antes de dar a tarefa como concluída.
4. Em caso de ambiguidade real, fazer UMA pergunta objetiva. Caso contrário, assumir o padrão mais razoável e informar a suposição.

## Plan mode (boas práticas)

- Plan mode é somente leitura: explorar, analisar e propor, sem alterar nada.
- Plano curto: objetivo, arquivos afetados, passos numerados, riscos, como verificar.
- Não gastar o plano com o que é óbvio. Listar só decisões e trade-offs.
- Apresentar alternativas apenas se houver trade-off real, com recomendação.
- Esperar aprovação antes de executar.
- Para planos longos, salvar em `PLAN.md` e executar passo a passo, marcando o que foi feito. Isso permite limpar o contexto e retomar.
- Cada passo do plano deve ser verificável (teste, comando ou resultado esperado).

## Gestão de contexto

- Uma tarefa por sessão. Ao mudar de assunto, limpar o contexto (`/clear` ou `/new`).
- Ao se aproximar de ~50% da janela, compactar (`/compact` ou `/compact <foco>`) ou salvar o estado em arquivo e reiniciar.
- Delegar pesquisas e explorações amplas a subagentes: só o resumo volta ao contexto principal.
- Referenciar arquivos específicos (`@arquivo`) em vez de pedir "olhe o projeto".
- Fixar convenções do projeto aqui, não repetir em cada prompt.
- Manter este arquivo curto (idealmente < 100 linhas). Conhecimento específico vai em docs separados, lidos sob demanda.
- Desativar MCPs e ferramentas que não estão em uso, pois as definições deles ocupam contexto.
- Logs e stack traces: colar só o trecho relevante.
- Ao retomar trabalho, gravar o estado em `NOTES.md` (feito / pendente / decisões) e ler só esse arquivo.

## Projeto (preencher)

- Stack: <ex.: Java 25, Spring Boot, Maven>
- Build: `<comando>`
- Testes: `<comando>`
- Lint/format: `<comando>`
- Estrutura: <pastas principais em uma linha cada>
- Convenções: <nomes, padrões, o que evitar>

## Limites

- Nunca commitar, fazer push ou apagar arquivos sem pedido explícito.
- Nunca ler ou expor `.env`, chaves e credenciais.
- Antes de comandos destrutivos ou de instalar dependências, confirmar.
