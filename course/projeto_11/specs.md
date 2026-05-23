[Objetivo]: Desenvolva uma solução de envio e recuperação de arquivos Web na AWS, onde o serviço de armazenamento de objetos AWS S3 será utilizado.
[Escopo]: Conversor de Documentos (Markdown para PDF)
Uma aplicação focada em produtividade acadêmica ou corporativa.
Como funciona: O usuário envia um arquivo de texto simples ou Markdown via web. A Lambda processa esse texto, aplica um template CSS padrão, converte o conteúdo para PDF e faz o upload.
O que vai para o S3: O PDF finalizado. Quando o usuário clica em "Atualizar Lista" (GET), ele vê o PDF pronto para download e leitura.
[Abordagem]: "Proxy Pass" (Upload via Back-end)
Esta é a ideia mais linear e tradicional. A sua função Lambda atua como o motor de transferência do arquivo.
Fluxo de Envio (POST/PUT): O Javascript no front-end (Amplify) envia o arquivo físico para o seu domínio customizado (Route 53). O API Gateway recebe esse payload e aciona a Lambda. A Lambda, escrita em Node.js, pega esse arquivo em memória e o escreve no S3.
Fluxo de Recuperação (GET): O front-end faz uma requisição GET para a API. A Lambda vai até o S3, busca o arquivo e o devolve no corpo da resposta HTTP.
Quando escolher: É excelente para um MVP rápido onde você tem certeza de que os arquivos serão pequenos (ex: imagens de perfil, PDFs de poucas páginas).
Ponto de atenção: O API Gateway tem um limite de payload (geralmente 10MB). Se você tentar enviar arquivos grandes, a requisição será bloqueada antes mesmo de chegar na Lambda.
[Front-end]:
- AWS amplify;
- Tecnologias: html + css + js;
[Back-end]:
- AWS route 53 + certificate: configuração de DNS;
- AWS API gateaway: api com métodos POST, PUT, GET;
- AWS lambda: conectivo entre S3 e Aplicação e NodeJS para especificação;
- AWS S3: bucket que será utilizado.
[Fluxo]
- Desenvolver front-end
- teste local
- upar no amplify e configurar dns público
- criar aws lambda
- criar api gateway com métodos (POST, PUT GET)
- configurar dns e certificado da api
- integração final
[Requisitos]:
- Arquivos organizados conforme projetos web com pastas: src, img, js, assets e arquivos: index.html;
- Gera markdown técnico listando etapas de implementação de maneira ordenada;
- Gera markdown do projeto.
[Evidências]:
1. Do bucket criado, mostrando os arquivos que estão lá (adicionar a informação da sua conta no canto superior direito);
2. Do envio de um arquivo pela interface Web, no formato do seu DNS (operação POST ou PUT);
3. Da leitura de um arquivo pela interface Web, no formato do seu DNS (operação GET);
4. A mesma imagem do seu bucket com a lista dos arquivos atualizada.