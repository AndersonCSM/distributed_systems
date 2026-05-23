# 📋 Etapas de Implementação — Web Tools: Conversor Markdown → PDF

## Fase 1 — Front-end (Desenvolvimento Local)

### 1.1 Estrutura de Pastas

Criar a organização do projeto conforme padrão web:

```
web-tools/
├── index.html
├── src/
│   └── css/
│       └── style.css
├── js/
│   └── app.js
├── img/
├── assets/
├── specs.md
├── etapas.md
└── README.md
```

### 1.2 Design System (`src/css/style.css`)

- Importação da fonte **Inter** (Google Fonts) para tipografia moderna
- Definição de tokens de design (cores, bordas, sombras, transições)
- Tema **dark mode** com fundo `#0a0e1a` e efeitos de **glassmorphism**
- Componentes estilizados: cards, drop zone, botões, toasts, lista de PDFs, badges
- Layout responsivo com media queries para telas menores que 640px
- Micro-animações: float (header), spin (spinner), pulse (badge), toastIn/toastOut

### 1.3 Página Principal (`index.html`)

- Estrutura semântica HTML5 com `<header>`, `<section>`, `<footer>`
- Meta tags de SEO: description, theme-color, viewport
- **Card "Enviar Documento"**: drop zone com drag-and-drop, preview do arquivo selecionado, barra de progresso, botão "Converter para PDF"
- **Card "PDFs Gerados"**: lista dinâmica de PDFs com botão de download individual, botão "Atualizar Lista"
- **Status badge**: indicador visual da conexão com a API (Online/Offline)
- **Toast container**: notificações flutuantes para feedback ao usuário

### 1.4 Lógica JavaScript (`js/app.js`)

- **Configuração centralizada**: `CONFIG.API_BASE_URL` apontando para o domínio customizado da API
- **Drag & Drop**: eventos `dragenter`, `dragover`, `dragleave`, `drop` na drop zone
- **Validação de arquivo**: extensões permitidas (`.md`, `.txt`, `.markdown`), limite de 10MB
- **Upload (POST /convert)**: leitura do conteúdo do arquivo como texto, envio via `fetch` com `Content-Type: application/json`, corpo com `filename` e `content`
- **Listagem (GET /files)**: busca a lista de PDFs do S3 e renderiza na interface
- **Download (GET /files/{filename})**: recebe PDF em base64 via JSON, decodifica com `atob()`, cria `Blob` e dispara download
- **Health check**: verifica status da API usando o endpoint `/files` ao carregar a página
- **Toasts**: notificações animadas de sucesso, erro e informação com auto-dismiss

### 1.5 Teste Local

- Abrir `index.html` no navegador
- Verificar layout responsivo, animações e interações
- Validar seleção de arquivo via clique e drag-and-drop

---

## Fase 2 — AWS S3 (Bucket de Armazenamento)

### 2.1 Criar o Bucket

| Configuração | Valor |
|-------------|-------|
| **Bucket name** | `web-tools-pdfs-anderson` |
| **Region** | `us-east-1` |
| **Object Ownership** | ACLs disabled |
| **Block all public access** | ✅ Ativado |
| **Bucket Versioning** | Disabled |
| **Encryption** | SSE-S3 (padrão) |

> O bucket NÃO precisa ser público. O acesso é feito exclusivamente pela Lambda via IAM Role.

---

## Fase 3 — AWS Lambda (Back-end)

### 3.1 Criar a Função Lambda

| Configuração | Valor |
|-------------|-------|
| **Function name** | `web-tools-converter` |
| **Runtime** | Node.js 20.x |
| **Architecture** | x86_64 |
| **Execution role** | LabRole (AWS Academy) |
| **Handler** | `index.handler` |
| **Memory** | 1024 MB |
| **Timeout** | 30 segundos |

### 3.2 Variável de Ambiente

| Key | Value |
|-----|-------|
| `BUCKET_NAME` | `web-tools-pdfs-anderson` |

> ⚠️ Atenção: não deixar espaços no valor da variável.

### 3.3 Código da Lambda (`lambda/index.mjs`)

Dependências (versões travadas pré-janeiro/2026 por segurança):

| Pacote | Versão | Função |
|--------|--------|--------|
| `@aws-sdk/client-s3` | `3.525.0` | Comunicação com S3 |
| `marked` | `12.0.1` | Parser de Markdown |
| `pdfkit` | `0.14.0` | Geração de PDF (100% JavaScript, sem binários nativos) |

Endpoints implementados:

| Método | Rota | Função |
|--------|------|--------|
| POST | `/convert` | Recebe conteúdo Markdown, converte para PDF com template estilizado, salva no S3 |
| GET | `/files` | Lista todos os PDFs no bucket S3 |
| GET | `/files/{filename}` | Retorna PDF específico em base64 dentro de JSON |
| OPTIONS | `*` | Responde preflight CORS |

Funcionalidades do gerador de PDF:
- Barra decorativa roxa no topo (`#6366f1`)
- Headings H1-H4 com fontes e cores diferenciadas
- Parágrafos com alinhamento justificado
- Blocos de código com fundo cinza
- Listas ordenadas e não-ordenadas
- Blockquotes com barra lateral colorida
- Linhas horizontais
- Footer com data de geração

### 3.4 Deploy da Lambda

1. Na pasta `lambda/`, executar `npm install --ignore-scripts`
2. Gerar zip: `cd lambda && zip -r ../lambda-deploy.zip index.mjs package.json node_modules/`
3. No console Lambda → Code → **Upload from → .zip file**
4. Selecionar `lambda-deploy.zip` (~7.2MB)

---

## Fase 4 — AWS API Gateway (REST API)

### 4.1 Criar a API

| Configuração | Valor |
|-------------|-------|
| **Tipo** | REST API |
| **Nome** | `web-tools-api` |
| **Endpoint type** | Regional |

### 4.2 Criar Recursos e Métodos

Estrutura de recursos:

```
/
├── /convert
│   ├── POST → Lambda: web-tools-converter
│   └── OPTIONS (CORS)
├── /files
│   ├── GET → Lambda: web-tools-converter
│   ├── OPTIONS (CORS)
│   └── /{filename}
│       ├── GET → Lambda: web-tools-converter
│       └── OPTIONS (CORS)
```

Para cada método (POST e GET):
1. Create Method → Integration type: **Lambda Function**
2. ✅ **Use Lambda Proxy Integration** → **Buffered**
3. Lambda Function: `web-tools-converter`

> ⚠️ **CRÍTICO**: O "Lambda Proxy Integration" DEVE estar ativado em TODOS os métodos. Sem isso, o evento chega sem `httpMethod` e `path`, e a Lambda não consegue rotear.

### 4.3 Configurar CORS

Para **cada recurso** (`/convert`, `/files`, `/files/{filename}`):
1. Selecionar o recurso
2. Clicar **"Enable CORS"**
3. Configurar:
   - Access-Control-Allow-Origin: `*`
   - Access-Control-Allow-Headers: `Content-Type`
   - Access-Control-Allow-Methods: `GET,POST,PUT,OPTIONS`
4. Marcar ✅ **Default 4XX** e ✅ **Default 5XX** (para erros também retornarem headers CORS)
5. Confirmar

### 4.4 Deploy da API

1. Actions → **Deploy API**
2. Deployment stage: **New Stage** → nome: `prod`
3. Clicar **Deploy**
4. Anotar a **Invoke URL** gerada

---

## Fase 5 — DNS e Certificados (Route 53 + ACM)

### 5.1 Certificado SSL para a API

| Configuração | Valor |
|-------------|-------|
| **Serviço** | AWS Certificate Manager (ACM) |
| **Região** | us-east-1 (obrigatório) |
| **Tipo** | Request public certificate |
| **Domain name** | `api-web-tools.anderson.grupo5.sd.ufersa.dev.br` |
| **Validation** | DNS validation |
| **Disable Export** | ✅ Sim |

Após solicitar, clicar **"Create record in Route 53"** para validar automaticamente. Aguardar status **"Issued"**.

### 5.2 Custom Domain no API Gateway

1. API Gateway → **Custom domain names** → **Create**
2. Domain name: `api-web-tools.anderson.grupo5.sd.ufersa.dev.br`
3. TLS version: TLS 1.2
4. Endpoint type: Regional
5. ACM Certificate: selecionar o certificado criado
6. Criar **API mapping**:
   - API: `web-tools-api`
   - Stage: `prod`
   - Path: *(vazio)*

### 5.3 DNS da API no Route 53

1. Route 53 → Hosted zones → domínio
2. Create record:
   - Record name: `api-web-tools`
   - Type: **A** (Alias)
   - Route traffic to: **API Gateway** → custom domain
   - Alias: ✅

### 5.4 Atualizar Front-end

Em `js/app.js`, definir a URL final da API:

```javascript
const CONFIG = {
  API_BASE_URL: 'https://api-web-tools.anderson.grupo5.sd.ufersa.dev.br',
};
```

---

## Fase 6 — Deploy do Front-end (AWS Amplify)

### 6.1 Preparar Repositório

Criar `.gitignore` para excluir código do back-end:

```
lambda/
lambda-deploy.zip
node_modules/
.DS_Store
```

Fazer commit e push para o repositório Git.

### 6.2 Deploy no Amplify

1. AWS Amplify → **Create new app**
2. Conectar ao repositório Git
3. O Amplify detecta automaticamente o `index.html` na raiz
4. Deploy automático a cada push

### 6.3 DNS do Front-end

1. Amplify → app → **Hosting** → **Custom domains**
2. Adicionar domínio: `anderson.grupo5.sd.ufersa.dev.br`
3. Subdomínio: `web-tools`
4. O Amplify gera o certificado SSL automaticamente
5. Criar o registro CNAME no Route 53 conforme instruções do Amplify

DNS final: `https://web-tools.anderson.grupo5.sd.ufersa.dev.br`

---

## Fase 7 — Teste de Integração

### 7.1 Checklist de Testes

| Teste | Endpoint | Resultado Esperado |
|-------|----------|-------------------|
| Status badge | GET /files | Badge verde "API Online" |
| Listar PDFs (vazio) | GET /files | `{"files":[],"count":0}` |
| Upload de .md | POST /convert | Toast "PDF gerado com sucesso!" |
| Listar PDFs (com arquivo) | GET /files | PDF aparece na lista |
| Download de PDF | GET /files/{filename} | PDF baixado corretamente |

### 7.2 URLs Finais

| Serviço | URL |
|---------|-----|
| Front-end | `https://web-tools.anderson.grupo5.sd.ufersa.dev.br` |
| API | `https://api-web-tools.anderson.grupo5.sd.ufersa.dev.br` |

---

## Fase 8 — Evidências de Entrega

1. Screenshot do **bucket S3** mostrando os arquivos PDFs (com informação da conta no canto superior direito)
2. Screenshot do **envio** de arquivo pela interface web no formato do DNS (operação POST)
3. Screenshot da **leitura/download** de arquivo pela interface web no formato do DNS (operação GET)
4. Screenshot do **bucket S3 atualizado** com a lista de arquivos após as operações
