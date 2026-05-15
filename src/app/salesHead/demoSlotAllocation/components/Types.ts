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