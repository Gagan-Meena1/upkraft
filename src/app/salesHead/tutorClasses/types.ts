// Types for the Tutor Classes Per Month feature

export interface MonthlyCount {
  month: string;   // "2026-08"
  label: string;   // "Aug 2026"
  count: number;
}

export interface TutorClassData {
  _id: string;
  username: string;
  totalClasses: number;
  monthlyClasses: MonthlyCount[];
  totalRevenue: number;
  totalPackageClasses: number;
  studentCount: number;
  pricePerClass: number;
  pricePerClassPerStudent: number;
}