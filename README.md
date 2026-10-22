# Clínica Vida Plena

Sistema de gestão para clínicas: cadastro de pacientes, corpo clínico, agenda de
consultas e prontuário eletrônico. Frontend em React (Vite) e API em Node.js/Express
com PostgreSQL.

## Como rodar

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

O painel fica em **http://localhost:3000** e a API em **http://localhost:4000**.

Acesso de demonstração: `admin@clinica.com` / `admin123`.

## Estrutura por tópico

```
backend/
  src/
    config/                 conexão com o banco e variáveis de ambiente
    db/
      migrations/           esquema SQL versionado (users, patients, doctors,
                            appointments, medical_records)
      run-migrations.js     executor das migrações
      seed.js               dados de demonstração (equipe, pacientes, agenda)
    middleware/             autenticação JWT e tratamento de erros
    modules/                uma pasta por tópico de negócio
      auth/                 login e sessão da equipe
      patients/             cadastro de pacientes e prontuário
      doctors/              corpo clínico
      appointments/         agenda de consultas
      records/              registros de atendimento
      dashboard/            indicadores da visão geral
    utils/                  helpers compartilhados
    app.js                  montagem das rotas /api
    server.js               inicialização do servidor

frontend/
  src/
    components/
      layout/               casca da aplicação (menu lateral + área de conteúdo)
      ui/                   botões, modal, campos, etiquetas, cartões
    context/                estado de autenticação
    pages/                  telas: login, visão geral, pacientes, prontuário,
                            profissionais, agendamentos
    routes/                 proteção de rotas autenticadas
    services/               um arquivo por tópico, falando com a API
    styles/global.css       design system e layout responsivo
    utils/format.js         datas, idade, iniciais
```

## API

Todas as rotas (exceto `POST /api/auth/login`) exigem o header
`Authorization: Bearer <token>`.

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/api/auth/login` | autentica e devolve o token |
| GET | `/api/auth/me` | usuário da sessão |
| GET/POST | `/api/patients` | lista (busca por `?search=`) e cria pacientes |
| GET | `/api/patients/:id` | paciente + prontuários + consultas |
| PUT/DELETE | `/api/patients/:id` | atualiza / remove |
| GET/POST | `/api/doctors` | lista e cria profissionais |
| PUT/DELETE | `/api/doctors/:id` | atualiza / remove |
| GET | `/api/appointments` | filtra por `?date=&status=&patientId=` |
| POST | `/api/appointments` | cria agendamento |
| PUT | `/api/appointments/:id` | atualiza agendamento |
| PATCH | `/api/appointments/:id/status` | altera apenas o status |
| DELETE | `/api/appointments/:id` | remove |
| GET/POST | `/api/records` | lista (`?patientId=`) e cria prontuário |
| DELETE | `/api/records/:id` | remove registro |
| GET | `/api/dashboard` | indicadores e próximos atendimentos |
| GET | `/api/health` | verificação de saúde (API + banco) |

## Variáveis de ambiente

| Variável | Onde | Uso |
| --- | --- | --- |
| `DATABASE_URL` | API / migrações | conexão PostgreSQL (padrão do compose) |
| `PORT` | API | porta interna (4000) |
| `JWT_SECRET` | API | assinatura dos tokens; entregue pela plataforma em `/run/base44/app.env` |
| `API_PROXY_TARGET` | web | destino do proxy `/api` do Vite |

Sem `JWT_SECRET`, a API usa um segredo de desenvolvimento — em produção defina o valor real.
