# 📦 Deploy Docker (ANTIGO - Não mais em uso)

**Status**: ⚠️ **DESCONTINUADO**  
**Data de Deprecação**: 2026-04-25  
**Motivo**: Projeto migrou para deploy direto em instância EC2 da AWS

---

## 📋 Histórico de Deploy Docker

Este diretório contém a configuração original de Docker/Docker Compose utilizada durante as fases de desenvolvimento do projeto Dominó Online.

### Arquivos Arquivados

```
old/
├── docker-compose.yml          # Orquestração com Docker Compose (dev)
├── Dockerfile.prod             # Build multi-stage para produção
└── packages/
    ├── server/
    │   └── Dockerfile         # Server Node.js (dev)
    └── client/
        ├── Dockerfile         # Client React (dev)
        └── nginx.conf         # Configuração nginx para produção
```

---

## 🔧 Como era o Deploy Docker (Referência)

### Desenvolvimento com Docker Compose

```bash
# Para iniciar o ambiente de desenvolvimento:
docker-compose up

# Acessar aplicação:
# - Server: http://localhost:3001
# - Client: http://localhost:5173
```

### Build para Produção

```bash
# Multi-stage build (ambos server e client em um Dockerfile)
docker build -f Dockerfile.prod \
  --target production-server \
  -t domino-server:latest .

docker build -f Dockerfile.prod \
  --target production-client \
  -t domino-client:latest .
```

---

## ✅ Recursos ainda necessários (mantidos no projeto)

- ✅ **AWS Configuration** (`packages/server/src/config/aws.ts`)
  - AWS SQS para fila de mensagens
  - Credenciais via variáveis de ambiente
  
- ✅ **Environment Variables** (`.env.example`)
  - AWS_REGION
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - SQS_QUEUE_URL
  - PORT
  - NODE_ENV

---

## 🚀 Novo Deploy (EC2)

O projeto agora é implantado diretamente em uma instância EC2 da AWS:

1. **Servidor**: Roda Node.js nativo em EC2
2. **Cliente**: Servido via nginx em EC2 ou CloudFront
3. **Fila de Mensagens**: AWS SQS (configurado em `aws.ts`)
4. **Variáveis de Ambiente**: Configuradas na instância EC2

Consulte a documentação principal do projeto para instruções de deploy em EC2.

---

## 📝 Notas de Migração

- Docker foi útil durante desenvolvimento e testes
- Para produção em EC2, as configurações Docker não são mais necessárias
- Mantemos arquivos de configuração AWS ativos
- Todo o código Node.js e React continua funcional sem Docker
- Arquivos Docker podem ser removidos do repositório se necessário

---

**Última Atualização**: 2026-04-25
