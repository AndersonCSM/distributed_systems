# Documentação do Projeto: Servidor Web na AWS EC2 (Jogo da Cobrinha)

**Autor:** Anderson | **Disciplina:** Redes/Sistemas Operacionais
**Objetivo:** Provisionar uma instância EC2 na AWS, configurar o acesso SSH local, instalar um servidor web Apache2 e hospedar uma aplicação web interativa (Snake Game) separando as camadas de estrutura, estilo e lógica.

---

## 1. Arquitetura e Ambiente
* **Provedor Cloud:** AWS Academy (Learner Lab)
* **Instância:** Amazon EC2 (t2.micro / t3.micro)
* **Sistema Operacional do Servidor:** Ubuntu Server LTS
* **Servidor Web:** Apache2
* **Ambiente Local:** Ubuntu (Configuração SSH via arquivo `config`)

---

## 2. Configuração de Rede e Segurança (AWS)
Para garantir o acesso remoto e a disponibilidade da página web, o **Security Group** da instância foi configurado com as seguintes regras de entrada (Inbound Rules):
* **SSH (Porta 22):** Origem `0.0.0.0/0` (Para acesso via terminal).
* **HTTP (Porta 80):** Origem `0.0.0.0/0` (Para acesso público à página web).

**Conceito Aplicado:** O acesso externo à página é feito exclusivamente pelo **IP Público** (fornecido pelo Internet Gateway da AWS via NAT), enquanto o **IP Privado** é utilizado para o roteamento interno dentro da VPC da AWS.

---

## 3. Configuração do Acesso SSH Local
Para otimizar o fluxo de trabalho e evitar a digitação repetitiva de parâmetros, a chave criptográfica `.pem` foi alocada em um diretório seguro e um atalho foi criado no ambiente local.

**Comandos executados localmente:**
```bash
# Criação do diretório oculto (se inexistente) e movimentação da chave
mkdir -p ~/.ssh
mv ~/Downloads/chave-aws.pem ~/.ssh/

# Restrição de permissões de leitura (obrigatório para chaves privadas)
chmod 400 ~/.ssh/chave-aws.pem

# Edição do arquivo de configuração do SSH
nano ~/.ssh/config
```

**Conteúdo do arquivo `~/.ssh/config`:**
```text
Host aws
    HostName <IP_PUBLICO_DA_INSTANCIA>
    User ubuntu
    IdentityFile ~/.ssh/chave-aws.pem
```
*Acesso ao servidor simplificado para o comando: `ssh aws`*

---

## 4. Instalação e Configuração do Servidor Web
Após o acesso via SSH, o servidor Apache2 foi instalado no Ubuntu da instância EC2.

```bash
# Atualização dos repositórios e instalação do Apache
sudo apt update
sudo apt install apache2 -y

# Verificação do status do serviço
sudo systemctl status apache2
```

---

## 5. Deploy da Aplicação (Clean Code)
A aplicação desenvolvida foi o clássico "Jogo da Cobrinha" (Snake Game). Para manter as boas práticas de Engenharia de Software, o projeto foi refatorado e dividido em três arquivos distintos dentro do diretório raiz do Apache (`/var/www/html/`).

### Limpeza do diretório padrão:
```bash
cd /var/www/html/
sudo rm index.html
```

### Estrutura de Arquivos Criada:
1. **`index.html`**: Contém a estrutura da página, as marcações do Canvas para a renderização do jogo, e a identificação (Nome e Matrícula).
2. **`style.css`**: Responsável pela estilização da página, layout flexível e esquema de cores moderno.
3. **`script.js`**: Contém a lógica de controle do jogo. Foi implementada uma variável de estado (`changingDirection`) para corrigir bugs de colisão instantânea causados por inputs de teclado simultâneos, além do uso de filas para manipulação da cauda da cobra.

### Ajuste de Permissões:
Para garantir que o Apache consiga ler e servir os novos arquivos para a internet:
```bash
sudo chmod -R 755 /var/www/html/
sudo systemctl restart apache2
```

---

## 6. Resultados e Validação
A aplicação foi validada com sucesso através da navegação pelo IP Público (`http://<IP_PUBLICO_DA_INSTANCIA>`). A página exibe corretamente o jogo interativo de forma fluida e as informações de autoria solicitadas.
