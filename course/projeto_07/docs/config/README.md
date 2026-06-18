# 📦 Arquivos de Configuração

**Localização**: Arquivos de configuração encontram-se no **root do projeto**

⚠️ **IMPORTANTE**: Estes arquivos precisam estar no root para funcionar corretamente com npm, Node.js e as ferramentas de desenvolvimento.

---

## 📋 Arquivos de Configuração

| Arquivo | Propósito | Necessário | Git |
|---------|-----------|-----------|-----|
| `.env` | Variáveis de ambiente (local) | ❌ Não (template existe) | ❌ Ignorar |
| `.env.example` | Template de variáveis | ✅ Sim | ✅ Commitar |
| `.npmrc` | Configuração npm | ✅ Sim | ✅ Commitar |
| `.nvmrc` | Versão Node.js | ✅ Sim | ✅ Commitar |
| `.gitignore` | Arquivos ignorados | ✅ Sim | ✅ Commitar |
| `.github/` | Workflows CI/CD | ✅ Sim | ✅ Commitar |

---

## 🔧 Descrição Detalhada

### `.env.example` (Template)

**Arquivo**: `/.env.example`

Template de variáveis de ambiente. Nunca modifique em produção.

```bash
# Para setup local:
cp .env.example .env
nano .env  # Editar conforme necessário
```

**Variáveis Principais**:
```
NODE_ENV=development|production
PORT=3001
CLIENT_URL=http://localhost:5173

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
SQS_QUEUE_URL=...
```

📖 Ver: [SETUP.md](../SETUP.md) e [EC2-DEPLOYMENT.md](../EC2-DEPLOYMENT.md)

---

### `.npmrc` (NPM Configuration)

**Arquivo**: `/.npmrc`

Configuração global do npm para este projeto.

**Características**:
- `save-exact=true` - Sempre versões exatas (sem `^` ou `~`)
- `audit-level=moderate` - Bloqueia vulnerabilidades moderadas
- `engine-strict=true` - Falha se Node.js não bater com `.nvmrc`
- `legacy-peer-deps=false` - Respeita dependências de peer

⚠️ **NÃO MODIFICAR** a menos que saiba o que está fazendo.

---

### `.nvmrc` (Node Version)

**Arquivo**: `/.nvmrc`

Especifica versão Node.js para o projeto: **Node 20 LTS**

**Uso**:
```bash
# Instalar versão correta
nvm install  # Lê automaticamente .nvmrc

# Usar versão
nvm use

# Verificar
node --version  # v20.x.x
```

⚠️ **Crítico**: Manter sempre atualizado com versão LTS suportada.

---

### `.gitignore`

**Arquivo**: `/.gitignore`

Define quais arquivos/pastas são ignorados pelo git.

**Conteúdo Típico**:
```
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
```

---

### `.github/` (Workflows)

**Diretório**: `/.github/workflows/`

Define CI/CD pipelines (GitHub Actions).

**Exemplos**:
- `test.yml` - Rodar testes
- `lint.yml` - Validar código
- `deploy.yml` - Fazer deploy

---

## 🚀 Setup Recomendado

### Desenvolvimento Local

```bash
# 1. Clonar repo
git clone https://github.com/seu-usuario/projeto_01-domino.git
cd projeto_01-domino

# 2. Usar Node.js correto
nvm use  # Lê .nvmrc automaticamente

# 3. Criar .env
cp .env.example .env
nano .env  # Editar conforme necessário

# 4. Instalar dependências
npm ci  # Usa .npmrc e package-lock.json

# 5. Desenvolvimento
npm run dev
```

### Produção (EC2)

```bash
# 1. Usar Node.js correto
nvm use 20

# 2. Criar .env para produção
nano .env
# Adicionar: NODE_ENV=production, AWS_*, etc.

# 3. Instalar e build
npm ci
npm run build

# 4. Iniciar com PM2
pm2 start packages/server/dist/index.js
```

📖 Detalhes: [EC2-DEPLOYMENT.md](../EC2-DEPLOYMENT.md)

---

## ⚠️ Boas Práticas

1. ✅ **`.env` é local**: Nunca commitar `.env` (apenas `.env.example`)
2. ✅ **`.npmrc` é compartilhado**: Todos devem usar as mesmas regras npm
3. ✅ **`.nvmrc` é fixo**: Todos devem usar Node.js 20 LTS
4. ✅ **Variáveis sensíveis**: AWS keys vão em `.env` (gitignored)
5. ✅ **CI/CD**: `.github/workflows/` automatiza checagens

---

## 🔗 Referências

- [SETUP.md](../SETUP.md) - Como setup local
- [EC2-DEPLOYMENT.md](../EC2-DEPLOYMENT.md) - Deploy em produção
- [npm documentation](https://docs.npmjs.com/cli/v10/configuring-npm/npmrc)
- [nvm documentation](https://github.com/nvm-sh/nvm)
- [Node.js LTS](https://nodejs.org/en/about/releases/)

---

**Última Atualização**: 2026-04-25

Para dúvidas sobre configuração, consulte o arquivo específico acima ou a documentação principal.
