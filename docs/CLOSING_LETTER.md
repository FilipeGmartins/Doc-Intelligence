# Carta de encerramento - DOC Intelligence

## Visão geral

Escolhi a Trilha B e implementei uma fatia vertical de front-end para recebimento,
processamento simulado, consulta e conferência de documentos. A entrega utiliza
somente dados fictícios e mantém API, banco e inteligência artificial atrás de
contratos e mocks substituíveis.

## 1. O que ficou de fora e por quê?

Ficaram de fora backend real, autenticação, autorização, armazenamento permanente
de arquivos, IA multimodal e integração oficial com WhatsApp. Também não foram
implementados fila distribuída, concorrência entre revisores, deduplicação por
hash, observabilidade ou controles de produção para dados pessoais.

Esses itens foram adiados porque a Trilha B pede o projeto do sistema e uma fatia
vertical demonstrável, não o produto completo. Priorizei o caminho de ponta a
ponta: vincular arquivos a clientes, simular classificação e extração, separar
baixa confiança, corrigir campos, aprovar ou recusar e consultar o histórico.
`DocumentRepository` e `AIProcessor` preservam as fronteiras para substituir os
mocks sem acoplar as páginas a uma tecnologia futura.

## 2. O que quebraria primeiro com volume dez vezes maior?

O primeiro limite seria o `localStorage`, seguido pelo processamento no navegador.
Ele não oferece capacidade, transações, compartilhamento, proteção de dados ou
controle de concorrência. Com aproximadamente 1.500 documentos por dia - e picos
ainda maiores - a listagem local, os previews temporários e a trilha editável não
seriam confiáveis.

Em produção, arquivos iriam diretamente para storage privado; uma API autenticada
persistiria metadados e eventos; e uma fila assíncrona distribuiria o processamento
entre workers com timeout, retentativas, idempotência e limite de custo. Hash de
conteúdo trataria duplicidade, enquanto paginação e versionamento otimista
protegeriam consultas e correções simultâneas.

## 3. Qual decisão eu menos defenderia hoje?

A decisão menos defensável fora do protótipo é usar `localStorage` como banco e
origem da trilha de auditoria. Ela acelerou a demonstração e permitiu recuperar o
estado após recarregar a página, mas eventos locais podem ser alterados, os
arquivos não persistem e dois funcionários não compartilham o mesmo estado.

Eu manteria a interface de repositório, mas substituiria sua implementação por uma
API autenticada antes de qualquer uso real. Os eventos seriam imutáveis e ligados
ao operador; o navegador receberia apenas os dados necessários e URLs assinadas de
curta duração. Essa troca preservaria os casos de uso já demonstrados.

## 4. Quanto tempo o trabalho levou?

O trabalho foi realizado incrementalmente em três sessões entre 30 de agosto e 1º
de setembro de 2026. Estimo aproximadamente sete horas de trabalho ativo, incluindo
análise, arquitetura, implementação, testes, correções, documentação, preparação da
carta e validação do deploy. Como não houve cronômetro contínuo desde o início, o
valor é uma estimativa baseada no histórico de commits e execuções.

## Encerramento

O resultado não pretende simular produção. Ele entrega uma base funcional,
testável e explicável, registra os riscos adiados e demonstra como o fluxo pode
evoluir para serviços seguros sem esconder as limitações do protótipo.
