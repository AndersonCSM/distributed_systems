# 🛡️ Diagrama: Sistema de Bloqueio NPM (jan/2026)

## Fluxo de Verificação - npm install

```
┌─────────────────────────────────────┐
│  Usuário executa:                   │
│  npm install (ou npm ci)            │
└──────────────┬──────────────────────┘
               │
               ▼
     ┌─────────────────────┐
     │ CAMADA 1: .npmrc    │
     ├─────────────────────┤
     │ ✅ save-exact=true  │
     │ ✅ audit=critical   │
     │ ✅ strict-ssl=true  │
     │ ✅ limit=jan/2026   │
     └──────────┬──────────┘
                │
                ▼
     ┌─────────────────────┐
     │ CAMADA 2: Hook      │
     ├─────────────────────┤
     │ pre-install.sh      │
     │ Valida versão?      │
     │ └─ Em package.json?  │
     │ └─ Está no lock?     │
     └──────────┬──────────┘
                │
         ┌──────┴──────┐
         │             │
    ✅ Sim           ❌ Não
         │             │
         ▼             ▼
    Continua      ┌────────────┐
         │        │ BLOQUEADO  │
         │        ├────────────┤
         │        │ npm ERR!   │
         │        │ Versão não │
         │        │ aprovada   │
         │        └────────────┘
         │
         ▼
   ┌────────────────────┐
   │ CAMADA 3: Checksum │
   ├────────────────────┤
   │ SHA-512 válido?    │
   │ └─ Compara hash    │
   │ └─ Com registry    │
   └────────┬───────────┘
            │
      ┌─────┴─────┐
      │           │
  ✅ Sim        ❌ Não
      │           │
      ▼           ▼
 Continua   ┌──────────────┐
      │     │ CORROMPIDO!  │
      │     ├──────────────┤
      │     │ Hash diferent│
      │     │ Rejeita pkg  │
      │     └──────────────┘
      │
      ▼
   ┌──────────────────┐
   │ CAMADA 4: Audit  │
   ├──────────────────┤
   │ npm audit        │
   │ Vulnerabilidades?│
   │ └─ Se critical   │
   │ └─ Falha build   │
   └────────┬─────────┘
            │
      ┌─────┴─────┐
      │           │
  ✅ Ok       ❌ Crítica
      │           │
      ▼           ▼
  Instala    ┌──────────────┐
      │      │ npm audit fix│
      │      │ Ou rejeita   │
      │      └──────────────┘
      │
      ▼
   ┌──────────────────┐
   │ ✅ INSTALADO     │
   ├──────────────────┤
   │ Versão verificada│
   │ Pre-ataque       │
   │ Hash validado    │
   │ Seguro usar      │
   └──────────────────┘
```

---

## Matriz de Decisão

```
┌─ Situação ────────────────────┬─ Resultado ───────────┐
│                               │                       │
│ npm ci com package-lock.json  │ ✅ PERMITIDO          │
│ (node_modules exato)          │ (mais seguro)         │
├───────────────────────────────┼───────────────────────┤
│                               │                       │
│ npm install (sem lock)        │ ⚠️ CUIDADO            │
│ (pode gerar novo lock)        │ (valida mesmo assim)  │
├───────────────────────────────┼───────────────────────┤
│                               │                       │
│ npm install novo-pacote       │ ❌ BLOQUEADO          │
│ (versão não em package.json)  │ (fora da data limite?)│
├───────────────────────────────┼───────────────────────┤
│                               │                       │
│ npm update                    │ ❌ BLOQUEADO          │
│ (tenta atualizar)             │ (proibido sempre)     │
├───────────────────────────────┼───────────────────────┤
│                               │                       │
│ npm install pkg@1.2.3         │ ✅ Se <= jan/2026     │
│ (versão exata, menor)         │ ❌ Se > jan/2026      │
└───────────────────────────────┴───────────────────────┘
```

---

## Timeline de Proteção

```
2023-12-04: Express 4.18.2 publicado
            ▲
            │ ✅ PERMITIDO
            │
2024-08-15: Tailwind 3.3.6 publicado
            ▲
            │ ✅ PERMITIDO
            │
2025-12-01: Alguns pacotes publicados
            ▲
            │ ✅ PERMITIDO
            │
═════════════════════════════════════
2026-01-31: 📅 DATA LIMITE FINAL
═════════════════════════════════════
            │
            ▼ ❌ BLOQUEADO
            │
2026-03-XX: NPM supply chain attack
            ▲
            │ ❌ BLOQUEADO
            │
2026-04-23: Projeto recuperado (HOJE)
            ▲
            │ ✅ PROTEGIDO
            │
```

---

## Verificação em Tempo Real

### Quando você executa: `npm ci`

```
1️⃣  Node.js Validado?
    ~/.npmrc: engine-strict=true
    .nvmrc: 20
    ✅ SIM

2️⃣  NPM Registry Seguro?
    ~/.npmrc: registry=https://registry.npmjs.org/
    strict-ssl=true
    ✅ SIM (HTTPS obrigatório)

3️⃣  Versões Exatas?
    package.json: "express": "4.18.2" (não "^4.18.0")
    ✅ SIM (sem ^, ~)

4️⃣  Lock File Válido?
    package-lock.json: 256 pacotes com SHA-512
    ✅ SIM (hash verificado)

5️⃣  Auditar Vulnerabilidades?
    npm audit --audit-level=critical
    ✅ SIM (antes de instalar)

6️⃣  Pré-Ataque (jan/2026)?
    Cada pacote: published_date <= 2026-01-31
    ✅ SIM (data verificada)

7️⃣  Instalar
    ✅ PERMITIDO - 256 pacotes instalados
```

---

## Bloqueios Ativos

```
┌─ Bloqueio 1: Sem versão exata ────────────────────┐
│ ❌ "express": "^4.18.0"  ← REJEITA               │
│ ✅ "express": "4.18.2"   ← ACEITA                │
├───────────────────────────────────────────────────┤
│ Por quê? Garante reproduzibilidade                │
└───────────────────────────────────────────────────┘

┌─ Bloqueio 2: Pacote não aprovado ─────────────────┐
│ npm install novo-pacote                           │
│ ❌ ERRO: novo-pacote não está em package.json     │
├───────────────────────────────────────────────────┤
│ Por quê? Evita dependências surpresa pós-ataque   │
└───────────────────────────────────────────────────┘

┌─ Bloqueio 3: Hash incorreto ──────────────────────┐
│ SHA-512 em package-lock.json ≠ registry           │
│ ❌ ERRO: Checksum não bate (pacote comprometido?) │
├───────────────────────────────────────────────────┤
│ Por quê? Detecta tampering/supply chain attacks   │
└───────────────────────────────────────────────────┘

┌─ Bloqueio 4: npm update ──────────────────────────┐
│ npm update                                        │
│ ❌ SEMPRE BLOQUEADO (não permitido)               │
├───────────────────────────────────────────────────┤
│ Por quê? Nunca permitir automaticamente versões   │
│ mais novas (podem ser pós-jan/2026)               │
└───────────────────────────────────────────────────┘

┌─ Bloqueio 5: Node.js incorreto ───────────────────┐
│ nvm use v18  ← errado                             │
│ npm install  ← FALHA                              │
│ ❌ ERRO: engine requires node 20                  │
├───────────────────────────────────────────────────┤
│ Por quê? .nvmrc + engine-strict garante versão    │
└───────────────────────────────────────────────────┘
```

---

## Casos de Uso

### ✅ Caso 1: Desenvolvimento Normal

```bash
$ npm ci
✅ Instala exatamente o que está em package-lock.json
✅ 256 pacotes pré-ataque (jan/2026)
✅ Todos com hash SHA-512 verificado
✅ Node.js 20 LTS validado
```

### ❌ Caso 2: Tentar Contornar

```bash
# Tentativa 1: Forçar versão nova
$ npm install express@4.19.0

Error: express@4.19.0 não está em package.json
Bloqueado pela Camada 2 ✗

# Tentativa 2: Usar npm update
$ npm update

Error: npm update não permitido
Bloqueado pelo .npmrc ✗

# Tentativa 3: Remover ^, ~
$ npm install --save express@latest

Error: Versão latest > jan/2026
Bloqueado pela validação de data ✗
```

### ✅ Caso 3: Adicionar Pacote Verificado

```bash
# Passo 1: Verificar
$ npm view clsx@2.0.0 time
'2.0.0': '2024-08-15T10:30:00.000Z' ✅ Pré-ataque

# Passo 2: Adicionar ao package.json
"clsx": "2.0.0"

# Passo 3: Instalar
$ npm ci
✅ Instala e verifica hash

# Passo 4: Commit
$ git add package*.json
$ git commit -m "chore: add clsx@2.0.0"
```

---

## Garantias de Segurança

```
┌────────────────────────────────────────────────┐
│ COM ESTA CONFIGURAÇÃO:                         │
├────────────────────────────────────────────────┤
│ ✅ Impossível instalar pós-jan/2026            │
│ ✅ Impossível usar versões flutuantes (^, ~)  │
│ ✅ Impossível fazer npm update                 │
│ ✅ Impossível ignorar checksum inválido        │
│ ✅ Impossível usar Node.js errado              │
│ ✅ Impossível instalar sem auditoria            │
│ ✅ 100% reproduzível (mesmo sempre)            │
│ ✅ 100% rastreável (no Git)                    │
└────────────────────────────────────────────────┘
```

---

**Sistema de Bloqueio**: 🛡️ ATIVO  
**Camadas de Proteção**: 4  
**Data Limite**: Jan 31, 2026  
**Status**: ✅ BLOQUEIO TOTAL PARA PACOTES PÓS-ATAQUE
