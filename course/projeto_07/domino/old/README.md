# 📦 Pasta de Arquivos Arquivados (OLD)

**Data de Criação**: 2026-04-25  
**Contexto**: Migração de Deploy Docker → EC2 AWS

---

## 📝 Propósito

Este diretório contém arquivos, documentação e configurações que não são mais utilizados no projeto após a migração para deploy em instância EC2 da AWS.

### Por que arquivar?

- ✅ Manter histórico e referência
- ✅ Evitar confusão na raiz do projeto
- ✅ Facilitar limpeza do repositório
- ✅ Documentar mudanças arquiteturais

---

## 📂 Conteúdo

### 🐳 Docker (Descontinuado)

```
old/
├── docker-compose.yml         # Dev environment orchestration
├── Dockerfile.prod            # Multi-stage production build
└── packages/
    ├── server/
    │   └── Dockerfile        # Server Node.js dev image
    └── client/
        ├── Dockerfile        # Client React dev image
        └── nginx.conf        # Nginx configuration
```

**Status**: ⚠️ Não mais utilizado  
**Razão**: Projeto migrou para EC2 nativo  
**Referência**: Ver [DOCKER-DEPLOYMENT.md](DOCKER-DEPLOYMENT.md)

### 📄 Documentação (Histórica)

```
old/
├── DOCKER-DEPLOYMENT.md              # Como era o deploy Docker
├── DOCUMENTATION-AUDIT.md            # Análise de docs desatualizadas
├── docs/
│   ├── SUPPLY-CHAIN.md              # Política de versões npm
│   ├── SUPPLY-CHAIN-RECOVERY.md     # Resposta a ataque march/2026
│   ├── NPM-LOCK-JAN2026.md          # Bloqueio de pacotes até jan/2026
│   ├── NPM-BLOCKING-FLOWCHART.md    # Fluxo de validação npm
│   └── INCIDENT-RESPONSE.md         # Resposta a incidente
```

**Status**: 📦 Histórico  
**Motivo**: Relacionados a estratégias de proteção e incidentes passados  
**Utilidade**: Referência para entender decisões arquiteturais

---

## 🔄 Como Restaurar Arquivos

Se precisar restaurar um arquivo antigo para referência:

```bash
# Exemplo: restaurar docker-compose.yml
cp old/docker-compose.yml ./docker-compose.yml

# Exemplo: restaurar documentação
cp old/docs/SUPPLY-CHAIN.md docs/SUPPLY-CHAIN.md
```

---

## ⚡ Contexto de Migração

### De (Antes)
- ✅ Docker Compose para dev
- ✅ Multi-stage Dockerfile para prod
- ✅ Nginx em container
- ✅ Proteção npm contra supply chain attacks

### Para (Agora)
- ✅ Node.js nativo em EC2
- ✅ React build servido por nginx em EC2
- ✅ AWS SQS para fila de mensagens
- ✅ Variáveis de ambiente em EC2

---

## 📋 Checklist para Limpeza (Opcional)

Se optar por remover completamente (não recomendado):

```bash
# Remover Docker do root (manter old/ como backup)
rm -f docker-compose.yml Dockerfile.prod
rm -f packages/server/Dockerfile packages/client/Dockerfile
rm -f packages/client/nginx.conf

# Depois fazer commit:
git add -A
git commit -m "chore: remove Docker configs (archived in old/)"
```

---

## 🔗 Documentação Relacionada

- [DOCKER-DEPLOYMENT.md](DOCKER-DEPLOYMENT.md) - Guia de deploy antigo
- [DOCUMENTATION-AUDIT.md](DOCUMENTATION-AUDIT.md) - Análise completa de docs
- ../[README.md](../README.md) - Documentação principal do projeto
- ../docs/[IMPLEMENTATION-STATUS.md](../docs/IMPLEMENTATION-STATUS.md) - Status atual

---

## ⏰ Timeline

| Data | Evento |
|------|--------|
| 2026-04-25 | Migração para EC2 completa |
| 2026-04-25 | Docker/docs arquivados em old/ |
| 2026-04-25 | Análise de docs obsoletos |

---

**Última Atualização**: 2026-04-25

Para mais informações sobre o novo deploy em EC2, consulte a documentação principal do projeto.
