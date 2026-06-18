# 🚀 Setup do Projeto

## Pré-requisitos

- **Node.js**: 20 LTS ou superior
- **npm**: 10+ (incluído com Node.js)
- **Git**: 2.37+

## 📋 Instalação Rápida

### 1. Clonar repositório

```bash
git clone https://github.com/seu-usuario/projeto_01-domino.git
cd projeto_01-domino
```

### 2. Instalar dependências

```bash
# Instala dependências de todos os workspaces
npm install
```

### 3. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env conforme necessário
nano .env  # ou use seu editor favorito
```

### 4. Rodar em desenvolvimento

```bash
# Terminal 1: Backend
npm run dev -w server

# Terminal 2: Frontend (novo terminal)
npm run dev -w client
```

- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

## � Deploy em EC2 (Produção)

### Pré-requisitos EC2

- **Instância EC2**: Amazon Linux 2 ou Ubuntu 20.04+
- **Node.js**: 20 LTS (instalado na instância)
- **npm**: 10+ (incluído com Node.js)
- **Nginx**: Como reverse proxy
- **Variables de Ambiente**: Configuradas na instância

### Setup em EC2

#### 1. Conectar na instância

```bash
ssh -i seu-key.pem ec2-user@seu-instance-ip
# ou para Ubuntu:
ssh -i seu-key.pem ubuntu@seu-instance-ip
```

#### 2. Instalar Node.js (se necessário)

```bash
# Amazon Linux 2
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs
```

#### 3. Clonar repositório

```bash
cd /opt  # ou seu diretório preferido
sudo git clone https://github.com/seu-usuario/projeto_01-domino.git
cd projeto_01-domino
```

#### 4. Instalar dependências

```bash
npm ci  # Usar clean install com package-lock.json
```

#### 5. Configurar variáveis de ambiente

```bash
# Criar .env (não usar .env.example)
sudo nano .env
```

**Variáveis necessárias:**
```
NODE_ENV=production
PORT=3001

# AWS SQS (crítico)
AWS_REGION=sua-regiao
AWS_ACCESS_KEY_ID=sua-key
AWS_SECRET_ACCESS_KEY=sua-secret
SQS_QUEUE_URL=sua-queue-url

# Frontend
VITE_API_URL=https://seu-dominio.com
CLIENT_URL=https://seu-dominio.com
```

#### 6. Build da aplicação

```bash
npm run build  # Build server + client
```

#### 7. Nginx - Reverse Proxy

Criar arquivo `/etc/nginx/conf.d/domino.conf`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Redirecionar HTTP para HTTPS (opcional)
    # return 301 https://$server_name$request_uri;

    # Frontend estático
    location / {
        root /opt/projeto_01-domino/packages/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API backend
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:3001/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Reload nginx:
```bash
sudo systemctl reload nginx
```

#### 8. Iniciar servidor (PM2 recomendado)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Criar arquivo ecosystem.config.js na raiz
pm2 start packages/server/dist/index.js --name domino-server --env production

# Salvar configuração
pm2 save

# Auto-restart on boot
pm2 startup
```

#### 9. SSL/TLS (HTTPS com Let's Encrypt)

```bash
# Instalar Certbot
sudo yum install -y certbot python2-certbot-nginx  # Amazon Linux 2
# ou
sudo apt-get install -y certbot python3-certbot-nginx  # Ubuntu

# Gerar certificado
sudo certbot certonly --nginx -d seu-dominio.com

# Atualizar nginx.conf com SSL
sudo nano /etc/nginx/conf.d/domino.conf
```

Adicionar SSL ao nginx.conf:
```nginx
server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    
    # ... resto da configuração
}
```

### Monitoramento em EC2

```bash
# Ver logs do servidor
pm2 logs domino-server

# Monitoramento em tempo real
pm2 monit

# Status dos processos
pm2 status
```

---

## 📦 Cadeia de Suprimentos & Versões

**Todas as dependências estão com versões FIXAS até janeiro de 2026:**

```
Sem atualização automática:
✅ Não usar ^, ~ em versões
✅ Versões explícitas: 1.2.3
✅ Lock files: package-lock.json obrigatório
✅ Reproduzibilidade: sempre mesmas versões
```

### Versões Pinadas

**Backend:**
- `express`: 4.18.2
- `socket.io`: 4.7.2
- `typescript`: 5.3.3

**Frontend:**
- `react`: 18.2.0
- `vite`: 5.0.8
- `typescript`: 5.3.3

**Compartilhadas:**
- `Node.js`: 20 LTS
- `npm`: 10+

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Rodar dev em ambos packages
npm run dev -w server   # Apenas backend
npm run dev -w client   # Apenas frontend

# Build
npm run build           # Build de produção
npm run build -w server
npm run build -w client

# Type checking
npm run type-check      # Validar tipos TypeScript
npm run type-check -w server
npm run type-check -w client

# Produção
npm start               # Rodar servidor (após build)
```

## 📁 Estrutura de Pastas

```
projeto_01-domino/
├── packages/
│   ├── server/          # Backend Node.js + Express
│   └── client/          # Frontend React + Vite
├── docs/                # Documentação
├── .env.example         # Variáveis de ambiente (template)
├── .env                 # Variáveis de ambiente (local, não commitar)
├── package.json         # Root monorepo
├── docker-compose.yml   # Orquestração Docker
└── README.md            # Este arquivo
```

## 🛡️ Segurança de Dependências

### Verificar vulnerabilidades

```bash
npm audit
```

### Atualizar com cuidado

⚠️ **IMPORTANTE**: Versões estão fixas até janeiro de 2026. Qualquer atualização deve ser:

1. Necessária por segurança crítica
2. Testada completamente
3. Documentada no Git
4. Aprovada em PR

```bash
# Atualizar uma dependência (raro!)
npm install express@4.19.0  # Especificar versão exata
npm install                 # Atualizar package-lock.json
```

## 🐛 Troubleshooting

### "node_modules não encontrado"

```bash
npm install  # Reinstalar
```

### "Porta 3001 já em uso"

```bash
# Encontrar processo
lsof -i :3001

# Matar processo (Linux/Mac)
kill -9 PID

# Ou usar porta diferente
PORT=3002 npm run dev -w server
```

### "Erro de CORS"

Verificar `.env`:

```
CLIENT_URL=http://localhost:5173  # Frontend URL
```

### Docker não encontra dependências

```bash
docker-compose down -v  # Remove volumes
docker-compose up --build  # Rebuild
```

## 📚 Próximos Passos

1. Ler [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitetura completa
2. Ler [README.md](README.md) - Especificações do jogo
3. Começar com [Fase 2: Lógica do Jogo](README.md#-divisão-de-etapas)

## 💬 Suporte

- Dúvidas? Abra uma [issue no GitHub](https://github.com/seu-usuario/projeto_01-domino/issues)
- Quer contribuir? Veja [ARCHITECTURE.md](docs/ARCHITECTURE.md)
