#!/bin/bash

# Script de teste da Fase 3: Gerenciamento de Salas
# Simula operações de sala via HTTP e WebSocket mock

echo "🎮 TESTE FASE 3: GERENCIAMENTO DE SALAS"
echo "========================================"

SERVER_URL="http://localhost:3001"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "\n${BLUE}1. Health Check${NC}"
curl -s "$SERVER_URL/health" | python3 -m json.tool

# 2. Info do Servidor
echo -e "\n${BLUE}2. Info do Servidor${NC}"
curl -s "$SERVER_URL/info" | python3 -m json.tool

# 3. Listar Filas SQS (debug)
echo -e "\n${BLUE}3. Filas SQS Disponíveis${NC}"
curl -s "$SERVER_URL/debug/sqs-queues" | python3 -m json.tool

echo -e "\n${GREEN}✅ Testes básicos completos!${NC}"
echo -e "\n${YELLOW}Próximos passos:${NC}"
echo "1. Conectar cliente WebSocket para testar socket events"
echo "2. Testar: create_room, join_room, list_rooms"
echo "3. Verificar mensagens SQS no AWS Console"
echo "4. Ver logs do servidor em: npm run dev"
