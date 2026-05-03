# Projeto 01 - Servidor Web na AWS EC2 (Snake Game)

## 📋 Descrição

Projeto prático de provisionamento de infraestrutura em nuvem. Consiste no deployment de uma aplicação web (Snake Game) em uma instância EC2 da AWS com servidor Apache2, demonstrando conceitos de computação em nuvem, configuração de segurança de rede e acesso remoto via SSH.

## 🎯 Objetivos

- Provisionar instâncias EC2 na AWS (AWS Academy Learner Lab)
- Configurar segurança de rede (Security Groups, Inbound/Outbound Rules)
- Configurar acesso SSH remoto de forma segura
- Instalar e configurar servidor web Apache2
- Fazer deploy de aplicação web estática
- Validar acesso público via HTTP

## 💻 Tecnologias & Ferramentas

- **Cloud:** AWS EC2 (t2.micro / t3.micro)
- **SO:** Ubuntu Server LTS
- **Servidor Web:** Apache2
- **Frontend:** HTML5, CSS3, JavaScript
- **Protocolo:** SSH, HTTP
- **Acesso Local:** SSH com autenticação via chave `.pem`

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│     AWS Academy Learner Lab (VPC)       │
├─────────────────────────────────────────┤
│  Internet Gateway                       │
│         │                               │
│    ┌────▼────────────┐                  │
│    │   EC2 Instance  │                  │
│    │  (Ubuntu LTS)   │                  │
│    │   t2.micro      │                  │
│    ├─────────────────┤                  │
│    │ IP Público      │─── HTTP :80      │
│    │ IP Privado      │                  │
│    ├─────────────────┤                  │
│    │   Apache2       │                  │
│    │  /var/www/html  │                  │
│    │  └─ snake.html  │                  │
│    └────────────────┘                   │
│         ▲ SSH :22                       │
│         │                               │
│    [Máquina Local]                      │
│    ~/.ssh/config                        │
└─────────────────────────────────────────┘
```

## 🚀 Início Rápido

### Pré-requisitos

- Acesso à AWS Academy Learner Lab
- Chave `.pem` (par de chaves) baixada
- Máquina local com SSH configurado
- Navegador web para acessar a página

### Passos de Configuração

#### 1. Configurar SSH Localmente

```bash
# Criar diretório e mover chave
mkdir -p ~/.ssh
mv ~/Downloads/chave-aws.pem ~/.ssh/
chmod 400 ~/.ssh/chave-aws.pem

# Configurar arquivo ~/.ssh/config
cat > ~/.ssh/config << EOF
Host aws
    HostName <IP_PUBLICO_DA_INSTANCIA>
    User ubuntu
    IdentityFile ~/.ssh/chave-aws.pem
EOF

# Testar acesso
ssh aws
```

#### 2. Configurar Security Group (AWS Console)

Adicionar regras de entrada (Inbound Rules):

| Type  | Protocol | Port | Source    |
|-------|----------|------|-----------|
| SSH   | TCP      | 22   | 0.0.0.0/0 |
| HTTP  | TCP      | 80   | 0.0.0.0/0 |

#### 3. Instalar Apache2 na EC2

```bash
ssh aws

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Apache2
sudo apt install apache2 -y

# Iniciar serviço
sudo systemctl start apache2
sudo systemctl enable apache2
```

#### 4. Deploy da Aplicação

```bash
# Acessar diretório web
ssh aws
sudo su

# Fazer download ou copiar arquivos para /var/www/html
cd /var/www/html
# ... adicionar index.html, style.css, script.js

# Verificar permissões
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

#### 5. Acessar a Aplicação

Abrir navegador:
```
http://<IP_PUBLICO_DA_INSTANCIA>
```

## 📚 Documentação Detalhada

Veja [documentacao.md](documentacao.md) para:
- Configuração passo a passo completa
- Conceitos de rede AWS (VPC, IGW, NAT, IP Público/Privado)
- Troubleshooting de conexão SSH
- Melhorias de segurança

## 📊 Concepts Chave Aplicados

- **Infrastructure as Code:** Provisão manual de recursos na AWS
- **Network Security:** Security Groups e regras de firewall
- **SSH Key Management:** Autenticação via chave privada
- **Web Hosting:** Deploy de aplicação estática em servidor web
- **Cloud Architecture:** Separação de camadas (rede, computação, armazenamento)

## ✅ Validação

- [ ] Instância EC2 criada e em execução
- [ ] Security Group configurado com regras corretas
- [ ] SSH acessível do computador local
- [ ] Apache2 instalado e rodando
- [ ] Página web acessível via IP público
- [ ] Snake Game funcionando no navegador

## 👤 Autor

Anderson Carlos da Silva Morais - 2024011327

## 📝 Notas

- Utilize `sudo` com cuidado em instâncias de produção
- Valide sempre as regras de segurança antes de expor públicamente
- Desligar instância quando não usar para evitar custos desnecessários
- IP público pode mudar após reboot (considere usar Elastic IP para produção)
