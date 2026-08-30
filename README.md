# DOC Intelligence

Front-end para processamento e conferência assistida de documentos. Nesta versão,
a API, o banco de dados e os resultados de IA serão simulados de forma
determinística.

## Estado atual

A fundação React + TypeScript + Vite, o Dashboard e o fluxo de upload/processamento
simulado estão configurados. Conferência, edição e aprovação serão implementadas
incrementalmente.

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
