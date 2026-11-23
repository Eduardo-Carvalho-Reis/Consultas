import { useEffect, useState, type FormEvent } from 'react';
import type { Appointment, AppointmentInput } from '../types';

interface Props {
  editing: Appointment | null;
  onSubmit: (data: AppointmentInput) => Promise<void>;
  onCancelEdit: () => void;
}

// ISO (UTC) -> valor do <input type="datetime-local"> no fuso local
function toInputValue(iso: string) {
  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function AppointmentForm({ editing, onSubmit, onCancelEdit }: Props) {
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setError(null);
    setPatientName(editing?.patientName ?? '');
    setDoctorName(editing?.doctorName ?? '');
    setDate(editing ? toInputValue(editing.date) : '');
    setReason(editing?.reason ?? '');
  }, [editing]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await onSubmit({
        patientName,
        doctorName,
        date: new Date(date).toISOString(),
        reason,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="panel form" onSubmit={handleSubmit}>
      <h2>{editing ? 'Editar consulta' : 'Nova consulta'}</h2>

      <label>
        Paciente
        <input
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          required
          minLength={2}
        />
      </label>

      <label>
        Médico
        <input
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
          required
          minLength={2}
        />
      </label>

      <label>
        Data e hora
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>

      <label>
        Motivo (opcional)
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={500}
        />
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Agendar consulta'}
        </button>
        {editing && (
          <button type="button" className="btn" onClick={onCancelEdit}>
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}
