export type SlotStatus = 'na' | 'open' | 'demo' | 'booked' | 'rescheduled';

export interface Tutor {
  _id: string;
  username: string;
  email: string;
  timezone: string;
  slotsAvailable: {
    _id?: string;
    startTime: string;
    endTime: string;
    societyIds?: string[];
    societyNames?: string[];
  }[];
  societies?: Society[];
  registrations?: RegistrationData[];
  description?: string;
}

export interface ClassData {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface Course {
  _id: string;
  title: string;
}

export interface Society {
  _id: string;
  name: string;
  city: string;
}

export interface CreateClassForm {
  courseId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface RegistrationData {
  _id: string;
  participantName: string;
  name: string;
  societyName: string;
  city: string;
  demoDate: string | null;
  demoTime: string | null;
  paymentAmount: number;
  paymentStatus: string;
  instrument: string;
  contactNumber: string;
  address: string;
}