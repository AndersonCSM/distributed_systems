# Infrastructure Guide — Campus Lost and Found (MVP Serverless)

> MVP infra for delivery. No EC2, No Nginx, No PM2, No Certbot.
> Database: RDS Aurora (PostgreSQL Compatible) matching `projeto_12` settings.
> SSL via ACM. Pattern reference: `skills.md` projects 10, 11 & 12.

## Architecture

```
Android PWA
    │
[Amplify]  →  anderson.grupo5.sd.ufersa.dev.br  (auto SSL via Amplify)
    │
[Route 53 Hosted Zone: anderson.grupo5.sd.ufersa.dev.br]
    │
[API Gateway REST — custom domain]
   api.anderson.grupo5.sd.ufersa.dev.br  →  [ACM cert — us-east-1]
    │
[Lambda — Node.js 20 — achados-api]
    │
[RDS Aurora PostgreSQL — public endpoint — port 5432]
```

## Services Checklist

| Service | Role | Status |
|---------|------|--------|
| RDS Aurora | Data layer (PostgreSQL) | Setup first |
| Lambda | Business logic (all API routes) | Setup second |
| API Gateway (REST) | Expose Lambda via HTTP | Setup third |
| ACM | SSL cert for `api.` subdomain | Setup with API GW |
| Route 53 | DNS records | Setup last |
| Amplify | Host PWA frontend | Deploy last |

---

## Phase 1 — RDS Aurora PostgreSQL (Database)

> We use Aurora PostgreSQL with Dev/Test template and burstable instances as configured in Projeto 12.

### 1.1 Create RDS Instance

```
AWS Console → RDS → Create Database
→ Engine options: Aurora (PostgreSQL Compatible)
→ Method: Full configuration
→ Template: Dev/Test
→ Scalability: Provisioned
→ Instance class: Burstable classes → db.t3.medium (or db.t4g.medium)
→ DB cluster identifier: anderson-db (Use your name, do not prefix with "sg-")
→ Master username: postgres
→ Credentials management: Self managed
→ Master password: <save this — you'll need it for Lambda env vars>
→ Cluster storage configuration: Aurora Standard
→ Availability & durability: Don't create an Aurora Replica
→ Connectivity:
    → Compute resource: Don't connect to an EC2 compute resource
    → Network type: IPv4
    → VPC: Default VPC
    → Public access: YES  ← critical for Lambda outside VPC
    → VPC Security Group: create new → name: anderson-db-sg
    → Port: 5432
→ Additional configuration:
    → Initial database name: achados_perdidos
    → Performance Insights: Disable
    → Enhanced Monitoring: Disable
    → Backup retention period: 7 days
    → Deletion protection: Disable
→ Create Database
```

> **Wait until the status is `Available`.**
> Note the **Writer Endpoint** from the "Connectivity & security" tab (e.g., `anderson-db.cluster-xxxxx.us-east-1.rds.amazonaws.com`). Do not copy the reader endpoint or instance endpoint.

### 1.2 RDS Security Group — Allow PostgreSQL

```
EC2 → Security Groups → anderson-db-sg → Inbound Rules → Edit
→ Add Rule:
    Type: PostgreSQL
    Protocol: TCP
    Port: 5432
    Source: 0.0.0.0/0    ← allows Lambda
```

### 1.3 Initialize Schema

Connect from local machine or CloudShell (requires `psql` client):

```bash
psql -h anderson-db.cluster-xxxxx.us-east-1.rds.amazonaws.com \
     -U postgres -d achados_perdidos

# Paste schema from developer.md → Phase 1
```

---

## Phase 2 — Lambda Function

### 2.1 Create Lambda

```
AWS Console → Lambda → Create function
→ Author from scratch
→ Function name: achados-api
→ Runtime: Node.js 20.x
→ Architecture: x86_64
→ Execution role: LabRole   ← has DynamoDB permissions
→ Create function
```

### 2.2 Upload Code

```
Lambda → Code → Upload from → .zip file
→ Select: lambda-deploy.zip  (generated in developer.md Phase 2.4)
→ Handler: index.handler
→ Save
```

### 2.3 Set Environment Variables

```
Lambda → Configuration → Environment variables → Edit → Add:
```

| Key | Value |
|-----|-------|
| `DB_HOST` | Aurora Writer Endpoint (e.g., `anderson-db.cluster-xxxxx.us-east-1.rds.amazonaws.com`) |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | (RDS master password) |
| `DB_NAME` | `achados_perdidos` |
| `JWT_SECRET` | *(long random string — run: `openssl rand -hex 32`)* |

Expected: `statusCode: 200` with `token` in body.

---

## Phase 3 — API Gateway (REST API)

### 3.1 Create API

```
API Gateway → Create API → REST API → Build
→ API name: achados-api
→ Endpoint type: Regional
→ Create API
```

### 3.2 Create Resources and Methods

**Structure to create:**
```
/
├── /auth
│   └── /login
│       └── POST  → Lambda: achados-api
└── /itens
    ├── GET       → Lambda: achados-api
    ├── POST      → Lambda: achados-api
    └── /{id}
        └── PUT   → Lambda: achados-api
```

**For each method:**
```
Select resource → Actions → Create Method → [METHOD]
→ Integration type: Lambda Function
→ ✅ Use Lambda Proxy Integration  ← CRITICAL — must be checked on every method
→ Lambda Function: achados-api
→ Save → OK (grant permission)
```

### 3.3 Enable CORS

For each resource (`/auth/login`, `/itens`, `/itens/{id}`):

```
Select resource → Actions → Enable CORS
→ Access-Control-Allow-Origin: '*'
→ Access-Control-Allow-Headers: Content-Type,Authorization
→ Access-Control-Allow-Methods: GET,POST,PUT,OPTIONS
→ ✅ Default 4XX   ✅ Default 5XX
→ Enable CORS and replace existing CORS headers → Yes
```

> ⚠️ Must enable CORS on ALL resources. Missing one breaks the frontend.

### 3.4 Deploy API

```
Actions → Deploy API
→ Deployment stage: [New Stage]
→ Stage name: prod
→ Deploy
```

Note the **Invoke URL**: `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod`

**Quick test:**
```bash
BASE=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod

# Test login
curl -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@campus.br","senha":"admin123"}'

# Test unauthorized (expect 401)
curl $BASE/itens
```

---

## Phase 4 — ACM Certificate + Custom Domain

> **Critical:** ACM must be in **us-east-1** for API Gateway.

### 4.1 Request Certificate (ACM)

```
AWS Console → Certificate Manager → Request
→ Request a public certificate
→ Domain name: api.anderson.grupo5.sd.ufersa.dev.br
→ Validation method: DNS validation
→ Request
→ After creation: click "Create record in Route 53" → confirm
→ Wait for Status: Issued  (usually 2–5 minutes)
```

### 4.2 API Gateway Custom Domain

```
API Gateway → Custom domain names → Create
→ Domain name: api.anderson.grupo5.sd.ufersa.dev.br
→ TLS version: TLS 1.2
→ Endpoint type: Regional
→ ACM Certificate: select the cert just issued
→ Create domain name
```

**Add API mapping:**
```
Custom domain → API mappings → Configure API mappings → Add new mapping
→ API: achados-api
→ Stage: prod
→ Path: (leave empty)
→ Save
```

Note the **API Gateway domain name** (e.g., `d-xxxxxxxx.execute-api.us-east-1.amazonaws.com`).

### 4.3 Route 53 — DNS Records

In Hosted Zone `anderson.grupo5.sd.ufersa.dev.br`:

```
Record name: api
Type: CNAME
Value: d-xxxxxxxx.execute-api.us-east-1.amazonaws.com   ← NO https://, NO trailing /
TTL: 300
```

**Verify:**
```bash
# Wait a few minutes for DNS propagation
curl https://api.anderson.grupo5.sd.ufersa.dev.br/itens   # expect 401 JSON
```

---

## Phase 5 — Frontend (Amplify)

### 5.1 Push Frontend to GitHub

Ensure `frontend/` has `.gitignore` blocking environment files to keep the repo secure:
```
node_modules/
dist/
.env
.env.local
.env.production
.DS_Store
```

Commit and push to GitHub.

### 5.2 Create Amplify App

```
AWS Console → Amplify → Create new app
→ Host your web app
→ GitHub → Authorize → Select repository and branch (main)
→ App settings:
    Root directory: frontend
    Build command: npm ci && npm run build
    Output directory: dist
→ Advanced settings → Environment variables:
    Name: VITE_API_URL
    Value: https://api.anderson.grupo5.sd.ufersa.dev.br
→ Review → Save and deploy
```

Wait for build to complete (≈ 3 minutes).

### 5.3 Custom Domain on Amplify

```
Amplify → App → Hosting → Custom domains → Add domain
→ Domain: anderson.grupo5.sd.ufersa.dev.br
→ Follow Amplify instructions to add CNAME in Route 53
→ Amplify provisions SSL automatically — wait ~10 min
```

### 5.4 Verify PWA on Android

1. Open Chrome on Android → `https://anderson.grupo5.sd.ufersa.dev.br`
2. Tap menu → **"Add to Home Screen"**
3. Open from home screen → runs fullscreen

---

## Full Validation Checklist

### Database (Aurora PostgreSQL)
- [ ] RDS status: `Available`
- [ ] Engine: Aurora (PostgreSQL Compatible)
- [ ] Class: db.t3.medium or db.t4g.medium
- [ ] Public access: Yes
- [ ] Security Group: port 5432 open to 0.0.0.0/0
- [ ] Schema initialized (`usuarios`, `itens` exist via `psql`)

### Lambda
- [ ] Lambda status: Active, runtime: Node.js 20.x, role: LabRole
- [ ] Environment variables set: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`
- [ ] Test event `POST /auth/login` → 200 with token

### API Gateway
- [ ] All 5 methods created (POST /admin/seed, POST /auth/login, GET /itens, POST /itens, PUT /itens/{id})
- [ ] CORS enabled on all resources (including /admin/seed)
- [ ] **Lambda Proxy Integration** enabled on ALL methods
- [ ] Deployed to `prod` stage
- [ ] `curl .../prod/itens` → 401 JSON

### DNS / SSL
- [ ] ACM cert status: **Issued**
- [ ] Custom domain created in API Gateway with API mapping
- [ ] CNAME record in Route 53 (no `https://`, no trailing `/`)
- [ ] `curl https://api.anderson.grupo5.sd.ufersa.dev.br/itens` → 401 JSON

### Frontend
- [ ] Amplify build: success
- [ ] `https://anderson.grupo5.sd.ufersa.dev.br` loads the app
- [ ] Login works with admin@campus.br / admin123
- [ ] Feed loads items
- [ ] CadastrarItem creates entry in DynamoDB (check Items tab in console)
- [ ] PWA installable on Android Chrome

---

## Quick Troubleshooting

| Problem | Check |
|---------|-------|
| `POST /admin/seed` returns 500 | Check Lambda logs in CloudWatch — likely DynamoDB table name mismatch |
| Login returns 401 | Was seed called first? Check `usuarios` table in DynamoDB console |
| GET /itens returns 401 | Token not in header. Check CORS and Authorization header |
| 502 Bad Gateway | Lambda error — check CloudWatch logs |
| CORS error in browser | CORS not enabled on that resource. Redeploy API after enabling |
| DNS not resolving | TTL propagation — wait up to 5 min. Check Route 53 records |
| GSI email-index not working | Wait for GSI status to become **Active** in DynamoDB console |
