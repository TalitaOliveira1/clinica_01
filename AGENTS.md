# Notas de ambiente (Base44)

Sistema da clínica: API Node/Express + PostgreSQL + painel React (Vite).

## Como subir

```bash
docker compose -f docker-compose.base44.yml up -d
```

Ordem dos serviços controlada pelo compose:

1. `db` (postgres:16-alpine) — credenciais locais geradas no próprio compose.
2. `migrate` — instala dependências, roda `npm run db:migrate` e `npm run db:seed`
   e encerra. É um job one-shot: não reinicia.
3. `api` — Express na porta 4000, `nodemon` observando `backend/src`.
4. `web` — Vite na 5173, publicada no host na porta **3000**.

`migrate` roda antes da `api` (`service_completed_successfully`), então não há dois
`npm install` simultâneos no mesmo volume de dependências.

## Detalhes que não são óbvios

- As dependências ficam em volumes nomeados (`backend_node_modules`,
  `frontend_node_modules`); o código é bind-mount a partir da raiz do repositório.
  Para aplicar mudanças em `package.json`, rode `docker compose -f
  docker-compose.base44.yml up -d --force-recreate migrate api web` para que o
  `npm install` do start rode de novo.
- Migrações são versionadas em `backend/src/db/migrations/*.sql` e registradas em
  `schema_migrations`. Crie um novo arquivo numerado em vez de editar um já aplicado.
- O seed só popula tabelas vazias (checa a contagem por tabela), então pode rodar
  em todo `up` sem duplicar dados.
- `JWT_SECRET` vem de `/run/base44/app.env` (segredo da plataforma). `backend/src/config/env.js`
  tem um fallback apenas de desenvolvimento; nunca coloque o valor real no compose
  `environment:` — isso sobrescreveria o segredo do painel.
- O painel fala com a API pelo proxy do Vite (`/api` → `http://api:4000`), ou seja,
  origem única: não é preciso CORS nem URL absoluta no frontend.
- `frontend/vite.config.js` libera o host do preview apenas quando
  `BASE44_PREVIEW_MODE=1` (usando `BASE44_SANDBOX_HOST_DOMAIN`); sem a flag, a lista
  fica restrita a localhost/127.0.0.1.
- O watcher do Vite usa polling (`usePolling`), necessário por causa do bind mount.

## Verificação rápida

```bash
curl -s http://localhost:3000/api/health        # {"status":"ok"} (web -> api -> banco)
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/
curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@clinica.com","password":"admin123"}'
```

Acesso da equipe semeado: `admin@clinica.com` / `admin123`.

## Testes

O projeto ainda não tem suíte automatizada; a verificação é feita pelas rotas acima
e pelo fluxo no preview (login → pacientes → prontuário → agenda).
