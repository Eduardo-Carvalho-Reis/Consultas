export type Status = 'SCHEDULED' | 'COMPLETED' | 'CANCELED';

export interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  date: string; // ISO
  reason: string | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentInput {
  patientName: string;
  doctorName: string;
  date: string; // ISO
  reason: string;
}
