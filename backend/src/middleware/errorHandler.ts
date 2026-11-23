import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { HttpError } from '../errors';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: err.issues.map((issue) => issue.message).join('; '),
      issues: err.issues,
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  // Registro não encontrado (update/delete)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    res.status(404).json({ message: 'Consulta não encontrada' });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Erro interno do servidor' });
};
