# ==========================================
# Estágio 1: Build (Ambiente Node.js)
# ==========================================
FROM node:22-alpine AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência primeiro (otimiza o cache do Docker)
COPY package*.json ./

# Instala as dependências
RUN npm ci

# Copia o restante do código do projeto
COPY . .

# Executa o build de produção (TypeScript/JavaScript + Tailwind)
# OBS: Se estiver usando Vite, o padrão é 'dist'. Se for Create React App, é 'build'.
RUN npm run build

# ==========================================
# Estágio 2: Servidor de Produção (Nginx)
# ==========================================
FROM nginx:alpine

# Remove os arquivos padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos gerados no Estágio 1 para a pasta pública do Nginx
# OBS: Altere "/app/dist" para "/app/build" se usar Create React App.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80 (padrão do Nginx)
EXPOSE 80

# Inicia o servidor Nginx
CMD ["nginx", "-g", "daemon off;"]