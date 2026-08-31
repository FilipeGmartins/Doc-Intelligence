# Arquitetura

## Visão geral

O DOC Intelligence é uma aplicação React para funcionários enviarem documentos,
acompanharem um processamento simulado, revisarem extrações com baixa confiança e
aprovarem o resultado.
O produto também apresenta a situação documental das pessoas cadastradas por meio
de um serviço mockado independente.

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

O catálogo demonstrativo de pessoas segue um contrato próprio:

```text
PeoplePage -> usePeople -> PersonService -> mockPeople
```

O tema é estado de interface compartilhado por `ThemeProvider`. A preferência é
o único dado visual persistido diretamente no navegador, pois não representa dado
de negócio e deve permanecer específico do dispositivo.

## Substituição futura

Uma integração real implementará `DocumentRepository` e será selecionada no ponto
de composição da aplicação. As páginas continuarão consumindo o mesmo contrato de
serviço. Upload binário e processamento assíncrono real poderão exigir pequenos
ajustes no contrato, mas não uma reescrita da interface.

## Evolução para edição e persistência reais

### Envio de arquivos

No mock, `DocumentService.upload()` recebe objetos `File`, cria registros locais e
mantém uma `blob URL` temporária para imagens. Em produção, o mesmo caso de uso
deverá enviar `multipart/form-data` para `POST /documents`. O backend armazenará o
binário em um bucket privado e salvará no banco apenas metadados, estado e a chave
do objeto. A interface não receberá uma URL pública permanente; solicitará uma URL
assinada e curta quando precisar do preview.

### Edição

A tela de detalhes carregará o documento por `getById()`, manterá uma cópia dos
campos em estado local e enviará apenas as alterações por `update()`. O serviço
comparará valores anteriores e novos para aplicar `manuallyEdited: true`. Em uma
API real, `PATCH /documents/:id` deverá receber também uma versão ou `updatedAt`
para detectar revisão concorrente.

### Banco de dados

O componente não será conectado diretamente ao banco. Uma implementação
`ApiDocumentRepository` ou `SupabaseDocumentRepository` substituirá o mock no
ponto de composição:

```text
DocumentService
  -> DocumentRepository
      -> MockDocumentRepository       (desenvolvimento atual)
      -> ApiDocumentRepository        (API REST futura)
      -> SupabaseDocumentRepository   (alternativa futura)
```

Uma estrutura relacional mínima teria `documents`, `extracted_fields` e,
posteriormente, `people`, `person_documents` e `document_events` para auditoria. Arquivos ficariam em storage
privado, nunca dentro das tabelas nem no `localStorage`.

## Limitações reconhecidas

O mock não resolve segurança de dados pessoais, armazenamento binário, filas
distribuídas, deduplicação robusta, custo por processamento, versionamento de
modelos/prompts ou revisão concorrente. Não implementado nesta fatia porque o foco
é validar o fluxo front-end completo.
