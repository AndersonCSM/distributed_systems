# Developer Guide — Campus Lost and Found (MVP Serverless)

> MVP for delivery. Stack: React PWA (Amplify) + API Gateway + Lambda (Node.js) + RDS Aurora PostgreSQL.
> Pattern reference: `skills.md` → Pattern B (Serverless Full-Stack), projects 10, 11 & 12.

## Architecture

```
Android PWA (Chrome)
        │
   [Amplify CDN]
   anderson.grupo5.sd.ufersa.dev.br
        │
   [Route 53]
        │
   [API Gateway — REST — prod stage]
   api.anderson.grupo5.sd.ufersa.dev.br
        │
   [Lambda — Node.js 20 — index.mjs]
        │
   [RDS Aurora PostgreSQL — public endpoint]
```

## Project Structure (minimal)

```
projeto_final/
├── lambda/
│   ├── index.mjs       # Single Lambda handler — all routes
│   └── package.json
├── frontend/           # React + Vite PWA (already implemented)
├── developer.md
├── infra.md
└── projeto.md
```

---

## Phase 1 — Database Schema

Run once from `psql` or pgAdmin (after RDS is up — see `infra.md`):

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Custom types (PostgreSQL ENUM)
CREATE TYPE user_role AS ENUM ('user', 'adm');
CREATE TYPE item_status AS ENUM ('ativo', 'devolvido');

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'user',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  foto VARCHAR(500),
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  local_encontrado VARCHAR(300),
  status item_status DEFAULT 'ativo',
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed: admin user — password: admin123
INSERT INTO usuarios (nome, email, senha_hash, role) VALUES
('Admin', 'admin@campus.br',
 '$2a$10$byDPvcYO2QA.Gqdmx.ZX7ONf8X9ObrPyvb03nspWF2qTPFT6I9K7O',
 'adm');
```

> The bcrypt hash above is for `admin123` with salt rounds 10.

---

## Phase 2 — Lambda Function

### 2.1 Initialize Lambda Project

```bash
mkdir lambda && cd lambda
npm init -y

# Exact versions — supply chain policy
npm install pg@8.11.3 bcryptjs@2.4.3 jsonwebtoken@9.0.2
```

**`package.json`:**
```json
{
  "name": "achados-perdidos-lambda",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "pg": "8.11.3",
    "bcryptjs": "2.4.3",
    "jsonwebtoken": "9.0.2"
  }
}
```

### 2.2 Lambda Handler (`lambda/index.mjs`)

```javascript
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { Pool } = pg;

// DB connection pool (reused across warm Lambda invocations)
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  ssl: { rejectUnauthorized: false },  // required for RDS public access
  max: 5,
});

const JWT_SECRET = process.env.JWT_SECRET;

// CORS headers for every response
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
};

const res = (status, body) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json', ...CORS },
  body: JSON.stringify(body),
});

// JWT middleware helper
const verifyToken = (event) => {
  const auth = event.headers?.Authorization || event.headers?.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.split(' ')[1], JWT_SECRET);
  } catch {
    return null;
  }
};

export const handler = async (event) => {
  const { httpMethod, path, body: rawBody } = event;

  // Handle preflight
  if (httpMethod === 'OPTIONS') return res(200, {});

  const body = rawBody ? JSON.parse(rawBody) : {};

  // ─── POST /auth/login ─────────────────────────────────────────────
  if (httpMethod === 'POST' && path === '/auth/login') {
    const { email, senha } = body;
    if (!email || !senha) return res(400, { error: 'Email e senha obrigatórios' });

    // PostgreSQL uses $1, $2 placeholders (NOT ?)
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1', [email]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(senha, user.senha_hash))) {
      return res(401, { error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res(200, { token, usuario: { id: user.id, nome: user.nome, email: user.email, role: user.role } });
  }

  // ─── Require auth for all /itens routes ────────────────────────
  const user = verifyToken(event);
  if (!user) return res(401, { error: 'Token ausente ou inválido' });

  // ─── GET /itens ──────────────────────────────────────────────────
  if (httpMethod === 'GET' && path === '/itens') {
    const { rows } = await pool.query(
      'SELECT i.*, u.nome as autor FROM itens i JOIN usuarios u ON i.usuario_id = u.id ORDER BY i.criado_em DESC'
    );
    return res(200, rows);
  }

  // ─── POST /itens ───────────────────────────────────────────────
  if (httpMethod === 'POST' && path === '/itens') {
    const { nome, descricao, local_encontrado, foto } = body;
    if (!nome) return res(400, { error: 'Nome é obrigatório' });

    // foto = optional URL string (e.g. Google Drive link, Imgur)
    await pool.query(
      'INSERT INTO itens (nome, descricao, local_encontrado, foto, usuario_id) VALUES ($1, $2, $3, $4, $5)',
      [nome, descricao || null, local_encontrado || null, foto || null, user.id]
    );
    return res(201, { message: 'Item cadastrado com sucesso' });
  }

  // ─── PUT /itens/{id} ──────────────────────────────────────────────
  const putMatch = path.match(/^\/itens\/(.+)$/);
  if (httpMethod === 'PUT' && putMatch) {
    const itemId = putMatch[1];
    const { rows } = await pool.query('SELECT * FROM itens WHERE id = $1', [itemId]);
    const item = rows[0];
    if (!item) return res(404, { error: 'Item não encontrado' });

    if (item.usuario_id !== user.id && user.role !== 'adm') {
      return res(403, { error: 'Não autorizado' });
    }

    await pool.query("UPDATE itens SET status = 'devolvido' WHERE id = $1", [itemId]);
    return res(200, { message: 'Item marcado como devolvido' });
  }

  return res(404, { error: 'Rota não encontrada' });
};
```

### 2.3 Lambda Environment Variables

| Key | Value |
|-----|-------|
| `DB_HOST` | Aurora Writer Endpoint (e.g., `anderson-db.cluster-xxxxx.us-east-1.rds.amazonaws.com`) |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | (RDS master password) |
| `DB_NAME` | `achados_perdidos` |
| `JWT_SECRET` | Long random string (min 32 chars) |

### 2.4 Deploy Lambda (ZIP upload)

```bash
cd lambda
npm install
zip -r ../lambda-deploy.zip index.mjs package.json node_modules/

# Upload via AWS Console:
# Lambda → Code → Upload from → .zip file → select lambda-deploy.zip
```

---

## Phase 3 — API Gateway (REST API)

*(Already documented in `infra.md`)*

---

## Phase 4 — Frontend (Amplify)

Frontend is in `frontend/`. Use local `.env.development` for local testing.
For production, set the environment variable directly in the AWS Amplify Console (`Hosting → Environment variables`):

```bash
VITE_API_URL=https://api.anderson.grupo5.sd.ufersa.dev.br
```

To run locally:
```bash
npm install
npm run dev
```

## Local Testing with curl

```bash
API="https://api.anderson.grupo5.sd.ufersa.dev.br"

# 1. Login → get token
TOKEN=$(curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@campus.br","senha":"admin123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. Get items (authenticated)
curl $API/itens -H "Authorization: Bearer $TOKEN"

# 3. Create item
curl -X POST $API/itens \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Carteira preta","descricao":"Encontrada na cantina","local_encontrado":"Cantina"}'
```
