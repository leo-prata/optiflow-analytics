# OptiFlow Analytics

> Sistema de Apoio à Decisão para resolução de problemas de Otimização Linear distribuídos e escaláveis.

O **OptiFlow Analytics** é uma plataforma robusta que permite a submissão de arquivos CSV contendo modelos matemáticos (mix de produção, alocação de recursos, logística, etc.), processando-os de forma assíncrona através de filas de mensagens e entregando resultados otimizados via Algoritmo Simplex.

## Índice

- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Como Rodar o Projeto](#como-rodar-o-projeto)
- [Serviços e Portas](#serviços-e-portas)
- [Comandos CLI](#comandos-cli)
- [Testes Automatizados](#testes-automatizados)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Fluxo de Dados](#fluxo-de-dados)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## Tecnologias Utilizadas

O projeto foi desenvolvido utilizando uma arquitetura de **Microsserviços Orientada a Eventos**:

### Backend
- **Node.js** - Runtime JavaScript
- **NestJS** - Framework progressivo com TypeScript
- **Prisma ORM** - Modelagem e migrations do banco de dados

### Mensageria e Cache
- **RabbitMQ** - Comunicação assíncrona entre microsserviços
- **Redis** - Cache de resultados para alta performance

### Banco de Dados
- **PostgreSQL** - Persistência de dados principal

### Engine Matemática
- **javascript-lp-solver** - Resolução de problemas de Programação Linear via Simplex

### Infraestrutura
- **Docker** - Containerização dos serviços
- **Docker Compose** - Orquestração multi-container

## Arquitetura

### Microsserviços

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Auth API   │────▶│  User API    │     │ Import API   │
│  (JWT)      │     │  (CRUD)      │────▶│ (Upload CSV) │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                                                 ▼
                                          ┌─────────────┐
                                          │  RabbitMQ   │
                                          │   (Queue)   │
                                          └──────┬──────┘
                                                 │
                                                 ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│ Dashboard   │◀────│  PostgreSQL  │◀────│Solver Worker │
│ API + Redis │     │              │     │  (Simplex)   │
└─────────────┘     └──────────────┘     └──────────────┘
```

## Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina:

- [Docker](https://www.docker.com/get-started) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- [Git](https://git-scm.com/) (v2.30+)
- [Node.js](https://nodejs.org/) (v18+ - apenas para desenvolvimento local)

## Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/leo-prata/optiflow-analytics.git
cd optiflow-analytics
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha as variáveis com suas credenciais. 

> **Importante:** 
> - Use credenciais fortes e únicas
> - Nunca commite o arquivo `.env` no Git
> - Para ambientes Docker, use `postgres`, `rabbitmq` e `redis` como hosts
> - Para desenvolvimento local, use `localhost`

### 3. Dê permissão ao script CLI

```bash
chmod +x opti
```

## Como Rodar o Projeto

O projeto utiliza um script de automação (`opti`) para facilitar o gerenciamento dos contêineres.

### Iniciar todos os serviços

```bash
./opti s
```

Este comando irá:
1. Construir as imagens Docker
2. Configurar a rede interna
3. Subir todos os microsserviços (Auth, User, Import, Dashboard, Solver)
4. Inicializar PostgreSQL, RabbitMQ e Redis
5. Executar as migrations do Prisma

> A primeira execução pode demorar alguns minutos para baixar as imagens e compilar o código.

### Verificar se os serviços estão rodando

```bash
./opti list
```

Você verá uma lista com todos os contêineres ativos e suas portas.

## Serviços e Portas

Após rodar o comando de start, os seguintes serviços estarão disponíveis:

| Serviço | URL/Porta | Descrição |
|---------|-----------|-----------|
| **Auth API** | `http://localhost:3001` | Autenticação e emissão de tokens JWT |
| **User API** | `http://localhost:3000` | Gestão de usuários (CRUD) |
| **Import API** | `http://localhost:3002` | Upload de CSV e envio para fila |
| **Dashboard API** | `http://localhost:3003` | Leitura de resultados otimizados (com cache) |
| **Solver Process** | `http://localhost:3004` | Worker que processa otimizações (Simplex) |
| **RabbitMQ UI** | `http://localhost:15672` | Painel de gestão de filas (User: `admin` / Pass: `admin_password`) |
| **PostgreSQL** | `localhost:5432` | Banco de dados principal |
| **Redis** | `localhost:6379` | Cache de resultados |

## Comandos CLI

O script `./opti` oferece os seguintes comandos:

```bash
# Iniciar todos os serviços
./opti s
./opti start

# Listar contêineres em execução
./opti list
./opti ls

# Ver logs de um serviço específico
./opti logs <nome-servico>
# Exemplo: ./opti logs solver-process

# Parar todos os serviços
./opti stop all

# Reiniciar um serviço específico
./opti restart <nome-servico>

# Acessar o shell de um contêiner
./opti exec <nome-servico> sh

# Limpar volumes e dados (cuidado!)
./opti clean
```

## Testes Automatizados

O projeto possui testes unitários e de integração utilizando **Jest** com mocks.

### Executar todos os testes

```bash
# Instale as dependências locais
npm install

# Execute a suíte de testes
npx jest
```

### Estrutura de Testes

```
apps/
  ├── auth-api/src/auth/auth.service.spec.ts
  ├── user-api/src/users/users.service.spec.ts
  ├── import-document/src/document/document.service.spec.ts
  └── solver-process/src/solver-process.service.spec.ts
libs/
  └── database/src/database.service.spec.ts
```

## Estrutura do Projeto

```
optiflow-analytics/
├── apps/                          # Microsserviços
│   ├── auth-api/                  # Autenticação JWT
│   ├── user-api/                  # Gestão de usuários
│   ├── import-document/           # Upload e validação de CSV
│   ├── dashboard-api/             # Consulta de resultados
│   └── solver-process/            # Worker do Simplex
├── libs/                          # Bibliotecas compartilhadas
│   └── database/                  # Prisma ORM + Migrations
├── docker-compose.yml             # Orquestração de contêineres
├── Dockerfile                     # Imagem base dos serviços
├── opti                           # CLI de gerenciamento
└── .env                           # Variáveis de ambiente
```
