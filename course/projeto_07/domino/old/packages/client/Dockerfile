FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependência
COPY package.json package-lock.json ./
COPY packages/client ./packages/client

# Instalar dependências
RUN npm ci

ENV VITE_API_URL=http://server:3001

EXPOSE 5173

CMD ["npm", "run", "dev", "-w", "client"]
