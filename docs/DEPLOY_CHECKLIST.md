# Checklist de implantação

## Antes de publicar

- Executar `npm run build`, `npm run lint` e `npm test`.
- Confirmar que os dados presentes no repositório e na demonstração são fictícios.
- Revisar o domínio e as variáveis de ambiente do projeto na Vercel.
- Ativar a proteção de implantação ou autenticação da equipe na Vercel. O front-end não deve simular esse controle.

## Depois de publicar

- Executar `npm run test:smoke -- https://endereco-do-deploy`.
- Abrir diretamente `/upload`, `/documents`, `/review`, `/people` e `/whatsapp` para confirmar o fallback da SPA.
- Conferir os fluxos de cadastro rápido, envio, revisão, aprovação, recusa e tema escuro.
- Verificar a interface em viewport móvel e a navegação por teclado.
- Inspecionar o console do navegador e os logs da Vercel.

## Limites desta demonstração

- `localStorage` não oferece persistência compartilhada, controle de acesso ou trilha imutável.
- Arquivos não são enviados a armazenamento remoto; somente metadados simulados permanecem após recarregar.
- A proteção real precisa ser configurada na plataforma de hospedagem ou em uma futura camada de autenticação/backend.

## Resultado da validação em 1º de setembro de 2026

- O GitHub registra o deployment de produção do commit `a8ecbcd` como concluído.
- A URL específica da Vercel responde, mas redireciona visitantes não autenticados
  para o login da plataforma porque a proteção do deployment está ativa.
- O smoke test externo recebeu HTTP `200` em todas as rotas, porém marcou falha
  corretamente porque o conteúdo retornado era a autenticação da Vercel, e não o
  elemento `#root` da aplicação.
- O mesmo build de produção foi servido localmente e passou no smoke test para
  `/`, `/upload`, `/documents`, `/review`, `/people` e `/whatsapp`.
- A validação manual confirmou seleção de cliente fictício, upload, processamento,
  consulta do resultado, fila de conferência, campos editáveis, ações explícitas
  de aprovação/recusa, alternância de tema, viewport móvel de 390 x 844 e controle
  focável por teclado.
- Após a conclusão do 2FA, a inspeção autenticada abriu a aplicação real na URL
  protegida, sem redirecionamento para a tela de login.
- As rotas `/`, `/upload`, `/documents`, `/review`, `/people` e `/whatsapp`
  renderizaram o conteúdo funcional esperado quando acessadas diretamente na
  sessão autenticada.
- No ambiente online, a validação manual selecionou a cliente fictícia Ana Paula
  Lima, enviou um PDF de demonstração, concluiu o processamento determinístico
  com 91% de confiança e confirmou o novo registro na listagem de documentos.
- A fila de conferência permaneceu disponível, a alternância entre os temas
  claro e escuro funcionou e o console do navegador não apresentou erros ou
  avisos durante o roteiro autenticado.
- O smoke test anônimo continua bloqueado intencionalmente pela proteção da
  Vercel; esse resultado não indica falha da aplicação e preserva o requisito de
  não expor o sistema a navegadores anônimos.
