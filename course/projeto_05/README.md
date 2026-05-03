# Projeto 05 - Pipeline de Containerização e Deploy AWS (EC2/ECR/ECS)

## 📋 Descrição

Projeto completo de containerização e orquestração de aplicação em AWS. Demonstra o fluxo end-to-end: desenvolvimento local, criação de imagem Docker, armazenamento em ECR (Elastic Container Registry) e deployment escalável em ECS (Elastic Container Service) com balanceamento de carga.

## 🎯 Objetivos

- Desenvolver aplicação frontend (React + Tailwind)
- Criar Dockerfile otimizado para produção
- Testar containers localmente com Docker
- Fazer push de imagem para ECR AWS
- Configurar ECS Task Definition
- Deploy em ECS Fargate (serverless)
- Configurar Application Load Balancer (ALB)
- Implementar auto-scaling
- Validar CI/CD pipeline

## 💻 Tecnologias & Ferramentas

- **Frontend:** React 18+, Tailwind CSS
- **Build:** Node.js, npm, Vite
- **Containerização:** Docker, Docker Compose
- **Cloud:** AWS EC2, ECR, ECS, ALB
- **Container Registry:** Amazon ECR
- **Orchestration:** Amazon ECS (Fargate)
- **Load Balancing:** Application Load Balancer
- **CLI:** AWS CLI v2

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│              AWS Cloud Infrastructure                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │  Application Load Balancer                     │   │
│  │  Port 80 (HTTP) / 443 (HTTPS)                  │   │
│  └────────────────────────────────────────────────┘   │
│                     │                                   │
│          ┌──────────┼──────────┐                        │
│          │          │          │                        │
│  ┌──────▼───┐ ┌───▼─────┐ ┌──▼──────┐                 │
│  │  ECS     │ │  ECS    │ │  ECS    │                 │
│  │  Task 1  │ │  Task 2 │ │  Task 3 │  (Fargate)     │
│  │  Port80  │ │ Port80  │ │ Port80  │                 │
│  └──────────┘ └─────────┘ └─────────┘                 │
│        │           │           │                       │
│        └───────────┼───────────┘                       │
│                    │                                   │
│         ┌──────────▼──────────┐                        │
│         │  Amazon ECR         │                        │
│         │  (Container Image)  │                        │
│         │  app:latest         │                        │
│         └─────────────────────┘                        │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Início Rápido

### Pré-requisitos

- Docker Desktop ou Docker CLI
- AWS CLI v2 configurado
- Acesso à AWS Academy Learner Lab
- Node.js 16+

### Desenvolvimento do Frontend
Aplicação desenvolvida com React + Tailwind + Vite

### Criação do Dockerfile
Imagem Docker otimizada para produção com multi-stage build

### Amazon ECR (Elastic Container Registry)
Armazenamento seguro de imagens Docker no ecossistema AWS

### Amazon ECS com ALB
Orquestração em Fargate com load balancing automático

### 4.1. Configuração do Balanceamento de Carga (Target Group e ALB)
Antes de subir o serviço, a rede de distribuição de tráfego foi configurada para expor a aplicação à internet de forma segura.

**Target Group (Grupo de Destino):** Foi criado um Target Group com o Target Type definido como IP (requisito do modo de rede awsvpc do Fargate). O protocolo configurado foi HTTP na porta 80. Foi estabelecido um Health Check na rota / para garantir que apenas contêineres saudáveis recebam tráfego.

**Application Load Balancer (ALB):** Um ALB Internet-facing (voltado para a internet) foi provisionado em sub-redes públicas, escutando requisições na porta 80 e encaminhando-as (via regras de Listener) para o Target Group criado na etapa anterior.

### 4.2. Definição de Tarefa (Task Definition)
O Task Definition atuou como a "receita" para o contêiner. Nesta etapa, foram definidos:

- **Imagem do Contêiner:** A URI da imagem hospedada no ECR (criada na Etapa 3).

- **Portas:** Mapeamento da porta 80 do contêiner.

- **Recursos Computacionais:** Alocação de memória (ex: 0.5 GB) e vCPU (ex: 0.25 vCPU) estritamente necessários para rodar a aplicação.

### 4.3. Criação do Cluster e do Serviço
O Cluster foi criado como um agrupamento lógico para os recursos. Dentro dele, o Serviço foi instanciado com as seguintes características:

**Provedor de Capacidade:** AWS Fargate.

**Rede:** Configurado na mesma VPC do Load Balancer, utilizando sub-redes públicas e um Security Group liberando a porta 80.

**Integração de Load Balancing:** O serviço foi atrelado ao ALB e ao Target Group configurados na seção 4.1. Isso garantiu que, ao provisionar as Tasks (contêineres), o ECS registrasse os endereços de IP de forma dinâmica no balanceador de carga.