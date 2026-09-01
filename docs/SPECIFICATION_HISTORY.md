# Histórico da especificação e divergências

## Objetivo deste registro

Este documento separa a especificação inicial da descrição consolidada do sistema
implementado. Ele existe para não apresentar como planejamento anterior uma
documentação que foi ampliada durante e depois da implementação.

## Linha de base inicial

Em 30 de agosto de 2026, a escolha foi a **Trilha B**. O recorte inicial era uma
fatia vertical de front-end com dados fictícios: receber documentos, acompanhar o
processamento simulado, encaminhar baixa confiança para conferência, corrigir um
campo e consultar resultados. API, banco e IA seriam substituídos por mocks atrás
de contratos.

O primeiro commit (`9ee4081`) criou a fundação e o Dashboard. Os testes das regras
de processamento (`a2126cc`) e a primeira documentação de arquitetura, uso de IA e
trade-offs (`12439b8`) foram registrados antes da implementação do fluxo principal
de upload (`59294a8`). Portanto, houve planejamento incremental, mas não existiu
uma especificação completa e imutável antes da primeira linha de código. Essa é
uma limitação real do processo e não deve ser escondida.

## Evolução durante a implementação

O fluxo principal foi construído em pequenas etapas rastreáveis:

1. upload e processamento simulado (`59294a8`);
2. conferência, correção e aprovação (`189d28d`);
3. listagem e busca de documentos (`c2d54dc`);
4. tema escuro e visão de pessoas (`fd33a86`);
5. atendimento de WhatsApp simulado (`bb49398`);
6. requisitos documentais individualizados (`ec0420d`);
7. edição de pessoas, recusa, reenvio e cadastro rápido (`7554406`, `8d0e27b`,
   `bae5c0e`);
8. validação de identificadores e recuperação local (`a604a68`, `77f4624`).

A especificação completa em `PROJECT_REQUIREMENTS.md` foi consolidada depois
dessas etapas. Ela é uma especificação **as built**: descreve fielmente o estado
entregue, os limites e o caminho de evolução, mas não substitui este registro da
linha de base.

## Divergências em relação ao recorte inicial

Não houve remoção dos comportamentos centrais da Trilha B. Houve expansão de
escopo, principalmente em experiência e demonstração:

- tema claro/escuro e indicadores de conformidade por pessoa;
- requisitos diferentes para cada cliente;
- simulação do primeiro contato por WhatsApp;
- recusa com motivo e solicitação simulada de reenvio;
- cadastro rápido de cliente durante o envio;
- validações adicionais de CPF e RG e migração do armazenamento local.

Essas expansões não são requisitos obrigatórios do enunciado. Foram mantidas
porque reutilizam os mesmos serviços e demonstram como os documentos entram no
fluxo operacional, sem integrar sistemas reais.

## Decisões que permaneceram inalteradas

- usar somente dados fictícios;
- não chamar IA, WhatsApp, autenticação, banco ou API reais;
- exigir conferência abaixo de `0.80` de confiança;
- separar correção de aprovação explícita;
- manter `DocumentRepository` e `AIProcessor` como fronteiras substituíveis;
- registrar riscos de latência, custo, duplicidade, dados sensíveis, picos de
  volume, troca de modelo e concorrência entre conferentes.

## Itens deliberadamente não implementados

Backend autenticado, banco compartilhado, storage privado, filas, OCR/IA real,
WhatsApp Business, idempotência transacional, concorrência multiusuário,
observabilidade e controles de LGPD permanecem fora desta fatia. Eles estão
descritos como riscos e evolução futura, não como capacidades do protótipo.

## Fontes de rastreabilidade

- `git log`: ordem e conteúdo dos commits;
- `ARCHITECTURE.md`: arquitetura e fatos do ambiente;
- `DECISIONS.md`: decisões e trade-offs;
- `PROMPTS.md`: solicitações do usuário em ordem;
- `CHANGELOG.md`: evolução funcional;
- `PROJECT_REQUIREMENTS.md`: especificação consolidada do estado entregue.
