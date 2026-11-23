# Gerenciador de consultas

Aplicação simples para agendar, editar, concluir, cancelar e excluir consultas.

- **frontend/**: React + Vite + TypeScript
- **backend/**: Express + Prisma + PostgreSQL + TypeScript

## Pré-requisitos

- Node.js 20+
- Docker (para o PostgreSQL) ou um Postgres próprio

## Como rodar

```bash
# 1. Banco de dados
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run dev            # http://localhost:3333

# 3. Frontend (em outro terminal)
cd frontend
npm install
npm run dev            # http://localhost:5173
```

O Vite faz proxy de `/api` para `http://localhost:3333`, então não há configuração extra no frontend.

Atalhos na raiz: `npm run install:all`, `npm run db:up`, `npm run db:migrate`, `npm run dev:backend`, `npm run dev:frontend`.

## API

| Método | Rota                          | Descrição                                   |
| ------ | ----------------------------- | ------------------------------------------- |
| GET    | `/api/appointments`           | Lista consultas (`?status=SCHEDULED`)       |
| POST   | `/api/appointments`           | Cria consulta                               |
| PUT    | `/api/appointments/:id`       | Atualiza dados da consulta                  |
| PATCH  | `/api/appointments/:id/status`| Altera status (`SCHEDULED`, `COMPLETED`, `CANCELED`) |
| DELETE | `/api/appointments/:id`       | Remove consulta                             |

Corpo de criação/edição:

```json
{
  "patientName": "Maria Souza",
  "doctorName": "Dr. Carlos Lima",
  "date": "2026-11-25T14:30:00.000Z",
  "reason": "Retorno"
}
```

O mesmo médico não pode ter duas consultas ativas no mesmo horário (resposta `409`).
