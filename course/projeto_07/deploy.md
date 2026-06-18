# 🎮 Dominó Online — Guia de Deploy

> Documentação completa para deploy em instância EC2 (AWS) com integração SQS.

---

## 📋 Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Build Local](#2-build-local)
3. [Upload para EC2](#3-upload-para-ec2)
4. [Configuração no EC2](#4-configuração-no-ec2)
5. [Configuração do Nginx](#5-configuração-do-nginx)
6. [AWS SQS](#6-aws-sqs)
7. [Credenciais AWS Educate](#7-credenciais-aws-educate)
8. [Comandos Úteis](#8-comandos-úteis)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Pré-requisitos

### Máquina local
- Node.js 20+ (`node -v`)
- npm 10+ (`npm -v`)
- zip (`sudo apt install zip`)

### Servidor EC2
- Ubuntu 22.04+ (Amazon Linux também funciona)
- Node.js 20+ instalado
- PM2 instalado globalmente (`npm install -g pm2`)
- Nginx instalado (`sudo apt install nginx`)
- Portas abertas no Security Group:
  - **80** (HTTP — Nginx/Frontend)
  - **3001** (Backend/WebSocket)
  - **22** (SSH)

---

## 2. Build Local

```bash
# Acesse o diretório do projeto
cd /home/anderson/github_projects/projeto_01-domino

# Instale dependências (se necessário)
npm install

# Build completo (server + client)
npm run build

# Criar ZIP para deploy (exclui arquivos desnecessários)
zip -r ../domino-deploy.zip . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x ".agent/*" \
  -x "old/*" \
  -x "packages/client/node_modules/*" \
  -x "packages/server/node_modules/*" \
  -x ".vscode/*"
```

O arquivo `domino-deploy.zip` será gerado em `/home/anderson/github_projects/`.

---

## 3. Upload para EC2

```bash
# Substitua 'sua-chave.pem' pela sua chave SSH
scp -i sua-chave.pem /home/anderson/github_projects/domino-deploy.zip ubuntu@<IP_DA_EC2>:/tmp/
```

> **Dica:** Se estiver usando AWS Educate, a chave `.pem` é baixada ao criar a instância.

---

## 4. Configuração no EC2

### 4.1 Conectar via SSH

```bash
ssh -i sua-chave.pem ubuntu@<IP_DA_EC2>
```

### 4.2 Descompactar o projeto

```bash
# Parar servidor (se já existir)
pm2 stop domino-server 2>/dev/null || true

# Limpar versão anterior
cd /opt/domino
sudo rm -rf packages/ package.json npm-shrinkwrap.json

# Descompactar nova versão
sudo unzip -o /tmp/domino-deploy.zip -d /opt/domino/
sudo chown -R ubuntu:ubuntu /opt/domino
```

### 4.3 Instalar dependências

```bash
cd /opt/domino
npm install --production
```

### 4.4 Configurar variáveis de ambiente

#### Backend (.env)

```bash
cat > /opt/domino/.env << 'EOF'
NODE_ENV=production
PORT=3001
CLIENT_URL=http://<IP_DA_EC2>

# AWS SQS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<SUA_ACCESS_KEY>
AWS_SECRET_ACCESS_KEY=<SEU_SECRET>
AWS_SESSION_TOKEN=<SEU_TOKEN>
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/882383365015/queue-domino
EOF
```

> ⚠️ **IMPORTANTE:** Substitua `<IP_DA_EC2>`, `<SUA_ACCESS_KEY>`, `<SEU_SECRET>` e `<SEU_TOKEN>` pelos valores reais.

#### Frontend (.env)

```bash
echo "VITE_SOCKET_URL=http://<IP_DA_EC2>:3001" > /opt/domino/packages/client/.env
```

> ⚠️ Variáveis `VITE_*` são embutidas no build. O rebuild do frontend é **obrigatório** após alterar este arquivo.

### 4.5 Build no servidor

```bash
cd /opt/domino

# Build do backend
npx tsc --project packages/server/tsconfig.json

# Build do frontend (embute VITE_SOCKET_URL)
npm run build --workspace=packages/client
```

### 4.6 Iniciar com PM2

```bash
# Primeira vez
pm2 start packages/server/dist/index.js --name domino-server
pm2 save
pm2 startup  # Configura auto-start no boot

# Atualizações futuras
pm2 restart domino-server --update-env
```

### 4.7 Verificar

```bash
# Health check
curl http://localhost:3001/health
# Esperado: {"status":"ok","timestamp":"...","awsConfigured":true}

# Filas SQS
curl http://localhost:3001/debug/sqs-queues
# Esperado: {"queues":["https://sqs.us-east-1.amazonaws.com/..."]}

# Logs
pm2 logs domino-server --lines 20
```

---

## 5. Configuração do Nginx

O Nginx serve o frontend (arquivos estáticos) e faz proxy reverso para o backend.

### 5.1 Instalar Nginx

```bash
sudo apt update && sudo apt install nginx -y
```

### 5.2 Configurar

```bash
sudo tee /etc/nginx/sites-available/domino << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend (arquivos estáticos)
    root /opt/domino/packages/client/dist;
    index index.html;

    # SPA: redireciona todas as rotas para index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para o backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy para Socket.IO (WebSocket)
    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

### 5.3 Ativar e reiniciar

```bash
# Ativar o site
sudo ln -sf /etc/nginx/sites-available/domino /etc/nginx/sites-enabled/domino

# Remover config padrão
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 5.4 Verificar

Acesse no navegador: `http://<IP_DA_EC2>`

---

## 6. AWS SQS

### 6.1 Configuração da fila

| Parâmetro | Valor recomendado |
|-----------|-------------------|
| Tipo | Standard |
| Visibility timeout | 5 minutos |
| Message retention | 4 dias |
| Delivery delay | 0 segundos |
| Receive message wait time | 20 segundos (Long Polling) |
| Max message size | 256 KiB |

### 6.2 Política de acesso

A fila precisa permitir acesso do usuário IAM que possui as credenciais:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::882383365015:root"
      },
      "Action": "SQS:*",
      "Resource": "arn:aws:sqs:us-east-1:882383365015:queue-domino"
    }
  ]
}
```

### 6.3 Eventos enviados para a fila

| Evento | Quando |
|--------|--------|
| `room_created` | Jogador cria uma sala |
| `player_joined` | Jogador entra em uma sala |
| `player_left` | Jogador sai de uma sala |

### 6.4 Monitorar mensagens

```bash
# Via terminal (AWS CLI)
aws sqs receive-message \
  --queue-url https://sqs.us-east-1.amazonaws.com/882383365015/queue-domino \
  --max-number-of-messages 10 \
  --visibility-timeout 0 \
  --region us-east-1

# Contagem de mensagens na fila
aws sqs get-queue-attributes \
  --queue-url https://sqs.us-east-1.amazonaws.com/882383365015/queue-domino \
  --attribute-names ApproximateNumberOfMessages \
  --region us-east-1

# Via API do backend
curl http://localhost:3001/debug/sqs-queues
```

---

## 7. Credenciais AWS Educate

> ⚠️ **ATENÇÃO:** Credenciais do AWS Educate são temporárias e **expiram a cada ~2 horas**.

### Identificação

- Chaves que começam com `ASIA` são **temporárias** (STS)
- Chaves que começam com `AKIA` são **permanentes** (IAM)

### Credenciais temporárias exigem 3 valores

| Variável | Descrição |
|----------|-----------|
| `AWS_ACCESS_KEY_ID` | Começa com `ASIA...` |
| `AWS_SECRET_ACCESS_KEY` | String alfanumérica |
| `AWS_SESSION_TOKEN` | String longa (obrigatório para `ASIA*`) |

> 🔴 **Sem `AWS_SESSION_TOKEN`, o erro `InvalidClientTokenId` será retornado.** Esse é o erro mais comum em deploys com AWS Educate.

### Como renovar credenciais

1. Acesse o painel do AWS Educate
2. Copie as 3 credenciais novas
3. No EC2:

```bash
# Edite o .env
nano /opt/domino/.env

# Atualize as 3 linhas:
# AWS_ACCESS_KEY_ID=NOVA_KEY
# AWS_SECRET_ACCESS_KEY=NOVO_SECRET
# AWS_SESSION_TOKEN=NOVO_TOKEN

# Reinicie (IMPORTANTE: use --update-env)
pm2 restart domino-server --update-env

# Verifique
curl http://localhost:3001/debug/sqs-queues
```

---

## 8. Comandos Úteis

### PM2

```bash
# Status dos processos
pm2 status

# Logs em tempo real
pm2 logs domino-server --lines 50

# Apenas erros
pm2 logs domino-server --lines 50 --err

# Reiniciar (com reload de variáveis)
pm2 restart domino-server --update-env

# Parar
pm2 stop domino-server

# Remover processo
pm2 delete domino-server

# Monitoramento (CPU/RAM em tempo real)
pm2 monit
```

### Nginx

```bash
# Testar configuração
sudo nginx -t

# Reiniciar
sudo systemctl restart nginx

# Ver logs de acesso
sudo tail -f /var/log/nginx/access.log

# Ver logs de erro
sudo tail -f /var/log/nginx/error.log
```

### Debug

```bash
# Testar backend
curl http://localhost:3001/health
curl http://localhost:3001/debug/sqs-queues

# Testar se o frontend está servido
curl -s http://localhost | head -5

# Ver variáveis de ambiente do PM2
pm2 env 0 | grep -E "AWS|SQS|CLIENT|PORT|NODE_ENV"

# Verificar portas em uso
sudo lsof -i :80
sudo lsof -i :3001
```

---

## 9. Troubleshooting

### ❌ `InvalidClientTokenId`

**Causa:** Credencial `ASIA*` (temporária) sem `AWS_SESSION_TOKEN`, ou credenciais expiradas.

**Solução:**
1. Verifique se `AWS_SESSION_TOKEN` está no `.env`
2. Renove as credenciais no painel AWS Educate
3. `pm2 restart domino-server --update-env`

---

### ❌ `{"queues":[]}`

**Causa:** SQS não autenticou. Mesmo problema de credenciais acima.

**Solução:** Igual ao item anterior.

---

### ❌ "Erro de conexão com o servidor" (no navegador)

**Causa:** Frontend tentando conectar ao backend em URL errada.

**Solução:**
1. Verifique `VITE_SOCKET_URL` no `.env` do client:
   ```bash
   cat /opt/domino/packages/client/.env
   ```
2. Deve apontar para `http://<IP_DA_EC2>:3001`
3. Rebuild do frontend (variáveis VITE são embutidas no build):
   ```bash
   cd /opt/domino && npm run build --workspace=packages/client
   ```

---

### ❌ PM2 perdeu o processo após reboot

**Causa:** `pm2 save` ou `pm2 startup` não foi executado.

**Solução:**
```bash
pm2 start packages/server/dist/index.js --name domino-server
pm2 save
pm2 startup
# Execute o comando que o pm2 startup sugere (com sudo)
```

---

### ❌ Nginx retorna 502 Bad Gateway

**Causa:** Backend não está rodando.

**Solução:**
```bash
pm2 status
# Se offline:
pm2 restart domino-server
```

---

### ❌ WebSocket não conecta (CORS)

**Causa:** `CLIENT_URL` no `.env` não bate com a URL do frontend.

**Solução:**
1. O `CLIENT_URL` no `.env` deve ser exatamente a URL que o usuário acessa no navegador
2. Exemplo: `CLIENT_URL=http://98.93.197.151` (sem porta, sem barra final)
3. `pm2 restart domino-server --update-env`

---

## 📁 Estrutura de Arquivos no Servidor

```
/opt/domino/
├── .env                          # Variáveis de ambiente (NÃO commitar)
├── package.json                  # Workspace root
├── packages/
│   ├── client/
│   │   ├── .env                  # VITE_SOCKET_URL (embutido no build)
│   │   ├── dist/                 # Frontend compilado (servido pelo Nginx)
│   │   └── src/                  # Código fonte do frontend
│   └── server/
│       ├── dist/                 # Backend compilado (rodado pelo PM2)
│       └── src/
│           ├── config/aws.ts     # Configuração SQS (suporta session token)
│           ├── handlers/         # Handlers Socket.IO
│           ├── services/         # SqsService, GameService, RoomService
│           └── index.ts          # Entry point do servidor
├── node_modules/                 # Dependências
└── /etc/nginx/sites-available/domino  # Config do Nginx
```

---

## 🔄 Deploy Rápido (Cheat Sheet)

```bash
# === LOCAL ===
cd /home/anderson/github_projects/projeto_01-domino
npm run build
zip -r ../domino-deploy.zip . -x "node_modules/*" ".git/*" ".agent/*" "old/*" "packages/*/node_modules/*"
scp -i chave.pem ../domino-deploy.zip ubuntu@<IP>:/tmp/

# === EC2 ===
pm2 stop domino-server
sudo unzip -o /tmp/domino-deploy.zip -d /opt/domino/
sudo chown -R ubuntu:ubuntu /opt/domino
cd /opt/domino && npm install --production
npx tsc --project packages/server/tsconfig.json
npm run build --workspace=packages/client
pm2 restart domino-server --update-env
curl http://localhost:3001/health
```