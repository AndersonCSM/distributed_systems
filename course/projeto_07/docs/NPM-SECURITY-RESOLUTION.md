# 📋 Resolução: NPM Warnings e Vulnerabilidades

**Data**: 2026-04-25  
**Status**: ✅ Resolvido

---

## ✅ Problemas Resolvidos

### 1. **Warnings de Config Obsoletas** ✅

**Problema**: 
```
npm warn Unknown project config "ci-mode"
npm warn Unknown user config "audit-signatures"
npm warn Unknown user config "_supply_chain_limit"
npm warn Unknown user config "fetch-checksum-strict"
```

**Causa**: Configurações de proteção contra ataque de supply chain (março 2026) que não são mais reconhecidas pelo npm 10+

**Solução**:
- ✅ Atualizado `.npmrc` (projeto) - removidas opções obsoletas
- ✅ Atualizado `~/.npmrc` (global) - removidas opções obsoletas
- ✅ Mantidas apenas opções válidas e necessárias

**Verificação**:
```bash
npm install  # Agora sem warnings!
```

---

### 2. **Package-lock.json no .gitignore** ✅

**Problema**: `package-lock.json` estava ignorado, impedindo `npm audit` funcionar

**Causa**: Configuração para monorepo, mas causa problemas com workspaces

**Solução**:
- ✅ Removido `package-lock.json` do `.gitignore`
- ✅ Adicionado suporte para `npm-shrinkwrap.json` (alternativa para workspaces)
- ✅ Gerado novo `npm-shrinkwrap.json` com `npm shrinkwrap`

**Verificação**:
```bash
npm audit  # Agora funciona!
```

---

## 📊 17 Vulnerabilidades Identificadas

### Status das Vulnerabilidades

| Pacote | Versão | Severidade | Tipo | Fix Disponível |
|--------|--------|-----------|------|---|
| @remix-run/router | <=1.23.1 | 🔴 High | XSS | Sim (breaking) |
| body-parser | <=1.20.3 | 🔴 High | DoS | Sim (breaking) |
| cookie | <0.7.0 | 🔴 High | OOB | Sim (breaking) |
| path-to-regexp | <=0.1.12 | 🔴 High | ReDoS | Sim (breaking) |
| send | <0.19.0 | 🔴 High | Template Injection | Sim (breaking) |
| esbuild | <=0.24.2 | 🟠 Moderate | CORS/CSRF | Sim (breaking) |
| postcss | <8.5.10 | 🟠 Moderate | XSS | Sim |
| qs | <=6.14.1 | 🟠 Moderate | DoS | Sim (breaking) |
| uuid | <14.0.0 | 🟠 Moderate | Buffer | Sim (breaking) |
| (5 Low) | - | 🟡 Low | - | Sim |

---

## 🔧 Opções para Resolver

### Opção A: Atualizar Tudo (Recomendado) ⚠️

```bash
# Instalar as versões corrigidas (pode quebrar compatibilidade)
npm audit fix --force
```

**Consequências**:
- ✅ Resolve todas as 17 vulnerabilidades
- ⚠️ Atualiza dependências (breaking changes)
- ⚠️ Pode quebrar código existente
- ⚠️ Necessário testar completamente

**Depois**:
```bash
npm run type-check  # Verificar tipos
npm run build       # Fazer build
npm run dev         # Testar em dev
```

### Opção B: Atualizar Seletivamente (Mais Seguro)

```bash
# Exemplo: Atualizar apenas cookie
npm install cookie@0.7.0
npm install socket.io@4.8.3  # Socket.io depende de cookie

# Depois testar
npm run build
```

### Opção C: Aceitar e Monitorar (Temporário)

- ✅ Manter versões fixas por enquanto
- ⚠️ Monitorar vulnerabilidades
- ✅ Planejar atualização em próxima milestone

---

## 📁 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `.npmrc` (projeto) | Removidas: `ci-mode` |
| `~/.npmrc` (global) | Removidas: `audit-signatures`, `_supply_chain_limit`, `fetch-checksum-strict` |
| `.gitignore` | Removido `package-lock.json` (será commitado) |
| `npm-shrinkwrap.json` | ✅ Criado (gerado com `npm shrinkwrap`) |

---

## 📝 Documentação de Configuração

Ver [`docs/config/README.md`](../docs/config/README.md) para mais detalhes sobre configuração npm.

---

## 🎯 Próximos Passos

### Imediato (Hoje)
- [ ] Revisar lista de vulnerabilidades acima
- [ ] Decidir entre Opção A, B ou C
- [ ] Commitar mudanças (`.npmrc`, `.gitignore`, `npm-shrinkwrap.json`)

### Se escolher Opção A (Fix All):
```bash
npm audit fix --force
npm run type-check
npm run build  
npm run dev    # Testar tudo
git add -A
git commit -m "fix: security updates via npm audit fix"
```

### Se escolher Opção B (Seletivo):
```bash
# Atualizar um por um
npm install PACOTE@VERSION
npm run build  # Testar
git add package*.json npm-shrinkwrap.json
git commit -m "fix: update PACOTE to version X"
```

### Se escolher Opção C (Monitor):
```bash
# Apenas commitar as mudanças de config
git add .npmrc .gitignore npm-shrinkwrap.json
git commit -m "chore: update npm config and add shrinkwrap"
```

---

## 📞 Referências

- [npm audit documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [npm-shrinkwrap vs package-lock](https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json)
- [GitHub Security Advisories](https://github.com/advisories)

---

**Última Atualização**: 2026-04-25

Para dúvidas, consulte os links acima ou revise documentação de segurança.
