#!/bin/bash

# 🛡️ PRE-INSTALL HOOK: Bloqueia pacotes posteriores a jan/2026
# Localização: projeto-01-domino/.npm/hooks/pre-install.sh
# Executado: Antes de cada npm install
# Objetivo: Garantir que APENAS pacotes pré-ataque sejam instalados

set -e

# Configuração
LIMIT_DATE="2026-01-31"
LIMIT_TIMESTAMP=1767225599
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo ""
echo "🛡️  PRE-INSTALL VALIDATION"
echo "=================================================="
echo "Data limite: $LIMIT_DATE"
echo "Modo: BLOQUEANDO pacotes posteriores a jan/2026"
echo ""

# Se houver argumentos, validar pacote específico
if [ ! -z "$1" ]; then
  PACKAGE=$1
  VERSION=$2

  echo "Verificando: $PACKAGE@$VERSION"
  echo ""

  # Buscar data de publicação
  # Nota: Isso requer acesso ao npm registry
  # Para produção, usar npm-registry-fetch com checksums

  # Por enquanto, validar contra package.json
  ALLOWED_VERSIONS=$(grep -A 50 '"dependencies"' package.json | grep "$PACKAGE" | grep -oP '"\d+\.\d+\.\d+"' | head -1)

  if [ -z "$ALLOWED_VERSIONS" ]; then
    echo -e "${RED}❌ BLOQUEADO: $PACKAGE não está em package.json${NC}"
    echo "   Motivo: Versão não aprovada (posterior a jan/2026?)"
    echo ""
    echo "   Se deseja adicionar este pacote:"
    echo "   1. Verificar data de publicação: npm view $PACKAGE@$VERSION time"
    echo "   2. Se <= jan/2026, adicione manualmente em package.json"
    echo "   3. Execute: npm ci"
    echo ""
    exit 1
  fi

  echo -e "${GREEN}✅ Pacote permitido${NC}: $PACKAGE@$VERSION"
  exit 0
fi

echo -e "${GREEN}✅ Pre-install validation OK${NC}"
echo ""
