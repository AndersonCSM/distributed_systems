FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependência
COPY package.json package-lock.json ./
COPY packages/server ./packages/server

# Instalar dependências
RUN npm ci

# Build TypeScript
RUN npm run build -w server

ENV NODE_ENV=development
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "run", "dev", "-w", "server"]
