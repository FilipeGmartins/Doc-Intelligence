# DOC Intelligence

Front-end para processamento e conferência assistida de documentos. Nesta versão,
a API, o banco de dados e os resultados de IA serão simulados de forma
determinística.

## Estado atual

A fatia vertical está funcional: Dashboard, upload múltiplo, processamento
simulado, fila de conferência, edição, aprovação e consulta pesquisável de
documentos. A aplicação também oferece tema claro/escuro e uma visão consolidada
da situação documental das pessoas cadastradas. A persistência local fica isolada
atrás do contrato de repositório.

O envio pode ser planejado por cliente: cada pessoa possui sugestões próprias e o
funcionário marca somente identidade, comprovante, contracheque, carteira de
trabalho, contrato, laudo, procuração ou outros arquivos aplicáveis. O mock também
registra duplicidade provável e o histórico das ações.

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior

## Como executar

```bash
npm install
npm run dev
```

O Vite informará a URL local no terminal.

## Verificações

```bash
npm run build
npm run lint
npm test
```

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Decisões](docs/DECISIONS.md)
- [Contrato da API](docs/API_CONTRACT.md)
- [Uso de IA](docs/AI_USAGE.md)
- [Prompts](docs/PROMPTS.md)
- [Changelog](docs/CHANGELOG.md)
- [Guia de demonstração](docs/DEMO_GUIDE.md)
- [Pontos de extensão](docs/INTEGRATION_ROADMAP.md)
- [Registro de tempo](docs/TIME_LOG.md)
- [Carta de encerramento](docs/CARTA_ENCERRAMENTO_DOC_INTELLIGENCE.docx)

Todos os dados funcionais usados no projeto serão fictícios.

Na área de Pessoas, cada cadastro pode ser editado para definir documentos exigidos e simular quais já foram recebidos. O status documental é atualizado automaticamente.

A automação demonstrativa de WhatsApp reutiliza o mesmo fluxo documental: cria um cadastro provisório, envia o arquivo para a Conferência e só marca o documento como recebido em Pessoas depois da aprovação humana. Nenhuma mensagem externa ou informação real é utilizada.

O ciclo agora é completo: a conferência pode aprovar ou recusar com um motivo. A
aprovação solicita automaticamente o próximo documento pendente e a recusa pede o
reenvio da mesma categoria na conversa simulada. O Dashboard apresenta essas
pendências como prioridades operacionais.

Os previews de arquivos enviados existem somente durante a sessão atual. Após recarregar, os metadados, resultados e eventos continuam disponíveis, mas o binário não é persistido.
