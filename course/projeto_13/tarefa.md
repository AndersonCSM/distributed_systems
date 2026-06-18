# Infraestrutura AWS – Rota Protegida com Cognito (Avaliação 13)

## 1. Criar User Pool no Amazon Cognito

1. Acesse o console do **Cognito** > **Create user pool**.
2. Configure:
   - Provedor: Cognito user pool
   - Login: Email ou Username (defina um, ex: email)
   - MFA: Desativado (para simplificar)
3. Em **Integração de aplicativos**:
   - Nome do pool: `valentine-pool`
   - Domínio: não obrigatório
4. Crie um **App client**:
   - **Application type**: Escolha **Single-page application (SPA)** (Isso é crucial para garantir que a AWS não exija um *client secret*).
   - **App client name**: `valentine-app-client`
   - **Client secret**: Garanta que "Don't generate a client secret" esteja marcado.
   - Conclua a criação clicando em **Create app client**.
5. Habilite o fluxo de autenticação (MUITO IMPORTANTE):
   - Na lista de App clients, clique no nome do aplicativo que você acabou de criar (`valentine-app-client`).
   - Na tela de detalhes, role a página para baixo até o quadro **Authentication flows** e clique no botão **Edit**.
   - Marque a caixinha **`ALLOW_USER_PASSWORD_AUTH`** e clique em **Save changes**.
6. Anote os valores criados:
   - `UserPoolId`
   - `AppClientId`

### 1.2 Criar usuário de teste (Via console da AWS)
1. No menu lateral esquerdo do Cognito, desça até a seção **User management** e clique em **Users**. *(ATENÇÃO: Não use o botão "View login page", crie o usuário por este menu interno)*.
2. Clique no botão **Create user** (Criar usuário) no canto superior direito.
3. Preencha as informações (como o e-mail ou username de teste).
4. Na seção de senha (Password), digite uma senha forte e certifique-se de marcar a opção de defini-la como **permanente**.
5. Clique em **Create user** para finalizar.

---

## 2. Criar função Lambda

1. Console **Lambda** > **Create function**.
2. Nome: `valentine-message`  
   Runtime: Node.js 18.x (ou Python 3.x)
3. Código de exemplo (Node.js):
*(Nota: A AWS agora cria arquivos `.mjs` por padrão, portanto usamos a sintaxe `export const`)*
```javascript
export const handler = async (event) => {
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            message: "Feliz Dia dos Namorados! 💘",
            timestamp: new Date().toISOString()
        })
    };
};
```
4. Clique no botão azul **Deploy** para salvar a função.

## 3. Configurar API Gateway (HTTP API)

### 3.1 Criar API
1. API Gateway > Create API > HTTP API > Build.

2. Na etapa **Configure API**:
   - **Integrations**: Selecione **Lambda** no menu suspenso (NÃO selecione HTTP).
   - Escolha a região e a função Lambda `valentine-message`.
   - **API name**: `valentine-api`.

3. Na etapa **Configure routes** (Adicionar rota):
   - **Method**: GET
   - **Resource path**: /message
   - **Integration target**: Selecione a integração da função Lambda criada no passo anterior.

4. Estágio: $default (deploy automático)

### 3.2 Adicionar autorizador JWT (Cognito)

**Onde encontrar os valores no console do Cognito:**
- **`<UserPoolId>` e `<região>`:** Acesse seu `valentine-pool`. Na tela "Visão geral" (Overview), copie o "User pool ID" (ex: `us-east-1_xxxxxxxxx`). A primeira parte (`us-east-1`) é a sua **`<região>`**, e o código inteiro é o seu **`<UserPoolId>`**.
- **`<AppClientId>` (Audiência):** Acesse seu `valentine-pool`, vá na aba "Integração de aplicativos" (App integration) e role até a seção "Clientes de aplicativo" (App clients). Copie o "Client ID" do seu `valentine-app-client`.

1. Na API, vá em Authorization > Create authorizer.
```text
Nome: cognito-authorizer
Tipo: JWT
Emissor: https://cognito-idp.<região>.amazonaws.com/<UserPoolId>
Audiência: <AppClientId>
```

> [!WARNING]
> **Aviso importante sobre o Emissor (Issuer URL):**
> - **NÃO** coloque uma barra (`/`) no final da URL. Ela deve terminar com o último caractere do seu `UserPoolId`.
> - **NÃO** adicione `/.well-known/openid-configuration` no final da URL. O API Gateway adiciona isso por conta própria. Se você incluir, a configuração vai falhar.

2. Salvar.

### 3.3 Vincular autorizador à rota
- Em Routes, selecione GET /message > Attach authorization > escolha cognito-authorizer.

### 3.4 Obter URL da API

**Onde encontrar a Invoke URL no console:**
1. No console do API Gateway, clique no nome da sua API (`valentine-api`).
2. Logo na tela inicial (abaixo de **API details**), você verá o campo **Invoke URL**. 
3. Copie essa URL base. Como você criou a rota no caminho `/message`, lembre-se de adicionar o `/message` no final da URL para testá-la.
   - Exemplo final: `https://xxxxxxxxx.execute-api.<região>.amazonaws.com/message`

## 4. (Opcional) Hospedar front-end no Amplify
- Se desejar um app Dia dos Namorados completo, conecte o repositório GitHub ao Amplify e faça o deploy do HTML/CSS/JS.

- A URL gerada pode ser usada para testes visuais, mas os prints exigidos podem ser feitos com qualquer cliente HTTP.

## 5. Realizar os testes e capturar os prints
5.1. Obter access_token
Usando AWS CLI:

```bash
aws cognito-idp initiate-auth \
    --region <sua-regiao> \
    --client-id <AppClientId> \
    --auth-flow USER_PASSWORD_AUTH \
    --auth-parameters USERNAME=<usuario>,PASSWORD=<senha>
```
Copie o AccessToken da resposta.

### 5.2. Print 1 – Falha de autorização (sem token)
Execute via curl, Postman ou Insomnia:

```text
GET https://xxxxxxxxx.execute-api.<região>.amazonaws.com/message
```

- Resultado esperado: 401 Unauthorized.
- Print deve mostrar: URL completa e código de resposta.

### 5.3 Print 2 – Sucesso com token válido
```text
GET https://xxxxxxxxx.execute-api.<região>.amazonaws.com/message
Authorization: Bearer <ACCESS_TOKEN>
```

- Resultado esperado: 200 OK e corpo com a mensagem romântica.
- Print deve mostrar: URL completa e o header Authorization com o token (ou ao menos indicar que foi enviado).

### 5.4 (Bônus) Token expirado/alterado
- Pode gerar um terceiro print para demonstrar o comportamento com token inválido (401).

## Resumo para entrega
- Print da requisição sem token (401)
- Print da requisição com token válido (200)
- Deixar visível a URL da API e o access_token utilizado.