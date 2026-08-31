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

Uma automação demonstrativa de WhatsApp permite simular coleta guiada de dados,
recebimento de documento, pré-cadastro, validação interna e conversão em pessoa.
Nenhuma mensagem externa ou dado pessoal real é utilizado.

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

Todos os dados funcionais usados no projeto serão fictícios.
