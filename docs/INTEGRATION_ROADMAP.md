# Pontos de extensão futuros

## Processamento real

`DocumentService` depende do contrato `AIProcessor`. Uma implementação futura,
como `RemoteAIProcessor`, poderá chamar um backend sem alterar páginas ou regras de
conferência. Ela deverá controlar timeout, custo, versão de modelo e versão de
prompt.

## Persistência e API

`DocumentRepository` delimita a persistência. `ApiDocumentRepository` ou
`SupabaseDocumentRepository` poderão substituir o mock no ponto de composição.
O navegador não deverá acessar diretamente banco, chaves de storage ou provedor de
IA.

## Arquivos

Em produção, o binário irá para storage privado. O banco guardará somente a chave,
metadados, hash e eventos. O preview utilizará URL assinada e curta.

## Segurança e integração interna

Uma API interna deverá exigir autenticação, autorização por perfil, auditoria,
criptografia, política de retenção e proteção compatível com dados pessoais. Os
contratos em `API_CONTRACT.md` são a base conceitual, não uma API em produção.

## Automação de atendimento

O experimento de WhatsApp agora compartilha o fluxo de pessoas, documentos e
conferência nesta branch. Ele continua inteiramente local e determinístico. Uma
integração futura deverá substituir apenas o adaptador de entrada por webhooks
oficiais, com consentimento, idempotência e tratamento de reentregas.
