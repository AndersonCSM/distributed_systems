# 📋 Documentos e Materiais Não Mais Importantes

**Data de Análise**: 2026-04-25  
**Contexto**: Migração Docker → EC2 AWS

---

## 🔴 DOCUMENTAÇÃO OBSOLETA (Recomendado Arquivar)

### 1. **SUPPLY-CHAIN.md**
- **Localização**: `docs/SUPPLY-CHAIN.md`
- **Motivo**: Estratégia de versionamento npm até janeiro de 2026
- **Tipo**: 📦 Histórico (já passou da data)
- **Pode deletar?**: ✅ SIM (cópia em `old/docs/`)
- **Manter se**: Necessário histórico de decisões arquiteturais

### 2. **SUPPLY-CHAIN-RECOVERY.md**
- **Localização**: `docs/SUPPLY-CHAIN-RECOVERY.md`
- **Motivo**: Documentação de 4 camadas de proteção contra ataque npm (march/2026)
- **Tipo**: 📦 Histórico
- **Pode deletar?**: ✅ SIM (cópia em `old/docs/`)
- **Manter se**: Compliance/auditoria de segurança

### 3. **NPM-LOCK-JAN2026.md**
- **Localização**: `docs/NPM-LOCK-JAN2026.md`
- **Motivo**: Guia de bloqueio de pacotes npm até janeiro de 2026 (data expirada)
- **Tipo**: ⏰ Expirado
- **Pode deletar?**: ✅ SIM (cópia em `old/docs/`)
- **Manter se**: Referência de como foi implementada proteção

### 4. **NPM-BLOCKING-FLOWCHART.md**
- **Localização**: `docs/NPM-BLOCKING-FLOWCHART.md`
- **Motivo**: Diagrama de fluxo de validação npm (sistema obsoleto)
- **Tipo**: 📋 Técnico/Obsoleto
- **Pode deletar?**: ✅ SIM (cópia em `old/docs/`)
- **Manter se**: Desejar documentar decisões técnicas antigas

### 5. **INCIDENT-RESPONSE.md**
- **Localização**: `docs/INCIDENT-RESPONSE.md`
- **Motivo**: Resposta a incidente de supply chain (march/2026)
- **Tipo**: 📦 Histórico
- **Pode deletar?**: ✅ SIM (cópia em `old/docs/`)
- **Manter se**: Compliance, lessons learned, incident history

---

## 🟡 DOCUMENTAÇÃO CONDICIONAL (Revisar/Atualizar)

### **SETUP.md**
- **Localização**: `docs/SETUP.md`
- **Motivo**: Instruções referem Docker Compose (não mais usado)
- **Tipo**: ⚠️ Desatualizado
- **Pode deletar?**: ❌ NÃO - Deve ser ATUALIZADO
- **Ação Recomendada**: 
  - Remover seção "Setup com Docker"
  - Adicionar seção "Deploy em EC2"
  - Manter seção "Setup Local"

---

## 🔴 ARQUIVOS DE CONFIGURAÇÃO OBSOLETOS

### Docker & Container Files (5 arquivos)

| Arquivo | Local | Status | Ação |
|---------|-------|--------|------|
| `docker-compose.yml` | root | ❌ Obsoleto | ↪️ Backup em old/ |
| `Dockerfile.prod` | root | ❌ Obsoleto | ↪️ Backup em old/ |
| `Dockerfile` | packages/server/ | ❌ Obsoleto | ↪️ Backup em old/ |
| `Dockerfile` | packages/client/ | ❌ Obsoleto | ↪️ Backup em old/ |
| `nginx.conf` | packages/client/ | ❌ Obsoleto | ↪️ Backup em old/ |

**Status**: Todos já arquivados em `old/`  
**Pode deletar?**: ✅ SIM (mantém backup)

---

## ✅ ARQUIVOS E DOCUMENTAÇÃO A MANTER

### 📌 DOCUMENTAÇÃO CRÍTICA

```
docs/
├── API.md                    ✅ ESSENCIAL
├── ARCHITECTURE.md           ✅ ESSENCIAL
├── FASE3-ROOMS.md           ✅ ESSENCIAL
├── IMPLEMENTATION-STATUS.md ✅ ESSENCIAL
└── SETUP.md                 ⚠️ ATUALIZAR
```

### 📌 CONFIGURAÇÃO ATIVA

```
root/
├── package.json             ✅ ESSENCIAL
├── package-lock.json        ✅ ESSENCIAL
├── .npmrc                   ✅ ESSENCIAL
├── .env.example             ✅ ESSENCIAL
├── .nvmrc                   ✅ ESSENCIAL
├── README.md                ✅ ESSENCIAL
├── SECURITY-CHECKLIST.md    ✅ IMPORTANTE
├── test-fase3.sh            ✅ IMPORTANTE
└── MIGRATION-REPORT.md      ✅ NOVO (referência)
```

### 📌 CÓDIGO ATIVO

```
packages/server/src/
├── config/aws.ts            ✅ CRÍTICO (SQS)
├── handlers/                ✅ ESSENCIAL
├── services/                ✅ ESSENCIAL
└── types/                   ✅ ESSENCIAL

packages/client/src/
├── App.tsx                  ✅ ESSENCIAL
├── components/              ✅ ESSENCIAL
├── pages/                   ✅ ESSENCIAL
└── services/                ✅ ESSENCIAL
```

---

## 📊 Contagem Completa

| Categoria | Qtd | Ação |
|-----------|-----|------|
| **Docs Obsoletas (deletar/arquivar)** | 5 | 📦 |
| **Docs Condicional (revisar)** | 1 | ⚠️ |
| **Arquivos Docker (deletar/arquivar)** | 5 | 📦 |
| **Docs/Arquivos Críticos (manter)** | 8+ | ✅ |
| **Total Analisado** | 19+ | — |

---

## 🎯 Recomendações de Ação

### ✅ JÁ REALIZADO

- [x] Arquivos Docker copiados para `old/`
- [x] Documentação histórica catalogada
- [x] `old/README.md` com explicações
- [x] `DOCKER-DEPLOYMENT.md` com histórico
- [x] `DOCUMENTATION-AUDIT.md` com análise
- [x] `MIGRATION-REPORT.md` com sumário

### 📋 TODO - Próximos Passos

**Opção A: Limpeza Parcial (Recomendado)**
```bash
# Manter tudo por enquanto, documentação está clara
# Revisitar em 2-3 meses se necessário
# Vantagem: Seguro, mantém referência
```

**Opção B: Limpeza Completa**
```bash
# Remover estes arquivos do root:
rm docker-compose.yml
rm Dockerfile.prod
rm packages/server/Dockerfile
rm packages/client/Dockerfile
rm packages/client/nginx.conf

# Remover docs obsoletas:
rm docs/SUPPLY-CHAIN.md
rm docs/SUPPLY-CHAIN-RECOVERY.md
rm docs/NPM-LOCK-JAN2026.md
rm docs/NPM-BLOCKING-FLOWCHART.md
rm docs/INCIDENT-RESPONSE.md

# Depois commitar:
git add -A
git commit -m "chore: remove obsolete Docker and docs (archived in old/)"
```

**Opção C: Gradual**
- Mês 1-2: Manter tudo, documentar bem (ATUAL)
- Mês 3: Remover Docker files
- Mês 4: Remover docs históricas

---

## 💡 Por que manter `old/` pasta?

1. ✅ **Segurança**: Backup local antes de deletar
2. ✅ **Git History**: Ainda existe no git history
3. ✅ **Referência**: Futuro dev pode ver como era antes
4. ✅ **Documentação**: Explicita o que foi descontinuado
5. ✅ **Compliance**: Mantém histórico de decisões

---

## 📝 Resumo Executivo

**O que pode ser seguramente deletado/arquivado:**

```
❌ NUNCA MAIS NECESSÁRIOS:
- docker-compose.yml
- Dockerfile.prod
- packages/*/Dockerfile
- packages/client/nginx.conf
- docs/SUPPLY-CHAIN.md
- docs/SUPPLY-CHAIN-RECOVERY.md
- docs/NPM-LOCK-JAN2026.md
- docs/NPM-BLOCKING-FLOWCHART.md
- docs/INCIDENT-RESPONSE.md

✅ SEMPRE NECESSÁRIOS:
- Toda configuração de AWS
- Código TypeScript (server/client)
- Tipos e serviços
- Configuração npm/Node
- API e documentação arquitetural
- README e checklist de segurança
```

---

**Última Atualização**: 2026-04-25  
**Classificação Concluída**: ✅  
**Próxima Revisão Sugerida**: 2026-06-25 (2 meses)

Para detalhes, ver:
- [old/README.md](old/README.md)
- [old/DOCUMENTATION-AUDIT.md](old/DOCUMENTATION-AUDIT.md)
- [old/DOCKER-DEPLOYMENT.md](old/DOCKER-DEPLOYMENT.md)
- [MIGRATION-REPORT.md](MIGRATION-REPORT.md)
