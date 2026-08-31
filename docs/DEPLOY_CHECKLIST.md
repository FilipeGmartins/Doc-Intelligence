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
