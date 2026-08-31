# DOC Intelligence - instruções para agentes

## Objetivo e escopo

- Implementar a Trilha B como front-end React + TypeScript com API, banco e IA simulados.
- Priorizar uma fatia vertical pequena, funcional, rastreável e demonstrável.
- Usar apenas dados, nomes, documentos e contatos fictícios.
- Não integrar IA, WhatsApp, autenticação, Supabase ou APIs reais sem solicitação explícita.

## Arquitetura

- Componentes e páginas consomem hooks ou serviços; nunca acessam mocks ou `localStorage` diretamente.
- Casos de uso ficam nos serviços e persistência fica atrás de interfaces de repositório.
- Processadores de documentos implementam `AIProcessor`; o mock atual deve continuar substituível.
- Resultados simulados devem ser determinísticos e reproduzíveis por testes.
- Preserve `DocumentRepository` e `AIProcessor` como pontos de extensão para API e IA futuras.

## Regras funcionais

- Confiança abaixo de `0.80` exige conferência humana.
- Salvar uma correção não aprova o documento; aprovação deve ser uma ação explícita.
- Registre upload, processamento, correção, falha e aprovação na trilha de eventos.
- Detecte possível duplicidade antes de criar um novo registro.
- Requisitos documentais variam por cliente; não imponha a mesma lista a todos.

## Interface

- Preserve a identidade azul, o tema claro/escuro e os ícones Lucide existentes.
- Inclua estados de carregamento, erro, vazio e sucesso.
- Mantenha controles acessíveis por teclado, com rótulos e foco visível.

## Rastreabilidade e validação

- Registre prompts do usuário em `docs/PROMPTS.md`, na ordem original.
- Registre decisões e trade-offs em `docs/DECISIONS.md`.
- Registre erros relevantes da IA e suas correções em `docs/AI_USAGE.md`.
- Atualize `docs/CHANGELOG.md` a cada fatia funcional.
- Antes de concluir, execute `npm run build`, `npm run lint` e `npm test`.
- Crie commits pequenos por etapa e só publique branches quando o usuário solicitar.
