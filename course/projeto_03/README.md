# Projeto 03 - E-commerce com WordPress + RDS (Arquitetura Distribuída)

## 📋 Descrição

Projeto prático de arquitetura distribuída em nuvem AWS com separação de camadas. Implementa um e-commerce usando WordPress (camada aplicação) com banco de dados RDS MySQL (camada dados), demonstrando escalabilidade e segurança em infraestrutura cloud.

## 🎯 Objetivos

- Provisionar instância EC2 para aplicação web (WordPress)
- Provisionar banco de dados gerenciado (RDS MySQL)
- Implementar arquitetura distribuída com separação de serviços
- Configurar comunicação entre camadas
- Integrar gateway de pagamento (Stripe)
- Instalar e configurar WooCommerce para e-commerce
- Validar persistência de dados e backup

## 💻 Tecnologias & Ferramentas

- **CMS:** WordPress 6.x
- **Servidor Web:** Apache2
- **Linguagem:** PHP 8.x
- **Banco de Dados:** MySQL 8.4 (AWS RDS)
- **E-commerce:** WooCommerce
- **Pagamento:** Stripe Gateway
- **Cloud:** AWS EC2 + RDS
- **SO:** Ubuntu Server LTS
- **Protocolos:** SSH, HTTP, MySQL TCP/3306

## 🏗️ Arquitetura

```
┌──────────────────────────────────────────────────────────┐
│                    AWS VPC                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────┐          ┌──────────────────┐   │
│  │  Subnet Pública     │          │ Subnet Privada   │   │
│  ├─────────────────────┤          ├──────────────────┤   │
│  │ EC2 Instance        │          │  RDS MySQL       │   │
│  │ - Ubuntu LTS        │          │  - Database-1    │   │
│  │ - Apache2           │          │  - 3306 (interno)│   │
│  │ - PHP 8.x           │◄─────────►  - Backups auto  │   │
│  │ - WordPress         │  TCP:3306   - Multi-AZ      │   │
│  │ - WooCommerce       │          └──────────────────┘   │
│  │ - IP: Público       │                                 │
│  └─────────────────────┘                                 │
│         ▲                                                │
│         │ HTTP:80, HTTPS:443                             │
│         │                                                │
│      Usuários / Admin                                    │
└──────────────────────────────────────────────────────────┘
```

## 🚀 Início Rápido

### Pré-requisitos

- Acesso à AWS Academy Learner Lab
- Conhecimento básico de AWS EC2 e RDS
- SSH configurado localmente
- Permissões suficientes para criar recursos

### Passos de Implementação

#### 1. Provisionar Instância EC2

```bash
# AWS Console → EC2 → Launch Instances
# - AMI: Ubuntu Server 20.04 LTS
# - Tipo: t3.micro
# - Storage: 20 GB (gp2)
# - Security Group: nova com SSH:22, HTTP:80, HTTPS:443

# Anotar: IP Público, DNS Público
```

#### 2. Provisionar RDS MySQL

```bash
# AWS Console → RDS → Create Database
# - Engine: MySQL 8.0.35
# - Template: Free Tier
# - DB identifier: database-1
# - Master username: admin
# - Password: (segura, 16+ caracteres)
# - DB instance: db.t3.micro
# - Storage: 20 GB (gp2)
# - Multi-AZ: Ativado (para HA)
# - Backup retention: 7 dias
# - Public accessibility: No (apenas via EC2)

# Anotar: Endpoint do RDS (sem porta após :)
```

#### 3. Configurar Security Group do RDS

```bash
# AWS Console → RDS → Databases → Security Groups
# Adicionar Inbound Rule:
# - Type: MySQL/Aurora
# - Protocol: TCP
# - Port: 3306
# - Source: IP da EC2 ou Security Group da EC2
```

#### 4. Conectar à EC2 e Instalar Dependências

```bash
ssh -i ~/.ssh/chave-aws.pem ubuntu@<EC2_IP_PUBLICO>

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Apache2, PHP e extensões
sudo apt install apache2 ghostscript \
  libapache2-mod-php php php-bcmath php-curl \
  php-imagick php-intl php-json php-mbstring \
  php-mysql php-xml php-zip -y

# NÃO instalar mysql-server (dados ficarão apenas no RDS)

# Iniciar Apache
sudo systemctl start apache2
sudo systemctl enable apache2
```

#### 5. Baixar e Extrair WordPress

```bash
# Baixar WordPress
cd /tmp
wget https://wordpress.org/wordpress-6.4.tar.gz
tar -xzf wordpress-6.4.tar.gz

# Copiar para DocumentRoot
sudo cp -r wordpress/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Criar wp-config.php
sudo cp /var/www/html/wp-config-sample.php /var/www/html/wp-config.php

# Editar credenciais do banco
sudo nano /var/www/html/wp-config.php
```

**Atualizar em wp-config.php:**
```php
define('DB_NAME', 'wordpress');
define('DB_USER', 'admin');
define('DB_PASSWORD', 'sua-senha-segura');
define('DB_HOST', 'database-1.xxxxx.us-east-1.rds.amazonaws.com:3306');
```

#### 6. Criar Banco de Dados RDS

```bash
# Conectar ao RDS do terminal da EC2
mysql -h database-1.xxxxx.us-east-1.rds.amazonaws.com \
  -u admin -p

# No prompt MySQL:
CREATE DATABASE wordpress;
GRANT ALL PRIVILEGES ON wordpress.* TO 'admin'@'%';
FLUSH PRIVILEGES;
EXIT;
```

#### 7. Acessar WordPress e Completar Instalação

```
Abrir navegador: http://<EC2_IP_PUBLICO>
```

Seguir wizard de instalação:
- [ ] Título do site
- [ ] Usuário admin
- [ ] Email
- [ ] Privacidade

#### 8. Instalar WooCommerce

WordPress Admin → Plugins → Add New:
- Buscar "WooCommerce"
- Instalar e ativar
- Seguir setup wizard

#### 9. Configurar Gateway de Pagamento (Stripe)

WordPress Admin → WooCommerce → Settings → Payments:
- Habilitar Stripe
- Adicionar Public Key
- Adicionar Secret Key

## 📊 Security Group (AWS Console)

| Type      | Protocol | Port | Source           |
|-----------|----------|------|-----------------|
| SSH       | TCP      | 22   | 0.0.0.0/0 ou IP |
| HTTP      | TCP      | 80   | 0.0.0.0/0       |
| HTTPS     | TCP      | 443  | 0.0.0.0/0       |
| MySQL/RDS | TCP      | 3306 | SG_EC2          |

## 📚 Documentação Detalhada

Veja [documentacao.md](documentacao.md) para:
- Passo a passo completo com screenshots
- Troubleshooting de conexão EC2 ↔ RDS
- Backup e recovery procedures
- Instalação de plugins de segurança
- Configuração de SSL/TLS

## 🎓 Conceitos Aplicados

- **Arquitetura em Camadas:** Separação de aplicação e dados
- **Database as a Service:** RDS MySQL gerenciado
- **High Availability:** Multi-AZ deployment
- **Security:** VPC, Security Groups, credenciais gerenciadas
- **Scalability:** Pode escalar EC2 e RDS independentemente
- **Backup & Recovery:** Snapshots automáticos RDS

## ✅ Checklist de Validação

- [ ] EC2 criada e em execução
- [ ] RDS criada e em execução
- [ ] Security Groups configurados corretamente
- [ ] SSH acessa EC2 sem erros
- [ ] Apache2 rodando na EC2
- [ ] PHP e extensões instaladas
- [ ] WordPress baixado e extraído
- [ ] Conexão EC2 → RDS estabelecida
- [ ] WordPress acessível via HTTP
- [ ] Setup wizard do WordPress concluído
- [ ] WooCommerce instalado e ativado
- [ ] Stripe configurado e testado
- [ ] Pode criar e acessar produtos
- [ ] Checkout funciona sem erros

## 🔧 Troubleshooting

**Erro: Can't connect to MySQL server**
```bash
# Verificar security group do RDS
# Verificar se IP da EC2 está na whitelist
# Testar: mysql -h RDS_ENDPOINT -u admin -p
```

**Erro: Permission denied na pasta /var/www/html**
```bash
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

## 👤 Autor

Anderson Carlos da Silva Morais - 2024011327

## 📝 Notas Importantes

- RDS custos aumentam com backup retention - ajustar conforme necessário
- Sempre usar senha forte (16+ caracteres) para RDS admin
- Configurar automated backups para disaster recovery
- Monitorar CloudWatch para alertas de CPU/Memória
- Considerar Read Replicas para escala de leitura
- Usar Elastic IP se precisa de IP fixo
