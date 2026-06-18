# 🚀 Guia Completo: Deploy em EC2 AWS

**Versão**: 1.0  
**Data**: 2026-04-25  
**Status**: ✅ Ativo

---

## 📋 Sumário

1. [Preparação Inicial](#preparação-inicial)
2. [Setup da Instância EC2](#setup-da-instância-ec2)
3. [Deploy da Aplicação](#deploy-da-aplicação)
4. [Configuração de Domínio](#configuração-de-domínio)
5. [SSL/TLS com Let's Encrypt](#ssltls-com-lets-encrypt)
6. [Monitoramento e Logs](#monitoramento-e-logs)
7. [Troubleshooting](#troubleshooting)
8. [Backup e Recovery](#backup-e-recovery)

---

## 🔧 Preparação Inicial

### 1. Criar Instância EC2

**Recomendações:**
- **AMI**: Amazon Linux 2 ou Ubuntu 20.04 LTS
- **Tipo**: t3.medium (mínimo) ou t3.small (desenvolvimento)
- **Storage**: 20GB (SSD recomendado)
- **Security Group**: Permitir portas 22 (SSH), 80 (HTTP), 443 (HTTPS)

### 2. Preparar Chave SSH

```bash
# Verificar arquivo de chave
ls -la ~/.ssh/seu-key.pem

# Definir permissões corretas (importante!)
chmod 400 ~/.ssh/seu-key.pem
```

### 3. Variáveis de Ambiente

Preparar em local seguro antes de fazer deploy:

```bash
# Criar arquivo .env local (NUNCA fazer commit!)
cat > /tmp/.env.production <<EOF
NODE_ENV=production
PORT=3001
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=seu-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/...
CLIENT_URL=https://seu-dominio.com
VITE_API_URL=https://seu-dominio.com
EOF

# Será copiado para EC2 depois
```

---

## 🖥️ Setup da Instância EC2

### Etapa 1: Conectar via SSH

```bash
ssh -i ~/.ssh/seu-key.pem ec2-user@seu-instance-ip
# ou
ssh -i ~/.ssh/seu-key.pem ubuntu@seu-instance-ip
```

### Etapa 2: Atualizar Sistema

**Amazon Linux 2:**
```bash
sudo yum update -y
sudo yum install -y git curl wget nano htop
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y git curl wget nano htop
```

### Etapa 3: Instalar Node.js 20 LTS

**Amazon Linux 2:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs npm
```

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs npm
```

**Verificar versão:**
```bash
node --version  # v20.x.x
npm --version   # 10+
```

### Etapa 4: Instalar Nginx

**Amazon Linux 2:**
```bash
sudo amazon-linux-extras install -y nginx1
sudo systemctl start nginx
sudo systemctl enable nginx
```

**Ubuntu/Debian:**
```bash
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

**Verificar status:**
```bash
sudo systemctl status nginx
```

### Etapa 5: Instalar PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Auto-start on reboot
pm2 startup
pm2 save
```

---

## 📦 Deploy da Aplicação

### Passo 1: Clonar Repositório

```bash
# Como usuário normal (não root)
cd ~
mkdir -p /opt/domino
cd /opt/domino
git clone https://github.com/seu-usuario/projeto_01-domino.git .
```

### Passo 2: Instalar Dependências

```bash
cd /opt/domino
npm ci  # Clean install (usa package-lock.json exato)
```

⏱️ **Tempo esperado**: 2-3 minutos

### Passo 3: Configurar Variáveis de Ambiente

**Opção A: Via SCP** (Transferir arquivo preparado)

```bash
# Do seu computador local:
scp -i ~/.ssh/seu-key.pem /tmp/.env.production \
    ec2-user@seu-instance-ip:/opt/domino/.env

# Ou via SSH (menos seguro):
ssh -i ~/.ssh/seu-key.pem ec2-user@seu-instance-ip \
    'nano /opt/domino/.env'
```

**Opção B: Criar na instância**

```bash
cd /opt/domino
nano .env

# Colar variáveis:
NODE_ENV=production
PORT=3001
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
SQS_QUEUE_URL=...
CLIENT_URL=https://seu-dominio.com
VITE_API_URL=https://seu-dominio.com
```

⚠️ **IMPORTANTE**: Nunca fazer commit do `.env`

### Passo 4: Build de Produção

```bash
cd /opt/domino
npm run build

# Verificar build gerado
ls -la packages/server/dist
ls -la packages/client/dist
```

### Passo 5: Iniciar com PM2

```bash
cd /opt/domino

# Iniciar servidor
pm2 start packages/server/dist/index.js \
  --name domino-server \
  --env production \
  --error /home/ec2-user/.pm2/logs/error.log \
  --out /home/ec2-user/.pm2/logs/out.log

# Salvar configuração
pm2 save

# Ver status
pm2 status
pm2 logs domino-server
```

---

## 🌐 Configuração de Domínio

### Passo 1: Configurar DNS

Apontar seu domínio para o IP da instância EC2:

- **Provedor**: GoDaddy, Route53, Cloudflare, etc.
- **Tipo**: A Record
- **Value**: IP da instância EC2

**Exemplo Route53:**
```
Name: seu-dominio.com
Type: A
Value: 54.123.45.67  (seu IP EC2)
TTL: 300
```

### Passo 2: Configurar Nginx como Reverse Proxy

```bash
sudo nano /etc/nginx/conf.d/domino.conf
```

Adicionar configuração:

```nginx
upstream domino_backend {
    server localhost:3001;
}

server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Frontend estático
    location / {
        root /opt/domino/packages/client/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://domino_backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts para conexões longas
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.IO (WebSocket)
    location /socket.io {
        proxy_pass http://domino_backend/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Logs
    access_log /var/log/nginx/domino_access.log;
    error_log /var/log/nginx/domino_error.log;
}
```

### Passo 3: Validar Configuração Nginx

```bash
sudo nginx -t
```

Esperado: `ok` e `successful`

### Passo 4: Recarregar Nginx

```bash
sudo systemctl reload nginx
```

---

## 🔒 SSL/TLS com Let's Encrypt

### Passo 1: Instalar Certbot

**Amazon Linux 2:**
```bash
sudo amazon-linux-extras install -y certbot
sudo yum install -y python2-certbot-nginx
```

**Ubuntu/Debian:**
```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

### Passo 2: Gerar Certificado

```bash
sudo certbot certonly --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Responder às perguntas:
- Email: seu-email@exemplo.com
- Aceitar termos: Y
- Newsletter: Y (opcional)

### Passo 3: Atualizar Nginx para HTTPS

```bash
sudo nano /etc/nginx/conf.d/domino.conf
```

Atualizar para:

```nginx
upstream domino_backend {
    server localhost:3001;
}

# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Resto da configuração anterior...
    # (manter location /, /api/, /socket.io)
}
```

### Passo 4: Recarregar Nginx

```bash
sudo systemctl reload nginx
```

### Passo 5: Auto-Renew (Automático)

Let's Encrypt gerencia auto-renew automaticamente:

```bash
# Verificar status
sudo systemctl status certbot.timer

# Testar renovação
sudo certbot renew --dry-run
```

---

## 📊 Monitoramento e Logs

### PM2 - Monitoramento de Processos

```bash
# Dashboard em tempo real
pm2 monit

# Status detalhado
pm2 status

# Logs
pm2 logs domino-server

# Limpar logs
pm2 flush

# Reiniciar processo
pm2 restart domino-server

# Parar processo
pm2 stop domino-server

# Iniciar novamente
pm2 start domino-server
```

### Nginx - Access e Error Logs

```bash
# Ver logs em tempo real
tail -f /var/log/nginx/domino_access.log
tail -f /var/log/nginx/domino_error.log

# Ver últimas linhas
head -50 /var/log/nginx/domino_error.log
```

### Monitorar Recursos (CPU, RAM)

```bash
# Em tempo real
htop

# Uma vez
free -h
df -h
ps aux | grep node

# Uso específico do processo Node
ps aux | grep "packages/server/dist" | grep -v grep
```

---

## 🐛 Troubleshooting

### Problema: Servidor não inicia

```bash
# Verificar logs
pm2 logs domino-server

# Verificar porta 3001
lsof -i :3001

# Verificar arquivo .env
cat /opt/domino/.env

# Tentar iniciar manualmente
node /opt/domino/packages/server/dist/index.js
```

### Problema: Nginx retorna 502 Bad Gateway

```bash
# Verificar se servidor está rodando
pm2 status

# Verificar conexão local
curl http://localhost:3001/

# Ver erro nginx
sudo tail -20 /var/log/nginx/domino_error.log
```

### Problema: SSL não funciona

```bash
# Verificar certificado
sudo ls -la /etc/letsencrypt/live/seu-dominio.com/

# Testar configuração nginx
sudo nginx -t

# Recarregar nginx
sudo systemctl reload nginx

# Verificar porta 443
lsof -i :443
```

### Problema: WebSocket não funciona

Certificar que nginx tem configuração de `/socket.io`:

```bash
sudo grep -A 10 "location /socket.io" /etc/nginx/conf.d/domino.conf
```

Deve incluir:
```
Upgrade $http_upgrade
Connection "Upgrade"
```

---

## 💾 Backup e Recovery

### Backup Manual

```bash
# Backup da aplicação
tar -czf domino-backup-$(date +%Y%m%d).tar.gz /opt/domino

# Copiar para local seguro
scp -i ~/.ssh/seu-key.pem \
    ec2-user@seu-instance-ip:domino-backup-*.tar.gz \
    ~/backups/
```

### Restore do Backup

```bash
# Na nova instância
cd /opt
tar -xzf domino-backup-20260425.tar.gz

# Reinstalar dependências
cd /opt/domino
npm ci

# Restart com PM2
pm2 start packages/server/dist/index.js --name domino-server
```

---

## 🔄 Update da Aplicação

### Quando há novos commits

```bash
cd /opt/domino

# Fazer pull
git pull origin main

# Reinstalar dependências (se package.json mudou)
npm ci

# Rebuild
npm run build

# Restart
pm2 restart domino-server
```

---

## 📞 Suporte e Próximos Passos

- **Logs**: `/opt/domino` + PM2 logs
- **Documentação**: Ver [README.md](../README.md) e [ARCHITECTURE.md](ARCHITECTURE.md)
- **Problemas**: Consultar [SECURITY-CHECKLIST.md](../SECURITY-CHECKLIST.md)

---

**Última Atualização**: 2026-04-25  
**Próxima Revisão**: 2026-06-25
