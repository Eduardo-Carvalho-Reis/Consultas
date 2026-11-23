import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { AppointmentForm } from './components/AppointmentForm';
import { AppointmentItem } from './components/AppointmentItem';
import type { Appointment, AppointmentInput, Status } from './types';

type Filter = Status | 'ALL';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'SCHEDULED', label: 'Agendadas' },
  { value: 'COMPLETED', label: 'Concluídas' },
  { value: 'CANCELED', label: 'Canceladas' },
];

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Erro inesperado');

export default function App() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setAppointments(await api.list(filter === 'ALL' ? undefined : filter));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Erros do formulário são tratados dentro dele (por isso o throw é propagado)
  async function handleSubmit(data: AppointmentInput) {
    if (editing) {
      await api.update(editing.id, data);
      setEditing(null);
    } else {
      await api.create(data);
    }
    await load();
  }

  async function run(action: () => Promise<unknown>) {
    try {
      setError(null);
      await action();
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  function handleDelete(id: number) {
    if (!window.confirm('Excluir esta consulta?')) return;
    if (editing?.id === id) setEditing(null);
    run(() => api.remove(id));
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Consultas</h1>
        <p>Agende e acompanhe os atendimentos da clínica.</p>
      </header>

      <main className="layout">
        <AppointmentForm
          editing={editing}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditing(null)}
        />

        <section className="panel list-panel">
          <div className="filters" role="tablist" aria-label="Filtrar por status">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={filter === f.value}
                className={`tab ${filter === f.value ? 'active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {error && <p className="error" role="alert">{error}</p>}

          {loading ? (
            <p className="empty">Carregando consultas...</p>
          ) : appointments.length === 0 ? (
            <p className="empty">
              Nenhuma consulta por aqui. Preencha o formulário para agendar a primeira.
            </p>
          ) : (
            <ul className="list">
              {appointments.map((appointment) => (
                <AppointmentItem
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={setEditing}
                  onStatus={(id, status) => run(() => api.setStatus(id, status))}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
