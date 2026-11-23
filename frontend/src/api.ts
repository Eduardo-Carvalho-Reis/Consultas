import type { Appointment, AppointmentInput, Status } from './types';

const BASE = '/api/appointments';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Não foi possível concluir a operação');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  list: (status?: Status) =>
    request<Appointment[]>(status ? `${BASE}?status=${status}` : BASE),

  create: (data: AppointmentInput) =>
    request<Appointment>(BASE, { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: AppointmentInput) =>
    request<Appointment>(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  setStatus: (id: number, status: Status) =>
    request<Appointment>(`${BASE}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  remove: (id: number) => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
};
