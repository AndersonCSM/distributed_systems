#!/bin/bash

# 🛡️ VALIDADOR DE DATA - Rejeita pacotes após jan/2026
# Uso: npm install (com pre-install hook)
# Objetivo: Garantir que APENAS pacotes de até jan/2026 sejam instalados

set -e

# Data limite (timestamp: jan 31, 2026 23:59:59 UTC)
LIMIT_DATE="2026-01-31"
LIMIT_TIMESTAMP=1767225599  # Unix timestamp de 31/01/2026

# Cor de saída
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "🛡️  Validando versões de pacotes..."
echo "Data limite: $LIMIT_DATE (Jan 31, 2026)"
echo ""

# Função para converter data ISO para timestamp
date_to_timestamp() {
  date -d "$1" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$1" +%s 2>/dev/null || echo "0"
}

# Função para verificar versão de pacote
check_package_date() {
  local package_name=$1
  local package_version=$2

  # Buscar informação do pacote no npm registry
  local package_info=$(npm view "$package_name@$package_version" time --json 2>/dev/null || echo '{}')

  # Extrair data de publicação
  local publish_date=$(echo "$package_info" | grep -oP '"'"$package_version"'"\s*:\s*"\K[^"]+' || echo "")

  if [ -z "$publish_date" ]; then
    # Se não conseguir obter data, usar data da tag git (fallback)
    publish_date=$(npm view "$package_name@$package_version" dist.tarball 2>/dev/null | grep -oP '\d{4}-\d{2}-\d{2}' | head -1 || echo "")
  fi

  if [ ! -z "$publish_date" ]; then
    local publish_timestamp=$(date_to_timestamp "$publish_date")

    if [ "$publish_timestamp" -gt "$LIMIT_TIMESTAMP" ]; then
      echo -e "${RED}❌ BLOQUEADO${NC}: $package_name@$package_version"
      echo "   Data: $publish_date (APÓS ${LIMIT_DATE})"
      return 1
    else
      echo -e "${GREEN}✅ OK${NC}: $package_name@$package_version"
      echo "   Data: $publish_date"
      return 0
    fi
  fi

  return 0
}

# Extrair pacotes do package.json
PACKAGES=$(jq -r '.dependencies, .devDependencies | to_entries[] | "\(.key)@\(.value)"' package.json 2>/dev/null || echo "")

if [ -z "$PACKAGES" ]; then
  echo "⚠️  Nenhum pacote encontrado em package.json"
  exit 0
fi

echo "Verificando pacotes..."
echo ""

FAILED=0
for package in $PACKAGES; do
  check_package_date "${package%@*}" "${package##*@}" || ((FAILED++))
  echo ""
done

if [ $FAILED -gt 0 ]; then
  echo -e "${RED}🚨 ERRO: $FAILED pacote(s) com data posterior a $LIMIT_DATE${NC}"
  echo "Instalação bloqueada!"
  exit 1
else
  echo -e "${GREEN}✅ Todos os pacotes estão na data limite ou anteriores${NC}"
  exit 0
fi
