# Tutorial Completo — Monitoramento de Câmara Fria com ESP32, API Gateway, Lambda Authorizer, Lambda e Aurora PostgreSQL

## 1. Objetivo da atividade

Desenvolver um sistema de monitoramento de temperatura de uma câmara fria de supermercado utilizando:

* ESP32 simulado no Wokwi;
* API Gateway HTTP;
* Lambda Authorizer;
* Lambda para leitura e escrita;
* Banco de dados Aurora PostgreSQL no RDS;
* Front-end para visualização dos dados;
* Token de autorização;
* Testes de rotas autorizadas e não autorizadas.

Fluxo geral:

ESP32/Wokwi → API Gateway → Lambda Authorizer → Lambda principal → Aurora PostgreSQL → Front-end

---

# 2. Criar o banco de dados Aurora PostgreSQL

## 2.1 Acessar o RDS

No console da AWS Academy:

1. Pesquise por **Aurora and RDS**.
2. Clique em **Databases**.
3. Clique em **Create database**.

---

## 2.2 Escolher o mecanismo do banco

Em **Engine options**, selecione:

Aurora (PostgreSQL Compatible)

Não selecione:

* Aurora MySQL;
* MySQL;
* PostgreSQL comum.

A atividade pede Aurora compatível com PostgreSQL.

---

## 2.3 Método de criação

Selecione:

Full configuration

---

## 2.4 Template

Selecione:

Dev/Test

Não use **Production**, porque ele sugere instâncias maiores e pode gerar erro ou custo desnecessário no AWS Academy.

---

## 2.5 Tipo de escalabilidade

Selecione:

Provisioned

Evite Serverless v2 nesse contexto, porque em alguns laboratórios pode haver restrições ou diferenças no uso do Query Editor.

---

## 2.6 Tipo de instância

Em **Type of provisioned configuration**, escolha:

Burstable classes

Depois selecione a menor instância disponível, por exemplo:

* db.t3.medium;
* db.t4g.medium.

Caso só apareçam instâncias grandes, volte e confira se o template está como **Dev/Test**.

---

# 3. Configurações principais do banco

## 3.1 DB cluster identifier

Use o seu nome, seguindo o padrão pedido pela atividade.

Exemplo:

alexbruno

Evite usar nomes iniciando com `sg-`, pois `sg-` é prefixo reservado para IDs de Security Group.

---

## 3.2 Master username

Use:

postgres

---

## 3.3 Credentials management

Selecione:

Self managed

Isso permite criar sua própria senha e evita dependência do Secrets Manager no laboratório.

Defina uma senha e guarde. Exemplo:

SuaSenha123

Não compartilhe essa senha em prints ou documentos.

---

## 3.4 Autenticação adicional

Deixe desmarcado:

* IAM database authentication;
* Kerberos authentication.

A Lambda usará conexão tradicional com:

* host;
* database;
* username;
* password.

---

# 4. Configuração de armazenamento e disponibilidade

## 4.1 Cluster storage configuration

Selecione:

Aurora Standard

---

## 4.2 Availability & durability

Selecione:

Don't create an Aurora Replica

Para a atividade, não é necessário criar réplica.

---

# 5. Configuração de rede

## 5.1 Compute resource

Selecione:

Don't connect to an EC2 compute resource

---

## 5.2 Network type

Selecione:

IPv4

---

## 5.3 VPC

Use a VPC padrão do laboratório.

Exemplo:

vpc-xxxxxxxx

---

## 5.4 Public access

Para facilitar os testes, selecione:

Yes

Isso permite testar o banco a partir de ferramentas externas ou do CloudShell, desde que o Security Group permita.

---

## 5.5 Security Group

Selecione:

Create new

Nome recomendado:

alexbruno-db

Atenção: não use nome começando com `sg-`.

Errado:

sg-alexbruno-db

Correto:

alexbruno-db

Se usar `sg-` no nome, a AWS pode retornar erro dizendo que o nome do grupo é inválido.

---

## 5.6 Porta

Deixe:

5432

Essa é a porta padrão do PostgreSQL.

---

# 6. Monitoring e opções extras

## 6.1 Performance Insights

Desmarque:

Enable Performance Insights

Isso evita uso desnecessário de recursos no AWS Academy.

---

## 6.2 Enhanced Monitoring

Desmarque:

Enable Enhanced Monitoring

Isso evita problemas com permissões IAM e roles de monitoramento.

---

## 6.3 Logs

Deixe desmarcado:

* PostgreSQL log;
* instance log;
* iam-db-auth-error log.

---

## 6.4 Initial database name

Em **Initial database name**, coloque:

alexbruno

ou o nome seguindo o padrão pedido pelo professor.

Esse será o nome real do banco utilizado pela Lambda.

---

## 6.5 Backup

Pode deixar:

Backup retention period: 7 days

---

## 6.6 Deletion protection

Deixe desmarcado:

Enable deletion protection

Se marcar essa opção, você terá dificuldade para apagar o banco depois.

---

## 6.7 Criar o banco

Clique em:

Create database

Aguarde até o cluster e a instância ficarem com status:

Available

---

# 7. Copiar o endpoint correto do banco

Depois que o banco estiver disponível:

1. Vá em **RDS → Databases**.
2. Clique no cluster, por exemplo: `alexbruno`.
3. Vá em **Connectivity & security**.
4. Em **Endpoint type**, escolha:

Cluster endpoint

5. Em **Connect to**, escolha:

Writer

Copie o endpoint completo.

Exemplo:

alexbruno.cluster-c90m0wccc562.us-east-1.rds.amazonaws.com

Atenção: copie pelo botão da AWS. Não digite manualmente.

Erros comuns:

* copiar endpoint da instância em vez do cluster;
* trocar letras parecidas;
* colocar `https://`;
* colocar aspas;
* colocar espaço no final.

O endpoint deve ser apenas o hostname, por exemplo:

alexbruno.cluster-c90m0wccc562.us-east-1.rds.amazonaws.com

---

# 8. Testar DNS no CloudShell

Abra o CloudShell e rode:

getent hosts alexbruno.cluster-c90m0wccc562.us-east-1.rds.amazonaws.com

Se aparecer um IP, o endpoint está correto.

Exemplo de resposta esperada:

34.xxx.xxx.xxx alexbruno.cluster-c90m0wccc562.us-east-1.rds.amazonaws.com

Se não aparecer nada, o endpoint está errado.

---

# 9. Conectar ao banco pelo CloudShell

No CloudShell, rode:

export RDSHOST="alexbruno.cluster-c90m0wccc562.us-east-1.rds.amazonaws.com"

Depois:

getent hosts $RDSHOST

Baixe o certificado:

curl -o global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

Conecte ao PostgreSQL:

psql "host=$RDSHOST port=5432 dbname=alexbruno user=postgres sslmode=require"

Digite a senha do banco quando solicitado.

Se conectar, aparecerá algo como:

alexbruno=>

---

# 10. Criar a tabela

Dentro do psql, execute:

CREATE TABLE IF NOT EXISTS temperaturas (
id SERIAL PRIMARY KEY,
temperatura NUMERIC(5,2) NOT NULL,
origem VARCHAR(50),
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Depois confira:

\dt

A saída deve mostrar:

temperaturas

---

# 11. Criar a Lambda principal

## 11.1 Criar função

Vá em:

Lambda → Create function

Escolha:

Author from scratch

Nome:

temperatura-handler

Runtime:

Node.js 22.x

Architecture:

x86_64

Clique em:

Create function

---

## 11.2 Preparar o pacote da Lambda no computador

A Lambda precisa da biblioteca `pg`, então é necessário subir um ZIP.

No terminal do computador:

mkdir temperatura-handler
cd temperatura-handler
npm init -y
npm install pg

Crie um arquivo chamado:

index.mjs

Código:

import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
host: process.env.DB_HOST,
port: 5432,
database: process.env.DB_NAME,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
ssl: {
rejectUnauthorized: false
}
});

async function criarTabelaSeNaoExistir() {
await pool.query(`     CREATE TABLE IF NOT EXISTS temperaturas (
      id SERIAL PRIMARY KEY,
      temperatura NUMERIC(5,2) NOT NULL,
      origem VARCHAR(50),
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export const handler = async (event) => {
try {
await criarTabelaSeNaoExistir();

```
const method =
  event?.requestContext?.http?.method ||
  event?.httpMethod ||
  "GET";

if (method === "POST") {
  const body = typeof event.body === "string"
    ? JSON.parse(event.body || "{}")
    : event.body || {};

  if (body.temperatura === undefined) {
    return resposta(400, { erro: "Campo temperatura é obrigatório" });
  }

  const result = await pool.query(
    "INSERT INTO temperaturas (temperatura, origem) VALUES ($1, $2) RETURNING *",
    [body.temperatura, body.origem || "ESP32-Wokwi"]
  );

  return resposta(201, {
    mensagem: "Temperatura gravada com sucesso",
    dado: result.rows[0]
  });
}

if (method === "GET") {
  const result = await pool.query(
    "SELECT * FROM temperaturas ORDER BY criado_em DESC LIMIT 20"
  );

  return resposta(200, result.rows);
}

if (method === "OPTIONS") {
  return resposta(200, { mensagem: "OK" });
}

return resposta(405, { erro: "Método não permitido" });
```

} catch (error) {
return resposta(500, {
erro: "Erro interno na Lambda",
detalhe: error.message
});
}
};

function resposta(statusCode, body) {
return {
statusCode,
headers: {
"Content-Type": "application/json",
"Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Headers": "Content-Type, Authorization",
"Access-Control-Allow-Methods": "GET, POST, OPTIONS"
},
body: JSON.stringify(body)
};
}

---

## 11.3 Compactar o projeto

Compacte estes itens:

* index.mjs;
* node_modules;
* package.json;
* package-lock.json.

Atenção: o arquivo `index.mjs` deve ficar na raiz do ZIP, não dentro de uma pasta extra.

---

## 11.4 Fazer upload do ZIP

Na Lambda:

Code → Upload from → .zip file

Envie o ZIP criado.

---

## 11.5 Runtime settings

Vá em:

Runtime settings → Edit

Handler:

index.handler

---

## 11.6 Variáveis de ambiente

Vá em:

Configuration → Environment variables → Edit

Adicione:

DB_HOST=alexbruno.cluster-c90m0wccc562.us-east-1.rds.amazonaws.com

DB_NAME=alexbruno

DB_USER=postgres

DB_PASSWORD=sua_senha_do_banco

Não coloque `https://` no DB_HOST.

---

## 11.7 Timeout

Vá em:

Configuration → General configuration → Edit

Configure:

Timeout: 30 seconds

---

# 12. Configurar Security Group do RDS

Vá em:

`EC2 → Security Groups → alexbruno-db → Inbound rules → Edit inbound rules`

Adicione uma regra:

```text
Type: PostgreSQL
Port: 5432
Source: 0.0.0.0/0
```

Para teste acadêmico, isso facilita. Em produção, o correto seria permitir apenas o Security Group da Lambda.

Depois clique em:

`Save rules`

---

# 13. Configurar VPC da Lambda

Vá em:

`Lambda → temperatura-handler → Configuration → VPC → Edit`

Selecione a mesma VPC do RDS.

Exemplo:

```text
vpc-xxxxxxxx
```

Selecione 2 ou 3 subnets.

Em Security Group, selecione o mesmo Security Group do banco ou um grupo que tenha permissão para acessar o banco.

Exemplo:

```text
alexbruno-db
```

Salve e aguarde alguns minutos.

---

# 14. Testar a Lambda principal

## 14.1 Teste POST

Na Lambda, vá em:

Test → Create new event

Nome:

teste-post

JSON:

{
"requestContext": {
"http": {
"method": "POST"
}
},
"body": "{"temperatura":4.7,"origem":"Teste-Lambda"}"
}

Clique em Test.

Resposta esperada:

{
"statusCode": 201,
"body": "{"mensagem":"Temperatura gravada com sucesso"...}"
}

Esse print serve como demonstração de escrita.

---

## 14.2 Teste GET

Crie outro evento:

teste-get

JSON:

{
"requestContext": {
"http": {
"method": "GET"
}
}
}

Resposta esperada:

{
"statusCode": 200,
"body": "[{"id":1,"temperatura":"4.70"...}]"
}

Esse print serve como demonstração de leitura.

---

# 15. Criar Lambda Authorizer

Crie uma nova Lambda:

autorizacao-frio

Runtime:

Node.js 22.x

Código:

export const handler = async (event) => {
const token = event.headers?.authorization || event.headers?.Authorization;

return {
isAuthorized: token === "ALEXBRUNO"
};
};

Esse token deve seguir o padrão pedido pelo professor. No exemplo:

ALEXBRUNO

---

# 16. Criar API Gateway HTTP

Vá em:

API Gateway → Create API → HTTP API → Build

Nome da API:

monitoramento-temperatura-api

IP address type:

IPv4

Adicione integração:

Lambda

Função:

temperatura-handler

---

# 17. Criar rotas

Crie as rotas:

GET /temperaturas

POST /temperaturas

As duas devem usar a integração:

temperatura-handler

---

# 18. Criar e anexar o Authorizer

Vá em:

API Gateway → sua API → Authorization

Clique em:

Create and attach an authorizer

Configuração:

Authorizer name:

autorizacao-frio

Authorizer type:

Lambda

Lambda function:

autorizacao-frio

Payload format version:

2.0

Response mode:

Simple

Identity source:

$request.header.Authorization

Cache duration:

0

Anexe o Authorizer nas duas rotas:

GET /temperaturas
POST /temperaturas

Confirme se ambas aparecem com:

Lambda Auth

---

# 19. Deploy da API

Clique em:

Deploy

Use o stage:

$default

ou crie:

prod

Copie a URL da API.

Exemplo:

https://epnlg6d8b5.execute-api.us-east-1.amazonaws.com

---

# 20. Testar no Postman

## 20.1 GET autorizado

Método:

GET

URL:

https://epnlg6d8b5.execute-api.us-east-1.amazonaws.com/temperaturas

Headers:

Authorization: ALEXBRUNO
Content-Type: application/json

Resultado esperado:

200 OK

Esse print mostra leitura autorizada.

---

## 20.2 GET não autorizado

Método:

GET

URL:

https://epnlg6d8b5.execute-api.us-east-1.amazonaws.com/temperaturas

Headers:

Authorization: ERRADO

Resultado esperado:

403 Forbidden

Esse print mostra leitura não autorizada.

---

## 20.3 POST autorizado

Método:

POST

URL:

https://epnlg6d8b5.execute-api.us-east-1.amazonaws.com/temperaturas

Headers:

Authorization: ALEXBRUNO
Content-Type: application/json

Body:

{
"temperatura": 6.3,
"origem": "Postman"
}

Resultado esperado:

201 Created

---

## 20.4 POST não autorizado

Método:

POST

URL:

https://epnlg6d8b5.execute-api.us-east-1.amazonaws.com/temperaturas

Headers:

Authorization: ERRADO
Content-Type: application/json

Body:

{
"temperatura": 99,
"origem": "Teste-Token-Errado"
}

Resultado esperado:

403 Forbidden

---

# 21. Código do ESP32 no Wokwi

Use o simulador indicado pelo professor.

Substitua o código principal por:
```c
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h> // Necessário para requisições HTTPS no ESP32
#include <DHT.h>

#define DHTPIN 15
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASS = "";

const char* API_URL = "https://e21pyt0wv2.execute-api.us-east-1.amazonaws.com/prod/temperaturas"; 
const char* TOKEN = "ANDERSONCARLOS";

void setup() {
  Serial.begin(115200);
  dht.begin();

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Conectando ao Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWi-Fi conectado!");
}

void loop() {
  float temperatura = dht.readTemperature();
  float umidade = dht.readHumidity();

  if (isnan(temperatura) || isnan(umidade)) {
    Serial.println("Erro ao ler o sensor DHT22");
    delay(5000);
    return;
  }

  Serial.print("Temperatura: ");
  Serial.print(temperatura);
  Serial.print(" °C | Umidade: ");
  Serial.print(umidade);
  Serial.println(" %");

  if (WiFi.status() == WL_CONNECTED) {
    // Configura o cliente seguro para o HTTPS
    WiFiClientSecure client;
    client.setInsecure(); // Ignora a verificação do certificado SSL (ideal para testes/Wokwi)

    HTTPClient http;

    // Passa o WiFiClientSecure no .begin()
    http.begin(client, API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", TOKEN);

    String json = "{";
    json += "\"temperatura\":";
    json += String(temperatura, 2);
    json += ",";
    json += "\"origem\":\"ESP32-Wokwi\"";
    json += "}";

    int responseCode = http.POST(json);

    Serial.print("Código HTTP: ");
    Serial.println(responseCode);

    String response = http.getString();
    Serial.print("Resposta da API: ");
    Serial.println(response);

    http.end();

  } else {
    Serial.println("Wi-Fi desconectado");
  }

  delay(5000);
}

```

Resultado esperado no monitor serial:

Código HTTP: 201

Resposta da API:

Temperatura gravada com sucesso

---

# 22. Testar ESP32 com token errado

Para demonstrar erro de autorização no POST, altere:

const char* TOKEN = "ALEXBRUNO";

para:

const char* TOKEN = "ERRADO";

Resultado esperado:

Código HTTP: 403
Resposta da API: {"message":"Forbidden"}

Esse print serve como POST não autorizado.

---

# 23. Criar o front-end

O front-end deve consumir:

GET /temperaturas

com header:

Authorization: ALEXBRUNO

Ele pode exibir:

* última temperatura;
* origem;
* data e hora;
* histórico;
* status normal ou atenção.

Exemplo de fetch:

fetch("https://epnlg6d8b5.execute-api.us-east-1.amazonaws.com/temperaturas", {
method: "GET",
headers: {
"Authorization": "ALEXBRUNO",
"Content-Type": "application/json"
}
})

---

# 24. Resolver CORS

Se no navegador aparecer erro:

Access to fetch has been blocked by CORS policy

vá em:

API Gateway → sua API → CORS

Configure:

Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Allow-Methods: GET,POST,OPTIONS

Salve e clique em:

Deploy

Depois teste novamente no front-end.

---

# 25. Hospedar no Amplify

1. Crie um repositório no GitHub com os arquivos do front-end.
2. Envie:

   * index.html;
   * style.css;
   * script.js.
3. Vá em AWS Amplify.
4. Clique em **Deploy an app**.
5. Conecte ao GitHub.
6. Escolha o repositório.
7. Faça o deploy.

Depois acesse a URL gerada pelo Amplify.

---

# 26. Prints exigidos

## 26.1 Escrita no banco

Print da Lambda ou Postman mostrando:

POST /temperaturas
201 Created
Temperatura gravada com sucesso

---

## 26.2 Leitura no banco

Print mostrando:

GET /temperaturas
200 OK
Lista de registros

---

## 26.3 POST autorizado

No Postman ou Wokwi:

Authorization: ALEXBRUNO
POST /temperaturas
Status 201

---

## 26.4 POST não autorizado

No Postman ou Wokwi:

Authorization: ERRADO
POST /temperaturas
Status 403 Forbidden

---

## 26.5 GET autorizado no front-end com Network aberto

No navegador:

1. Abra o front-end.
2. Pressione F12.
3. Vá em Network/Rede.
4. Clique em Atualizar Dados.
5. Clique na requisição `temperaturas`.

O print deve mostrar:

Request Method: GET
Status Code: 200 OK
Authorization: ALEXBRUNO

---

## 26.6 GET não autorizado no front-end com Network aberto

Altere temporariamente no script.js:

const API_TOKEN = "ALEXBRUNO";

para:

const API_TOKEN = "ERRADO";

Faça novo deploy no Amplify.

Abra o front-end, F12, Network, clique em Atualizar Dados.

O print deve mostrar:

Request Method: GET
Status Code: 403 Forbidden
Authorization: ERRADO

Depois volte o token para:

ALEXBRUNO

---

# 27. Erros comuns e correções

## Erro 1: GroupName invalid, group names may not be in the format sg-*

Causa:

Nome do Security Group começou com `sg-`.

Solução:

Use nome como:

alexbruno-db

Não use:

sg-alexbruno-db

---

## Erro 2: getaddrinfo ENOTFOUND

Causa:

Endpoint do RDS foi copiado errado.

Solução:

Copie o endpoint pelo botão da AWS.

Use o endpoint do cluster Writer:

alexbruno.cluster-xxxxxxxx.us-east-1.rds.amazonaws.com

Não use:

https://

Não digite manualmente.

Teste no CloudShell:

getent hosts endpoint-do-rds

Se aparecer IP, está correto.

---

## Erro 3: Lambda não conecta ao banco

Possíveis causas:

* DB_HOST errado;
* Lambda fora da VPC correta;
* Security Group bloqueando porta 5432;
* senha errada;
* DB_NAME errado.

Verifique:

DB_HOST
DB_NAME
DB_USER
DB_PASSWORD

E no Security Group:

PostgreSQL
5432
0.0.0.0/0

---

## Erro 4: POST com token errado ainda funciona

Causa:

Authorizer não foi anexado ao POST ou a API não foi redeployada.

Solução:

Verifique em:

API Gateway → Authorization

As duas rotas devem aparecer:

GET /temperaturas → Lambda Auth
POST /temperaturas → Lambda Auth

Depois clique em:

Deploy

---

## Erro 5: Front-end bloqueado por CORS

Causa:

API Gateway não respondeu corretamente ao preflight OPTIONS.

Solução:

API Gateway → CORS

Configurar:

Origin: *
Headers: Content-Type,Authorization
Methods: GET,POST,OPTIONS

Depois:

Deploy

---

## Erro 6: Front-end mostra dados, mas a data aparece vazia

Causa:

A API retorna o campo:

criado_em

mas o script procura:

created_at

Solução:

No JavaScript, usar:

const dataHora = registro.criado_em ?? registro.created_at ?? registro.timestamp ?? null;

---

# 28. Checklist final

Antes de entregar, confirme:

* Aurora PostgreSQL criado;
* banco `alexbruno` criado;
* tabela `temperaturas` criada;
* Lambda principal funcionando;
* Lambda Authorizer funcionando;
* GET protegido;
* POST protegido;
* ESP32 enviando dados com token correto;
* ESP32 bloqueado com token errado;
* Front-end exibindo os dados;
* Network mostrando GET autorizado;
* Network mostrando GET não autorizado.

Com isso, a atividade fica completa.
