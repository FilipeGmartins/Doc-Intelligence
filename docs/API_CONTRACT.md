# Contrato inicial da API

Contrato conceitual para futura API REST. Datas usam ISO 8601, confiança varia de
`0` a `1` e respostas de sucesso envolvem o resultado em `data`.

## Documento

Campos principais: `id`, `originalFileName`, `suggestedFileName`, `mimeType`,
`sizeInBytes`, `documentType`, `status`, `confidence`, `extractedFields`,
`createdAt`, `updatedAt`, `approvedAt` e `processingError`.

## Endpoints

### `POST /documents`

Recebe `multipart/form-data` com um ou mais arquivos. Retorna `201` com os
documentos criados em estado `pending`.

### `GET /documents`

Aceita `status` e `query` como filtros opcionais. Retorna `200` com uma lista.

### `GET /documents/:id`

Retorna `200` com o documento ou `404` com `DOCUMENT_NOT_FOUND`.

### `PATCH /documents/:id`

Aceita `suggestedFileName`, `documentType` e/ou `extractedFields`. Retorna o
documento atualizado.

Exemplo de edição futura:

```json
{
  "updatedAt": "2026-08-30T18:30:00.000Z",
  "extractedFields": [
    {
      "id": "field-cpf-joao",
      "value": "000.111.222-44",
      "manuallyEdited": true
    }
  ]
}
```

Se `updatedAt` estiver desatualizado, a API futura poderá responder `409` com
`DOCUMENT_VERSION_CONFLICT`. Controle de concorrência não está implementado nesta
fatia.

### `POST /documents/:id/reprocess`

Reinicia um documento com falha ou resultado revisável. Retorna `202` com o novo
estado de processamento.

### `POST /documents/:id/approve`

Aprova um documento processado ou revisado. Retorna `200` com `status: approved`.

## Erros

```json
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Documento não encontrado."
  }
}
```

Códigos iniciais: `INVALID_FILE`, `DOCUMENT_NOT_FOUND`, `INVALID_STATUS_TRANSITION`
e `PROCESSING_FAILED`.

Paginação, idempotência, controle otimista e versionamento formal não estão
implementados nesta fatia, mas deverão ser definidos antes de uma API de produção.

## Pessoas

### `GET /people`

Aceita `query` e `status` como filtros opcionais. O status documental pode ser
`complete`, `pending_document` ou `update_required`. Retorna dados cadastrais
resumidos, quantidade de documentos, pendências e data da última atualização.

Detalhe e edição de pessoas não fazem parte desta fatia.
