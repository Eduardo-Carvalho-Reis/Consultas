import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { HttpError } from '../errors';

export const appointmentsRouter = Router();

const statusSchema = z.enum(['SCHEDULED', 'COMPLETED', 'CANCELED'], {
  errorMap: () => ({ message: 'Status inválido' }),
});

const appointmentSchema = z.object({
  patientName: z.string().trim().min(2, 'Informe o nome do paciente'),
  doctorName: z.string().trim().min(2, 'Informe o nome do médico'),
  date: z.coerce.date({ errorMap: () => ({ message: 'Data e hora inválidas' }) }),
  reason: z
    .string()
    .trim()
    .max(500, 'O motivo deve ter no máximo 500 caracteres')
    .optional()
    .transform((value) => value || null),
});

const idSchema = z.coerce.number().int().positive('ID inválido');

// Impede dois atendimentos ativos do mesmo médico no mesmo horário.
async function assertNoConflict(doctorName: string, date: Date, ignoreId?: number) {
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorName: { equals: doctorName, mode: 'insensitive' },
      date,
      status: { not: 'CANCELED' },
      ...(ignoreId ? { id: { not: ignoreId } } : {}),
    },
  });

  if (conflict) {
    throw new HttpError(409, 'Este médico já tem uma consulta nesse horário');
  }
}

// Listar (filtro opcional por status)
appointmentsRouter.get('/', async (req, res) => {
  const { status } = z.object({ status: statusSchema.optional() }).parse(req.query);

  const appointments = await prisma.appointment.findMany({
    where: status ? { status } : undefined,
    orderBy: { date: 'asc' },
  });

  res.json(appointments);
});

// Criar
appointmentsRouter.post('/', async (req, res) => {
  const data = appointmentSchema.parse(req.body);
  await assertNoConflict(data.doctorName, data.date);

  const appointment = await prisma.appointment.create({ data });
  res.status(201).json(appointment);
});

// Atualizar dados
appointmentsRouter.put('/:id', async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const data = appointmentSchema.parse(req.body);
  await assertNoConflict(data.doctorName, data.date, id);

  const appointment = await prisma.appointment.update({ where: { id }, data });
  res.json(appointment);
});

// Alterar status
appointmentsRouter.patch('/:id/status', async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const { status } = z.object({ status: statusSchema }).parse(req.body);

  const appointment = await prisma.appointment.update({ where: { id }, data: { status } });
  res.json(appointment);
});

// Excluir
appointmentsRouter.delete('/:id', async (req, res) => {
  const id = idSchema.parse(req.params.id);

  await prisma.appointment.delete({ where: { id } });
  res.status(204).send();
});
