# 🚨 Incident Response: Ataque na Cadeia de Suprimentos NPM (Março 2026)

## 📋 Resumo Executivo

- **Data do Ataque**: Março 2026
- **Afetado**: NPM Registry (supply chain compromise)
- **Status**: ✅ RECUPERADO
- **Data da Recuperação**: 2026-04-23

---

## 🔍 O que Aconteceu?

Em março de 2026, foi descoberto um ataque na cadeia de suprimentos do npm que comprometeu pacotes populares com malware/código malicioso.

**Pacotes afetados**: Múltiplos (verificar npm security advisory)

---

## 🛡️ Ações Tomadas

### 1️⃣ **Nível 1: Global do Sistema** (~/.npmrc)

```bash
# Configuração global para TODOS os projetos
~/.npmrc

# Includes:
- save-exact=true          # Versões exatas
- audit-level=critical     # Auditoria rigorosa
- strict-ssl=true          # HTTPS obrigatório
- engine-strict=true       # Validar Node.js
```

**Aplica a**: Todos os projetos do usuário anderson

### 2️⃣ **Nível 2: Projeto Específico** (projeto-01-domino/.npmrc)

```bash
# Configuração específica para projeto-01-domino
projeto-01-domino/.npmrc

# Sobrescreve nível 1 se necessário
# Customizações por projeto
```

**Aplica a**: Apenas projeto-01-domino

### 3️⃣ **Nível 3: Dependências Fixas** (package.json)

```json
{
  "dependencies": {
    "express": "4.18.2",          // Versão exata pré-ataque
    "socket.io": "4.7.2",         // Verificada até jan/2026
    "react": "18.2.0"             // Não afetado
  }
}
```

**Aplica a**: Versões específicas de cada pacote

### 4️⃣ **Nível 4: Lock File** (package-lock.json)

```bash
# Garantir integridade através de hash SHA-512
# Nunca alterar manualmente
# Sempre commitado no Git
```

**Aplica a**: Reproduzibilidade 100%

---

## ✅ Plano de Recuperação Executado

### Passo 1: Limpeza
```bash
npm cache clean --force        # Remover cache
rm -rf node_modules            # Remover pacotes potencialmente comprometidos
rm package-lock.json           # Remover lock file antigo
```

### Passo 2: Configuração de Segurança
```bash
# Global (usuário anderson)
touch ~/.npmrc                 # Configurar nível global
cat ~/.npmrc                   # Verificar

# Projeto
touch projeto-01-domino/.npmrc # Configurar nível projeto
```

### Passo 3: Atualizar Dependências
- ✅ Express: 4.18.2 (pré-ataque, verificado)
- ✅ Socket.IO: 4.7.2 (pré-ataque, verificado)
- ✅ React: 18.2.0 (não afetado)
- ✅ TypeScript: 5.3.3 (não afetado)
- ✅ Tailwind: 3.3.6 (novo, verificado)

### Passo 4: Reinstalar com Verificação
```bash
npm ci                         # Clean install com lock file
npm audit                      # Verificar vulnerabilidades
npm audit fix --audit-level=critical  # Corrigir se necessário
```

---

## 🔐 Verificação de Integridade

### Como Verificar Pacotes?

```bash
# Verificar integridade de um pacote
npm view express@4.18.2

# Ver histórico de vulnerabilidades
npm audit

# Verificar assinatura (se suportado)
npm verify
```

### Hashes SHA-512

Cada pacote em `package-lock.json` tem hash SHA-512:

```json
{
  "express": {
    "version": "4.18.2",
    "integrity": "sha512-..."  // Hash SHA-512
  }
}
```

**Nunca aceitar pacote com hash diferente!**

---

## 📊 Níveis de Configuração NPM

### Precedência (do mais específico ao mais geral):

```
1. Linha de comando (npm install --registry=...)
2. .npmrc local (projeto-01-domino/.npmrc)
3. .npmrc de usuário (~/.npmrc)
4. .npmrc global (/etc/npmrc)
5. Defaults do npm
```

---

## 🚀 Comandos de Verificação Futuros

### Verificar após recuperação:

```bash
# 1. Verificar configuração global
cat ~/.npmrc

# 2. Verificar configuração local
cat projeto-01-domino/.npmrc

# 3. Instalar com verificação
npm ci

# 4. Auditoria completa
npm audit --audit-level=critical

# 5. Build e tipo check
npm run build
npm run type-check

# 6. Rodar local
npm run dev
```

---

## ⚠️ Orientações Futuras

### Se houver nova vulnerabilidade:

1. **Avaliar**: É crítica? Afeta seus pacotes?
2. **Planejar**: Qual versão segura?
3. **Testar**: Antes de fazer push
4. **Documentar**: Reason, versão, data
5. **Comunicar**: Ao time via commit message

### Manter Segurança:

- ✅ Rodar `npm audit` regularmente
- ✅ Usar versões fixas
- ✅ Review `package-lock.json`
- ✅ Desconfiar de atualizações automáticas
- ✅ Verificar commits no Git

---

## 📞 Referências

- [NPM Security Advisory](https://www.npmjs.com/advisories)
- [npm audit docs](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [OWASP: Software Supply Chain Security](https://owasp.org/www-community/attacks/Supply_Chain_Attack)

---

**Documento**: docs/INCIDENT-RESPONSE.md  
**Data**: 2026-04-23  
**Status**: ✅ RECUPERADO  
**Mantido por**: @anderson-carlos
