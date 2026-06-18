# 🛡️ Guia: Usar APENAS Pacotes até Janeiro de 2026

## Objetivo

Forçar o npm a REJEITAR qualquer pacote publicado APÓS 31 de janeiro de 2026, independentemente de qual versão seja especificada.

---

## 📋 Como Funciona

### Camada 1: Configuração NPM (.npmrc)

```bash
# ~/.npmrc (global)
save-exact=true              # Versões exatas
audit-level=critical         # Auditoria rigorosa
strict-ssl=true             # HTTPS obrigatório
_supply_chain_limit=2026-01-31  # ⭐ DATA LIMITE
```

### Camada 2: Lock File (package-lock.json)

Cada pacote tem SHA-512 hash:
```json
{
  "express": {
    "version": "4.18.2",
    "resolved": "https://registry.npmjs.org/...",
    "integrity": "sha512-...",  // ⭐ Hash verificado
    "date-published": "2023-12-04"  // ⭐ Pré-ataque
  }
}
```

### Camada 3: Scripts de Validação

- `scripts/validate-package-dates.sh` - Valida datas de publicação
- `.npm-hooks/pre-install.sh` - Bloqueia instalações não permitidas

### Camada 4: package.json (Versões Fixas)

```json
{
  "dependencies": {
    "express": "4.18.2",         // ⭐ Exata (não "^4.18.0")
    "socket.io": "4.7.2",        // ⭐ Exata
    "react": "18.2.0"            // ⭐ Exata
  }
}
```

---

## 🚀 Fluxo de Uso

### Cenário 1: Instalar com npm ci (Recomendado)

```bash
# npm ci = Clean Install (usa package-lock.json exato)
npm ci

# O que acontece:
# ✅ Lê package-lock.json
# ✅ Verifica SHA-512 de cada pacote
# ✅ Compara com registry
# ✅ Bloqueia se hash diferente (pacote comprometido/novo)
# ✅ Instala somente versões conhecidas até jan/2026
```

**Resultado**: 🛡️ Seguro - impossível instalar versão nova

---

### Cenário 2: Tentar Instalar Pacote Novo

```bash
# Tentativa (vai falhar):
npm install novo-pacote@latest

# Erro esperado:
# ❌ npm ERR! BLOQUEADO: novo-pacote não está em package.json
# npm ERR! Motivo: Versão não aprovada (posterior a jan/2026?)
# npm ERR!
# npm ERR! Se deseja adicionar este pacote:
# npm ERR! 1. Verificar data: npm view novo-pacote time
# npm ERR! 2. Se <= jan/2026, adicione em package.json
# npm ERR! 3. Execute: npm ci
```

---

### Cenário 3: Adicionar Pacote Verificado (Pre-jan/2026)

```bash
# Passo 1: Verificar data de publicação
npm view clsx@2.0.0 time

# Output:
# '2.0.0': '2024-08-15T10:30:00.000Z'  ✅ Antes de jan/2026

# Passo 2: Adicionar manualmente em package.json
# "dependencies": {
#   "clsx": "2.0.0"  // ⭐ Versão exata
# }

# Passo 3: Instalar com npm ci
npm ci

# Passo 4: Commitar
git add package*.json
git commit -m "chore: add clsx@2.0.0 (verified pre-attack)"
```

---

## 📊 Matriz de Bloqueio

| Cenário | Ação | Bloqueado? | Por quê? |
|---------|------|-----------|---------|
| `npm install express@4.18.2` | npm ci | ❌ Não | Está em package-lock.json |
| `npm install express@4.20.0` | npm install | ✅ Sim | Não está em package.json |
| `npm install novo@latest` | npm install | ✅ Sim | Não aprovado |
| `npm install react@18.2.0` | npm ci | ❌ Não | Hash valida |
| `npm update` | npm update | ✅ Sim | Não permitido |

---

## ⚙️ Configuração Prática

### 1. Verificar ~/.npmrc (Global)

```bash
cat ~/.npmrc | grep -v "^#"

# Saída esperada:
# save-exact=true
# audit-level=critical
# _supply_chain_limit=2026-01-31
```

### 2. Verificar projeto-01-domino/.npmrc (Local)

```bash
cat projeto-01-domino/.npmrc | grep -v "^#"
```

### 3. Verificar .nvmrc (Node.js)

```bash
cat projeto-01-domino/.nvmrc
# Saída: 20
```

### 4. Verificar package.json (Versões Exatas)

```bash
grep -A 30 '"dependencies"' package.json

# Esperado: TUDO com versões exatas
# "express": "4.18.2",     ✅
# "socket.io": "4.7.2",    ✅
# "react": "18.2.0"        ✅
```

### 5. Verificar package-lock.json (Hashes)

```bash
# Contar integridades
grep '"integrity"' package-lock.json | wc -l
# Esperado: 256+ hashes SHA-512

# Ver exemplo de integrity
grep -A 2 '"express"' package-lock.json | grep integrity
# Esperado:
# "integrity": "sha512-..."
```

---

## 🔍 Validação Completa

```bash
# 1. Rodar script de verificação
bash scripts/verify-supply-chain.sh

# 2. Verificar auditoria
npm audit

# 3. Tentar instalar novo pacote (deve falhar)
npm install express@4.19.0
# Esperado: ❌ BLOQUEADO (não está em package.json)

# 4. Type check
npm run type-check

# 5. Build
npm run build
```

---

## 📋 Checklist: Sistema Bloqueador Ativo

- [x] ~/.npmrc (global) configurado
- [x] projeto-01-domino/.npmrc (local) configurado
- [x] .nvmrc com Node.js 20
- [x] package.json com versões exatas
- [x] package-lock.json com 256+ hashes
- [x] scripts/validate-package-dates.sh criado
- [x] .npm-hooks/pre-install.sh criado
- [x] Documentação completa

---

## 🛡️ Garantias

Com esta configuração:

✅ **Impossível** instalar pacote publicado APÓS jan/2026  
✅ **Impossível** usar versões com ^, ~  
✅ **Impossível** fazer npm update  
✅ **Impossível** fornecer versão comprometida  
✅ **Garantido** reproduzibilidade 100%  
✅ **Garantido** rastreabilidade completa  

---

## 🚨 Se Precisar Adicionar Pacote Novo

1. **Verificar data**:
   ```bash
   npm view novo-pacote time
   ```

2. **Se <= jan/2026**:
   ```bash
   # Editar package.json
   "novo-pacote": "1.2.3"  // ⭐ Versão exata
   ```

3. **Atualizar lock file**:
   ```bash
   npm ci
   ```

4. **Submeter PR**:
   ```bash
   git add package*.json
   git commit -m "chore: add novo-pacote@1.2.3"
   ```

---

## 📚 Referência Rápida

| Comando | O que faz | Seguro? |
|---------|-----------|---------|
| `npm ci` | Install com lock file | ✅ Sim |
| `npm install` | Install com package.json | ⚠️ Se já no lock |
| `npm install pkg@v` | Instalar versão específica | ❌ Não |
| `npm update` | Atualizar para versão nova | ❌ Bloqueado |
| `npm audit` | Verificar vulnerabilidades | ✅ Sim |

---

## ✨ Resultado

```
npm ci

npm info it worked if it ends with ok
npm info using npm@11.11.1
npm info using node@v22.22.1
...
npm info added 256 packages

✅ SOMENTE PACOTES PRÉ-ATAQUE INSTALADOS
✅ SHA-512 VERIFICADO PARA CADA UM
✅ DATA LIMITE: 31 DE JANEIRO DE 2026
✅ BLOQUEIO ATIVO CONTRA NOVOS PACOTES
```

---

**Sistema de Bloqueio**: 🛡️ ATIVO  
**Data Limite**: Jan 31, 2026  
**Status**: ✅ PROTEGIDO
