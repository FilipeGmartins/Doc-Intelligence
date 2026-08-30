# Arquitetura

## Visão geral

O DOC Intelligence é uma aplicação React para funcionários enviarem documentos,
acompanharem um processamento simulado, revisarem extrações com baixa confiança e
aprovarem o resultado.

## Fluxo de dados

```text
Página/componente
  -> DocumentService
  -> DocumentRepository
  -> MockDocumentRepository
  -> MockDatabase
  -> localStorage
```

O processamento segue um ramo separado, coordenado pelo serviço:

```text
DocumentService -> MockAIService -> resultado fictício determinístico
```

## Responsabilidades

- **Interface:** apresentação, acessibilidade e ações do usuário.
- **Hooks:** estado assíncrono e coordenação das páginas quando houver reutilização.
- **DocumentService:** casos de uso e transições de estado.
- **DocumentRepository:** contrato de persistência.
- **MockDocumentRepository:** implementação local do contrato.
- **MockDatabase:** serialização e acesso exclusivo ao `localStorage`.
- **MockAIService:** atraso e resultados fictícios reproduzíveis.

Componentes não acessam diretamente `localStorage`, mocks ou Supabase.

## Substituição futura

Uma integração real implementará `DocumentRepository` e será selecionada no ponto
de composição da aplicação. As páginas continuarão consumindo o mesmo contrato de
serviço. Upload binário e processamento assíncrono real poderão exigir pequenos
ajustes no contrato, mas não uma reescrita da interface.

## Limitações reconhecidas

O mock não resolve segurança de dados pessoais, armazenamento binário, filas
distribuídas, deduplicação robusta, custo por processamento, versionamento de
modelos/prompts ou revisão concorrente. Não implementado nesta fatia porque o foco
é validar o fluxo front-end completo.
