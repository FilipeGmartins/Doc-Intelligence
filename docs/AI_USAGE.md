# Uso de inteligência artificial

## Ferramenta

Codex, agente baseado em GPT-5, foi usado como apoio de engenharia de software e
Product Design.

## Finalidade

- Analisar e decompor requisitos.
- Propor arquitetura, contratos e decisões.
- Gerar e revisar código e documentação.
- Executar verificações automatizadas.

## Validação

Resultados serão conferidos por build TypeScript, lint, testes focados e inspeção
do fluxo implementado. Requisitos serão rastreados contra a Definition of Done.

## Correções e decisões humanas

- A arquitetura foi apresentada antes da implementação e aprovada pelo usuário.
- A stack obrigatória prevaleceu sobre alternativas de scaffold ou hospedagem.
- Commits e publicações foram executados apenas após solicitação ou dentro de uma
  branch explicitamente criada para a etapa.

## Erros e rejeições

- A primeira tentativa de executar o gerador do Vite ficou sem resposta devido ao
  acesso restrito à rede. A execução foi interrompida e repetida com autorização.
- Tailwind e bibliotecas de componentes foram adiados porque ainda não há telas que
  justifiquem essa complexidade.
- O produto começou a acumular extensões de Pessoas e WhatsApp. Para preservar o
  foco do desafio, a evolução documental foi isolada em branch sem o WhatsApp.

Este documento será atualizado durante o desenvolvimento.

### Integração das branches de completude e WhatsApp

- A união automática encontrou conflitos nos serviços de pessoa, modelos, estilos e documentação porque as duas branches evoluíram a partir do mesmo ponto.
- A correção preservou o modelo documental mais recente e consolidou a persistência de pessoas em um único repositório assíncrono, reutilizado pelo WhatsApp e pela Conferência.
