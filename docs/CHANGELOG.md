# Changelog

## Em desenvolvimento

### Adicionado

- Fundação React, TypeScript e Vite.
- React Router e Lucide React.
- Vitest e Testing Library.
- Modelo de documento e contratos iniciais de serviço e repositório.
- Regra de confiança coberta por testes unitários.
- Banco mockado persistente, repositório e serviço de documentos.
- Processamento simulado determinístico com sucesso, revisão e falha.
- Layout responsivo, navegação e Dashboard conectado ao serviço.
- Upload múltiplo com validação, drag and drop e processamento simulado.
- Fila de conferência e formulário provisório com salvamento e aprovação separados.
- Listagem de documentos com busca, filtro de status e acesso ao detalhe.
- Tema escuro persistente, com preferência inicial baseada no sistema operacional.
- Visão de pessoas com busca, filtros e indicadores de conformidade documental.
- Refinamentos de identidade na navegação, títulos e superfícies da aplicação.
- Plano documental por cliente com checklist e anexos separados por tipo.
- Extrações específicas para identidade, comprovante, contracheque, carteira de trabalho e contrato.
- Detecção local de possível duplicidade e trilha de auditoria por documento.
- Contratos explícitos para substituição futura do processador e repositório mockados.
- Teste de interface do envio vinculado ao cliente.
- Documentação de arquitetura, decisões, API e uso de IA.
- Recusa documental com motivo, status próprio e evento na trilha de auditoria.
- Solicitação automática de reenvio ou do próximo documento pendente no WhatsApp simulado.
- Central operacional no Dashboard com prioridades de documentos, atendimentos e pessoas.
- Cadastro rápido de cliente dentro do envio, com requisitos próprios e seleção automática.
- Atalho “Novo cliente” no Dashboard e prevenção local de duplicidade por identificação ou e-mail.
- CPF restrito a 11 números no cadastro, WhatsApp simulado, Pessoas e Conferência.
- RG limitado a 9 caracteres alfanuméricos, com mensagens acessíveis e validação também nos serviços.

### Decidido

- Persistência local atrás de um repositório.
- Threshold inicial de confiança em `0.80`.
- Cenários de processamento reproduzíveis.
- Edição de dados e requisitos documentais diretamente na área de Pessoas.
- Checkboxes separados para documentos exigidos e documentos recebidos.
- Inclusão de cheque bancário, além de carteira de trabalho e contracheque.
- Recálculo automático de pendências após a edição do cliente.
- Persistência simulada das pessoas atrás de uma interface de repositório.
- União do atendimento mockado por WhatsApp com o fluxo documental principal.
- Criação automática de pessoa provisória e documento em revisão a partir da conversa.
- Correção de cliente e categoria diretamente na conferência documental.
- Aprovação documental atualizando automaticamente a situação da pessoa.
- Metadados e idioma da página alinhados à identidade DOC Intelligence.
- URLs temporárias de preview mantidas apenas durante a sessão do envio.
- Mensagem explícita quando o binário não está mais disponível após recarregar.
- Orquestração das decisões de conferência em um serviço de fluxo separado, preservando os contratos de integração futura.
