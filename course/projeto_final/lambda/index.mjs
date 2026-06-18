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