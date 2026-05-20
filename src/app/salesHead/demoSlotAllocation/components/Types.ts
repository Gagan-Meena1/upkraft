export type SlotStatus = 'na' | 'open' | 'demo' | 'booked' | 'edit';

export interface TutorListItem {
  _id: string;
  username: string;
  email: string;
}

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
  description?: string;
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
  demoDate: string | null;
  demoTime: string | null;
  paymentAmount: number;
  paymentStatus: string;
  address: string;
  classId: string | null;
}

// Full registration data — fetched on demand when Edit is clicked
export interface FullRegistrationData {
  _id: string;
  name: string;
  participantName: string;
  contactNumber: string;
  countryCode: string;
  email: string;
  age: number | null;
  instrument: string;
  city: string;
  societyName: string;
  notes: string;
  address: string;
  demoDate: string | null;
  demoTime: string | null;
  paymentAmount: number;
  paymentStatus: string;
  classId: string | null;
}