# Projeto 2 - Aplicacao React (Vite)

Aplicacao frontend desenvolvida em React com Vite para suporte ao experimento de deploy em instancia EC2.

## Requisitos

- Node.js 18+
- npm

## Executar Localmente

```bash
npm install
npm run dev
```

Aplicacao em ambiente de desenvolvimento:

- http://localhost:5173

## Scripts Disponiveis

- npm run dev: inicia servidor de desenvolvimento
- npm run build: gera build de producao na pasta dist
- npm run preview: publica localmente a build gerada
- npm run lint: executa analise de codigo com ESLint

## Deploy

O passo a passo de deploy em EC2 (build, upload e Apache) esta em:

- [../documentacao-deploy-ec2.md](../documentacao-deploy-ec2.md)
