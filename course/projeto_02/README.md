# Projeto 02 - Deploy de App React/Vite em EC2

## 📋 Descrição

Projeto de deployment de uma aplicação moderna (React + Vite) em uma instância EC2 da AWS. Demonstra todo o ciclo de desenvolvimento: build local, upload para servidor remoto, configuração de web server e publicação em produção.

## 🎯 Objetivos

- Desenvolver aplicação frontend com React e Vite
- Gerar build otimizado para produção
- Transferir arquivos para servidor remoto via SCP
- Configurar Apache2 para servir aplicação SPA
- Publicar aplicação via HTTP
- Entender o fluxo de CI/CD básico

## 💻 Tecnologias & Ferramentas

- **Frontend:** React 18+, Vite
- **Build:** Node.js, npm
- **Cloud:** AWS EC2
- **SO:** Ubuntu Server LTS
- **Servidor Web:** Apache2
- **Transferência:** SCP (Secure Copy)
- **Protocolo:** SSH, HTTP, HTTPS

## 🏗️ Arquitetura

```
┌────────────────────────────────────────────────┐
│         Ambiente Local                         │
│  ┌──────────────────────────────────────────┐  │
│  │  Projeto React + Vite                    │  │
│  │  npm run build → /dist                   │  │
│  └──────────────────────────────────────────┘  │
│              │                                  │
│              │ SCP Upload                       │
│              ▼                                  │
├────────────────────────────────────────────────┤
│         AWS EC2 Instance (Ubuntu)               │
│  ┌──────────────────────────────────────────┐  │
│  │  Apache2                                 │  │
│  │  ├─ /var/www/html/                       │  │
│  │  │  ├─ index.html                        │  │
│  │  │  ├─ assets/                           │  │
│  │  │  └─ ...                               │  │
│  │  └─ .htaccess (para SPA routing)         │  │
│  └──────────────────────────────────────────┘  │
│              │                                  │
│              │ HTTP :80                        │
│              │ HTTPS :443                      │
│              ▼                                  │
│         Navegadores - Usuários Finais          │
└────────────────────────────────────────────────┘
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 16+ instalado localmente
- Acesso SSH à instância EC2
- Git configurado
- AWS EC2 com Ubuntu 20.04+ LTS

### Passos de Implementação

#### 1. Desenvolvimento Local

```bash
# Criar novo projeto com Vite
npm create vite@latest meu-app -- --template react
cd meu-app
npm install

# Desenvolvimentolocal
npm run dev

# Validar em http://localhost:5173
```

#### 2. Build para Produção

```bash
# Gerar build otimizado
npm run build

# Diretório dist contém:
# - index.html
# - assets/ (JS, CSS otimizados)
# - favicon.ico (se houver)

# Verificar tamanho e integridade
du -sh dist/
```

#### 3. Configuração da Instância EC2

```bash
# Conectar via SSH
ssh -i ~/.ssh/chave-aws.pem ubuntu@<IP_PUBLICO>

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Apache2
sudo apt install apache2 -y

# Habilitar módulo rewrite (necessário para SPA)
sudo a2enmod rewrite

# Criar diretório para aplicação
sudo mkdir -p /var/www/html/seu-app
sudo chown -R ubuntu:ubuntu /var/www/html/seu-app
```

#### 4. Configurar Apache para SPA (Single Page Application)

```bash
# Criar arquivo .htaccess
cat | sudo tee /var/www/html/seu-app/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /seu-app/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /seu-app/index.html [L]
</IfModule>
EOF

# Dar permissões
sudo chown www-data:www-data /var/www/html/seu-app/.htaccess
sudo chmod 644 /var/www/html/seu-app/.htaccess
```

#### 5. Upload da Aplicação

```bash
# Do computador local:
scp -i ~/.ssh/chave-aws.pem -r dist/* ubuntu@<IP_PUBLICO>:/var/www/html/seu-app/

# Ou criar VirtualHost no Apache
sudo nano /etc/apache2/sites-available/seu-app.conf
```

**Exemplo de VirtualHost:**
```apache
<VirtualHost *:80>
    ServerName seu-dominio.com
    ServerAlias www.seu-dominio.com
    DocumentRoot /var/www/html/seu-app

    <Directory /var/www/html/seu-app>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/seu-app-error.log
    CustomLog ${APACHE_LOG_DIR}/seu-app-access.log combined
</VirtualHost>
```

#### 6. Ativar e Reiniciar Apache

```bash
# Habilitar site
sudo a2ensite seu-app

# Testar configuração
sudo apache2ctl configtest

# Reiniciar Apache
sudo systemctl restart apache2
```

#### 7. Acessar a Aplicação

```
http://<IP_PUBLICO>/seu-app
ou
http://seu-dominio.com
```

## 📊 Security Group (AWS Console)

| Type  | Protocol | Port  | Source     |
|-------|----------|-------|-----------|
| SSH   | TCP      | 22    | 0.0.0.0/0 |
| HTTP  | TCP      | 80    | 0.0.0.0/0 |
| HTTPS | TCP      | 443   | 0.0.0.0/0 |

## 🔄 Workflow CI/CD Simplificado

```bash
# 1. Desenvolver localmente
npm run dev

# 2. Build
npm run build

# 3. Teste
npm run preview

# 4. Upload
scp -r dist/* ubuntu@servidor:/var/www/html/app/

# 5. Validar
curl http://servidor/app
```

## 📚 Documentação Detalhada

Veja [documentacao-deploy-ec2.md](deploy-ec2.md) para:
- Configuração passo a passo completa
- Troubleshooting de conexão e permissões
- Configuração HTTPS com Let's Encrypt
- Monitoramento e logs

## 🎓 Conceitos Aplicados

- **Build Optimization:** Minificação e otimização com Vite
- **Single Page Application (SPA):** Roteamento no cliente
- **Web Server Configuration:** Apache VirtualHosts
- **File Transfer:** SCP e SFTP
- **URL Rewriting:** .htaccess para SPA routing
- **Infrastructure Management:** EC2 lifecycle

## ✅ Checklist de Validação

- [ ] Projeto React + Vite criado localmente
- [ ] Build gerado e testado localmente (`npm run preview`)
- [ ] Instância EC2 criada e acessível via SSH
- [ ] Apache2 instalado e módulo rewrite habilitado
- [ ] Arquivos transferidos para servidor
- [ ] .htaccess configurado para routing SPA
- [ ] Aplicação acessível via HTTP
- [ ] Roteamento funciona sem erros 404

## 👤 Autor

Anderson Carlos da Silva Morais - 2024011327

## 📝 Notas Importantes

- Sempre testar build localmente antes de fazer deploy
- Validar permissões de arquivo (www-data deve ter acesso leitura)
- Considerar cache HTTP para assets estáticos
- Para produção, usar HTTPS com certificado SSL válido
- Monitorar logs em `/var/log/apache2/`
