# Carta de encerramento - DOC Intelligence

## Visão geral

Escolhi a Trilha B e implementei uma fatia vertical de front-end para recebimento,
processamento simulado, consulta e conferência de documentos. O fluxo permite
vincular documentos a clientes, escolher requisitos diferentes para cada pessoa,
acompanhar o processamento, corrigir campos de baixa confiança e aprovar o
resultado. API, banco de dados e inteligência artificial foram representados por
contratos e implementações mockadas, com dados exclusivamente fictícios.

## 1. O que ficou de fora e por quê?

Ficaram de fora backend real, autenticação, autorização, storage de arquivos,
integração com Supabase, processamento por IA multimodal e comunicação real com
WhatsApp. Também não implementei fila distribuída, concorrência entre revisores,
deduplicação por hash, paginação ou observabilidade de produção.

Esses itens foram deliberadamente adiados porque a entrega é da Trilha B e pede
uma fatia vertical demonstrável, não o produto-alvo completo. Em vez de criar
integrações superficiais, priorizei o fluxo que permite avaliar arquitetura e
experiência: upload, status, resultado específico por tipo, baixa confiança,
conferência, correção e aprovação. `DocumentRepository` e `AIProcessor` deixam
pontos explícitos para substituir os mocks futuramente sem reescrever as páginas.

## 2. O que quebraria primeiro com volume dez vezes maior?

O primeiro limite seria a persistência em `localStorage`, seguida pelo
processamento mantido no navegador. O armazenamento é pequeno, local a um único
dispositivo e não oferece transações, controle de concorrência ou proteção
adequada para dados sensíveis. Uma lista muito grande também exigiria paginação e
busca no servidor.

Em produção, os arquivos seriam enviados diretamente para storage privado, os
metadados e eventos seriam persistidos por uma API e o processamento ocorreria em
fila assíncrona. Workers independentes controlariam timeout, retentativa e limite
de custo. A consulta usaria paginação e filtros no backend. Hash de conteúdo e
chaves de idempotência substituiriam a comparação local usada nesta demonstração.

## 3. Qual decisão eu menos defenderia hoje?

A decisão menos defensável fora do protótipo é usar `localStorage` como banco
mockado e como origem da trilha de auditoria. Ela foi útil para demonstrar
persistência após recarregar a página e permitiu manter todo o exercício no
front-end. Entretanto, eventos locais podem ser alterados, arquivos não cabem de
forma segura e dois funcionários não compartilham o mesmo estado.

Eu manteria a interface de repositório, mas substituiria a implementação por uma
API autenticada antes de qualquer uso real. Os eventos passariam a ser imutáveis e
associados à identidade do funcionário. O navegador receberia apenas os dados
necessários para a tela e URLs assinadas de curta duração para visualizar arquivos.

## 4. Quanto tempo o trabalho levou?

O trabalho foi desenvolvido incrementalmente em duas sessões entre 30 e 31 de
agosto de 2026. Com base no histórico de commits e execuções, estimo
aproximadamente cinco horas de trabalho ativo. Esse tempo inclui análise do
enunciado, decisões de arquitetura, implementação das telas e serviços mockados,
testes, correções e documentação. Como não foi utilizado cronômetro contínuo desde
a primeira conversa, o valor é apresentado como estimativa, e não como medição
exata.

## Encerramento

O resultado não pretende simular produção. Ele demonstra uma arquitetura
substituível e um fluxo interno coerente, mantendo visíveis os riscos que foram
adiados. O foco foi entregar uma base pequena, testável e explicável, com decisões
rastreáveis e espaço claro para evolução.
