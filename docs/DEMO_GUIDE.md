# Guia de demonstração

## 1. Plano documental por cliente

1. Abra **Enviar documentos**.
2. Selecione **Carlos Eduardo Santos**.
3. Observe que identidade, comprovante de residência e contracheque são sugeridos.
4. Desmarque ou acrescente tipos para demonstrar que cada cliente tem requisitos próprios.
5. Anexe arquivos fictícios apenas aos tipos disponíveis.

## 2. Cenários reproduzíveis

- Nome comum: processamento com alta confiança.
- Nome contendo `revisao`: baixa confiança e envio para conferência.
- Nome contendo `falha`: falha simulada e opção de tentar novamente.
- Reenvio do mesmo nome e tamanho para o mesmo cliente: aviso de possível duplicidade.

## 3. Conferência humana

1. Processe um arquivo com `revisao` no nome.
2. Abra **Conferência** e selecione o documento.
3. Altere um campo de baixa confiança.
4. Salve a correção e confirme a marcação de edição manual.
5. Aprove o documento.
6. Confira o histórico de eventos no final da tela.

## 4. Outros tipos suportados

Selecione contracheque, carteira de trabalho ou contrato no checklist. O mock
retorna campos e nomes padronizados específicos para cada tipo.

Todos os dados exibidos são fictícios. O protótipo não envia arquivos ou dados
para serviços externos.
