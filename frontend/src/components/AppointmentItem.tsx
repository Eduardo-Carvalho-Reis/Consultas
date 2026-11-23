import type { Appointment, Status } from '../types';

interface Props {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onStatus: (id: number, status: Status) => void;
  onDelete: (id: number) => void;
}

const STATUS_LABEL: Record<Status, string> = {
  SCHEDULED: 'Agendada',
  COMPLETED: 'Concluída',
  CANCELED: 'Cancelada',
};

const dayFormat = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
});
const timeFormat = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

export function AppointmentItem({ appointment, onEdit, onStatus, onDelete }: Props) {
  const date = new Date(appointment.date);
  const isScheduled = appointment.status === 'SCHEDULED';

  return (
    <li className={`item ${appointment.status.toLowerCase()}`}>
      <div className="when">
        <span className="time">{timeFormat.format(date)}</span>
        <span className="day">{dayFormat.format(date)}</span>
      </div>

      <div className="details">
        <div className="title-row">
          <strong>{appointment.patientName}</strong>
          <span className={`badge ${appointment.status.toLowerCase()}`}>
            {STATUS_LABEL[appointment.status]}
          </span>
        </div>
        <span className="doctor">com {appointment.doctorName}</span>
        {appointment.reason && <p className="reason">{appointment.reason}</p>}

        <div className="actions">
          {isScheduled && (
            <>
              <button className="btn small" onClick={() => onStatus(appointment.id, 'COMPLETED')}>
                Concluir
              </button>
              <button className="btn small" onClick={() => onStatus(appointment.id, 'CANCELED')}>
                Cancelar
              </button>
            </>
          )}
          {!isScheduled && (
            <button className="btn small" onClick={() => onStatus(appointment.id, 'SCHEDULED')}>
              Reagendar
            </button>
          )}
          <button className="btn small" onClick={() => onEdit(appointment)}>
            Editar
          </button>
          <button className="btn small danger" onClick={() => onDelete(appointment.id)}>
            Excluir
          </button>
        </div>
      </div>
    </li>
  );
}
