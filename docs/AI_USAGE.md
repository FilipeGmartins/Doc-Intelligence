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

Os resultados foram conferidos por build TypeScript, lint, testes focados e
inspeção dos fluxos no navegador. Na versão final desta etapa, `npm run build`,
`npm run lint` e `npm test` foram executados com sucesso; a suíte possui 39 testes
distribuídos em 10 arquivos. Os requisitos foram comparados com a Definition of
Done e com os fatos do ambiente descritos no enunciado.

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
- A união automática encontrou conflitos nos serviços de pessoa, modelos, estilos e documentação porque as duas branches evoluíram a partir do mesmo ponto.
- A correção preservou o modelo documental mais recente e consolidou a persistência de pessoas em um único repositório assíncrono, reutilizado pelo WhatsApp e pela Conferência.

### Erro observado e correção

Uma versão intermediária tratava a URL temporária de preview como se pudesse ser
reutilizada depois de recarregar a página. A inspeção no navegador mostrou que a
`blob URL` deixava de representar o arquivo, embora os metadados permanecessem no
`localStorage`. A correção removeu URLs temporárias da persistência, manteve o
preview somente na sessão do envio e passou a explicar a limitação quando o
binário não está disponível. O episódio também originou uma decisão arquitetural
explícita sobre storage privado e URLs assinadas futuras.

## Estado final do uso de IA

O agente apoiou análise, implementação, revisão, documentação e execução de
verificações, mas nenhuma resposta foi aceita como evidência por si só. Código e
decisões foram confrontados com testes, build, lint, histórico Git e inspeção da
interface. O produto entregue não utiliza IA real: `MockAIService` implementa o
contrato `AIProcessor` com resultados fictícios e reproduzíveis.
