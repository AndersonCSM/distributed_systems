# ⚡ Web Tools — Conversor Markdown → PDF

Aplicação web de produtividade para conversão de documentos Markdown e texto em PDF formatado, com armazenamento na nuvem AWS.

---

## 🎯 Objetivo

Solução de envio e recuperação de arquivos Web na AWS, utilizando o serviço de armazenamento de objetos S3. O usuário envia um arquivo `.md` ou `.txt` pela interface web, a Lambda converte o conteúdo para PDF com template estilizado e faz upload no S3. O PDF fica disponível para download.

---

## 🏗️ Arquitetura

```
Usuário → Amplify (Front-end) → Route 53 → API Gateway → Lambda (Node.js) → S3
```

| Camada | Serviço | Função |
|--------|---------|--------|
| Front-end | AWS Amplify | Hospedagem do site estático |
| DNS | AWS Route 53 | Domínios customizados (front e API) |
| SSL | AWS Certificate Manager | Certificado HTTPS para a API |
| API | AWS API Gateway (REST) | Roteamento HTTP → Lambda |
| Compute | AWS Lambda (Node.js 20.x) | Conversão MD→PDF e comunicação com S3 |
| Storage | AWS S3 | Armazenamento dos PDFs gerados |

---

## 📁 Estrutura do Projeto

```
web-tools/
├── index.html              # Página principal
├── src/
│   └── css/
│       └── style.css       # Design system (dark mode, glassmorphism)
├── js/
│   └── app.js              # Lógica de upload, listagem e download
├── img/                    # Assets visuais
├── assets/                 # Outros recursos
├── lambda/                 # Código do back-end (não vai pro Amplify)
│   ├── index.mjs           # Handler da Lambda
│   └── package.json        # Dependências Node.js
├── specs.md                # Especificações do projeto
├── etapas.md               # Etapas detalhadas de implementação
└── README.md               # Este arquivo
```

---

## ⚙️ Fluxo de Funcionamento

### Envio (POST)
1. Usuário seleciona arquivo `.md` ou `.txt` (drag-and-drop ou clique)
2. Front-end lê o conteúdo como texto e envia via POST para a API
3. API Gateway aciona a Lambda
4. Lambda converte Markdown → PDF (com `marked` + `pdfkit`)
5. Lambda salva o PDF no bucket S3

### Recuperação (GET)
1. Usuário clica em "Atualizar Lista"
2. Front-end faz GET para a API
3. Lambda lista objetos do S3 e retorna a lista
4. Usuário clica em "Baixar" no PDF desejado
5. Lambda busca o PDF no S3 e retorna em base64

---

## 🛠️ Tecnologias

| Componente | Tecnologia | Versão |
|-----------|-----------|--------|
| Front-end | HTML5 + CSS3 + JavaScript | — |
| Parser Markdown | marked | 12.0.1 |
| Gerador PDF | pdfkit | 0.14.0 |
| AWS SDK | @aws-sdk/client-s3 | 3.525.0 |
| Runtime | Node.js | 20.x |

> Dependências travadas em versões anteriores a janeiro/2026 por segurança (proteção contra ataques de supply chain no npm).

---

## 🌐 URLs

| Serviço | URL |
|---------|-----|
| Front-end | `https://web-tools.anderson.grupo5.sd.ufersa.dev.br` |
| API | `https://api-web-tools.anderson.grupo5.sd.ufersa.dev.br` |

---

## 🚀 Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/convert` | Envia conteúdo Markdown e recebe PDF gerado |
| `GET` | `/files` | Lista todos os PDFs no bucket S3 |
| `GET` | `/files/{filename}` | Retorna PDF específico para download |

### Exemplo de Request (POST /convert)

```json
{
  "filename": "documento.md",
  "content": "# Título\n\nConteúdo do documento em **Markdown**."
}
```

### Exemplo de Response

```json
{
  "message": "PDF gerado com sucesso!",
  "filename": "documento.pdf",
  "size": 45231
}
```

---

## ⚠️ Limitações

- Payload máximo do API Gateway: **10MB**
- Formatos aceitos: `.md`, `.txt`, `.markdown`
- Abordagem "Proxy Pass": ideal para arquivos pequenos (documentos, PDFs de poucas páginas)

---

## 📋 Documentação Complementar

- [specs.md](specs.md) — Especificações originais do projeto
- [etapas.md](etapas.md) — Etapas detalhadas de implementação com todas as configurações AWS
