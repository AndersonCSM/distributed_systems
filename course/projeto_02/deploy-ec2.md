# Deploy de Projeto React/Vite em Instância EC2

## Sumário
- [Deploy de Projeto React/Vite em Instância EC2](#deploy-de-projeto-reactvite-em-instância-ec2)
  - [Sumário](#sumário)
  - [1. Configuração da Instância EC2](#1-configuração-da-instância-ec2)
  - [2. Configuração do Security Group](#2-configuração-do-security-group)
  - [3. Configuração da Chave SSH](#3-configuração-da-chave-ssh)
    - [Mover a chave para a pasta `.ssh` e configurar permissões](#mover-a-chave-para-a-pasta-ssh-e-configurar-permissões)
    - [Configurar o arquivo `~/.ssh/config` (opcional, facilita o uso)](#configurar-o-arquivo-sshconfig-opcional-facilita-o-uso)
  - [4. Acesso à Instância via SSH](#4-acesso-à-instância-via-ssh)
  - [5. Build do Projeto Local](#5-build-do-projeto-local)
  - [6. Upload do Projeto para a EC2](#6-upload-do-projeto-para-a-ec2)
  - [7. Configuração do Apache na EC2](#7-configuração-do-apache-na-ec2)
  - [8. Acesso à Aplicação](#8-acesso-à-aplicação)
  - [Referência Rápida de Comandos](#referência-rápida-de-comandos)

---

## 1. Configuração da Instância EC2

- Criar uma nova instância EC2 no console da AWS
- Selecionar AMI **Ubuntu**
- Durante a criação, configurar ou selecionar um par de chaves `.pem`
- Anotar o **IP público** e o **DNS público** da instância após a criação

---

## 2. Configuração do Security Group

No console da AWS, acessar **EC2 → Instances → sua instância → Security → Security Groups** e adicionar as seguintes regras de entrada (**Inbound Rules**):

| Type  | Protocol | Port | Source    |
|-------|----------|------|-----------|
| SSH   | TCP      | 22   | 0.0.0.0/0 |
| HTTP  | TCP      | 80   | 0.0.0.0/0 |
| HTTPS | TCP      | 443  | 0.0.0.0/0 |

> **Importante:** Sem essas regras nenhuma conexão externa consegue acessar a instância.

---

## 3. Configuração da Chave SSH

### Mover a chave para a pasta `.ssh` e configurar permissões

```bash
mv ~/Downloads/dev-aws.pem ~/.ssh/key-aws.pem
chmod 400 ~/.ssh/key-aws.pem
```

### Configurar o arquivo `~/.ssh/config` (opcional, facilita o uso)

```bash
nano ~/.ssh/config
```

Adicionar:

```
Host *
    IdentityFile ~/.ssh/key-aws.pem
```

> Com essa configuração, não é necessário passar `-i` toda vez que usar `ssh` ou `scp`.

---

## 4. Acesso à Instância via SSH

```bash
ssh ubuntu@ec2-98-93-11-108.compute-1.amazonaws.com
```

Ou usando o IP público diretamente:

```bash
ssh ubuntu@98.93.11.108
```

> **Nota:** O usuário padrão para instâncias Ubuntu na AWS é `ubuntu`.

---

## 5. Build do Projeto Local

Na máquina local, dentro da pasta do projeto React/Vite:

```bash
npm run build
```

Isso gera a pasta `dist/` com os arquivos estáticos prontos para produção.

---

## 6. Upload do Projeto para a EC2

Copiar apenas a pasta `dist/` para a instância usando `scp`:

```bash
scp -r /caminho/do/projeto/dist ubuntu@98.93.11.108:/home/ubuntu/
```

> O `scp` utiliza a mesma porta do SSH (porta 22), portanto não é necessária nenhuma regra adicional no Security Group.

---

## 7. Configuração do Apache na EC2

Na instância EC2, instalar e configurar o Apache:

```bash
# Atualizar pacotes
sudo apt-get update

# Instalar o Apache
sudo apt-get install -y apache2

# Copiar os arquivos do build para o diretório do Apache
sudo cp -r ~/dist/* /var/www/html/

# Iniciar o Apache e habilitar na inicialização
sudo systemctl start apache2
sudo systemctl enable apache2
```

---

## 8. Acesso à Aplicação

Acessar no browser usando o IP público ou o DNS da instância:

```
http://98.93.11.108
```

ou

```
http://ec2-98-93-11-108.compute-1.amazonaws.com
```

---

## Referência Rápida de Comandos

| Ação | Comando |
|------|---------|
| Conectar na EC2 | `ssh ubuntu@98.93.11.108` |
| Copiar build para EC2 | `scp -r ./dist ubuntu@98.93.11.108:/home/ubuntu/` |
| Copiar projeto inteiro | `scp -r ./projeto ubuntu@98.93.11.108:/home/ubuntu/` |
| Permissão da chave .pem | `chmod 400 ~/.ssh/key-aws.pem` |
| Iniciar Apache | `sudo systemctl start apache2` |
| Reiniciar Apache | `sudo systemctl restart apache2` |
| Status do Apache | `sudo systemctl status apache2` |
