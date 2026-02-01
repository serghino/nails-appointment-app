export interface UserInfo {
  name: string;
  lastname: string;
  telephone: string;
  email?: string;
}

export interface AppointmentData {
  services: any[];
  date: Date | null;
  timeSlot: string | null;
  notes: string;
  user: UserInfo;
}
