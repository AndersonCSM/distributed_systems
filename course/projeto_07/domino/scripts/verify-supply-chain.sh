#!/bin/bash

# 🛡️ Script de Verificação de Segurança da Cadeia de Suprimentos
# Uso: bash scripts/verify-supply-chain.sh
# Objetivo: Verificar integridade após recuperação de ataque

set -e

echo "🛡️  VERIFICAÇÃO DE SEGURANÇA - CADEIA DE SUPRIMENTOS"
echo "=================================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
CHECKS_PASSED=0
CHECKS_FAILED=0

check_result() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((CHECKS_FAILED++))
  fi
}

# ============================================
# 1. VERIFICAR CONFIGURAÇÃO NPM GLOBAL
# ============================================
echo "1️⃣  CONFIGURAÇÃO GLOBAL NPM"
echo "---"
if [ -f ~/.npmrc ]; then
  echo "Arquivo: ~/.npmrc"
  echo "Conteúdo:"
  cat ~/.npmrc | grep -E "^[^#]" | head -10
  echo ""
  check_result "Arquivo ~/.npmrc existe"
else
  echo -e "${RED}❌ ~/.npmrc não encontrado!${NC}"
  ((CHECKS_FAILED++))
fi

# ============================================
# 2. VERIFICAR CONFIGURAÇÃO LOCAL DO PROJETO
# ============================================
echo ""
echo "2️⃣  CONFIGURAÇÃO LOCAL DO PROJETO"
echo "---"
if [ -f ".npmrc" ]; then
  echo "Arquivo: .npmrc (local)"
  cat .npmrc | grep -E "^[^#]" | head -5
  echo ""
  check_result "Arquivo .npmrc local existe"
else
  echo "⚠️  Nenhum .npmrc local (usando global)"
fi

# ============================================
# 3. VERIFICAR NODE.JS
# ============================================
echo ""
echo "3️⃣  VERIFICAÇÃO NODE.JS"
echo "---"
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo "Node.js: $NODE_VERSION"
echo "NPM: $NPM_VERSION"
[[ "$NODE_VERSION" == *"v20"* || "$NODE_VERSION" == *"v21"* || "$NODE_VERSION" == *"v22"* ]]
check_result "Node.js 20+ (LTS recomendado)"

# ============================================
# 4. VERIFICAR package.json
# ============================================
echo ""
echo "4️⃣  VERIFICAÇÃO package.json"
echo "---"
if [ -f "package.json" ]; then
  check_result "package.json existe"

  # Verificar versões exatas (sem ^, ~)
  INVALID_VERSIONS=$(grep -E '"(.*?)": "[~^]' package.json || true)
  if [ -z "$INVALID_VERSIONS" ]; then
    check_result "Todas as versões são exatas (sem ^, ~)"
  else
    echo -e "${YELLOW}⚠️  Versões não exatas encontradas:${NC}"
    echo "$INVALID_VERSIONS"
    ((CHECKS_FAILED++))
  fi
else
  echo -e "${RED}❌ package.json não encontrado!${NC}"
  ((CHECKS_FAILED++))
fi

# ============================================
# 5. VERIFICAR package-lock.json
# ============================================
echo ""
echo "5️⃣  VERIFICAÇÃO package-lock.json"
echo "---"
if [ -f "package-lock.json" ]; then
  check_result "package-lock.json existe (for reproducibility)"

  # Verificar integridade
  LOCK_DATE=$(stat -f %Sm -t "%Y-%m-%d" package-lock.json 2>/dev/null || stat --format=%y package-lock.json 2>/dev/null | cut -d' ' -f1)
  echo "Data: $LOCK_DATE"
else
  echo -e "${YELLOW}⚠️  package-lock.json não encontrado${NC}"
  ((CHECKS_FAILED++))
fi

# ============================================
# 6. VERIFICAR npm audit
# ============================================
echo ""
echo "6️⃣  AUDITORIA NPM (npm audit)"
echo "---"
if command -v npm &> /dev/null; then
  AUDIT_OUTPUT=$(npm audit 2>&1 || true)

  if echo "$AUDIT_OUTPUT" | grep -q "0 vulnerabilities"; then
    echo -e "${GREEN}✅ Nenhuma vulnerabilidade encontrada${NC}"
    ((CHECKS_PASSED++))
  else
    # Contar vulnerabilidades
    CRITICAL=$(echo "$AUDIT_OUTPUT" | grep -o "critical" | wc -l)
    HIGH=$(echo "$AUDIT_OUTPUT" | grep -o "high" | wc -l)

    if [ "$CRITICAL" -gt 0 ]; then
      echo -e "${RED}❌ Vulnerabilidades CRÍTICAS encontradas!${NC}"
      echo "Críticas: $CRITICAL"
      ((CHECKS_FAILED++))
    elif [ "$HIGH" -gt 0 ]; then
      echo -e "${YELLOW}⚠️  Vulnerabilidades ALTAS encontradas${NC}"
      echo "Altas: $HIGH"
      ((CHECKS_FAILED++))
    else
      echo -e "${GREEN}✅ Apenas vulnerabilidades baixas${NC}"
      ((CHECKS_PASSED++))
    fi
  fi
else
  echo "⚠️  npm não encontrado"
fi

# ============================================
# 7. VERIFICAR .gitignore
# ============================================
echo ""
echo "7️⃣  VERIFICAÇÃO .gitignore"
echo "---"
if [ -f ".gitignore" ]; then
  check_result ".gitignore existe"

  if grep -q "node_modules" .gitignore; then
    check_result "node_modules em .gitignore"
  else
    echo -e "${YELLOW}⚠️  node_modules NÃO está em .gitignore${NC}"
    ((CHECKS_FAILED++))
  fi

  if grep -q ".env" .gitignore; then
    check_result ".env em .gitignore"
  fi
else
  echo -e "${RED}❌ .gitignore não encontrado!${NC}"
  ((CHECKS_FAILED++))
fi

# ============================================
# 8. VERIFICAR COMMITS RECENTES
# ============================================
echo ""
echo "8️⃣  VERIFICAÇÃO GIT"
echo "---"
if [ -d ".git" ]; then
  check_result "Repositório Git existe"

  RECENT_COMMITS=$(git log --oneline -5 2>/dev/null || echo "")
  if [ ! -z "$RECENT_COMMITS" ]; then
    echo "Commits recentes:"
    echo "$RECENT_COMMITS" | head -3
  fi
else
  echo -e "${YELLOW}⚠️  Não é um repositório Git${NC}"
fi

# ============================================
# RESUMO
# ============================================
echo ""
echo "=================================================="
echo "📊 RESUMO DA VERIFICAÇÃO"
echo "=================================================="
echo -e "${GREEN}✅ Passou: $CHECKS_PASSED${NC}"
echo -e "${RED}❌ Falhou: $CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 SEGURANÇA DA CADEIA DE SUPRIMENTOS: OK${NC}"
  exit 0
elif [ $CHECKS_FAILED -le 2 ]; then
  echo -e "${YELLOW}⚠️  SEGURANÇA: COM AVISOS${NC}"
  exit 1
else
  echo -e "${RED}🚨 SEGURANÇA: CRÍTICA - AÇÃO NECESSÁRIA${NC}"
  exit 2
fi
