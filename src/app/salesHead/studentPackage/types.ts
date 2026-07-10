export interface Lead {
    id: string;
    studentId: string;
    courseId: string;
    custName: string;
    studName: string;
    email: string;
    phone: string;
    society: string;
    tutorName: string;
    tutorNames: string[];
    instrument: string;
    type: string;
    rm: string;
    spoc: string;
    pkgAmount: number;
    pkgClasses: number;
    completed: number;
    totalPkg: number;
    completion: number;
    remaining: number;
    startDate: string;       // ← add
    lastClassDate: string;
    daysLeft: number;
    reschCancel: number;
    renewalStatus: string;
    notes: string;
    paymentCycle: number;
}

export interface Stats {
    total: number; urgent: number; soon: number;
    ontrack: number; completed: number; renewed: number; overdue: number;
}

export interface Options {
    societies: string[]; tutorNames: string[];
    rmNames: string[]; spocNames: string[];
}

export interface Filters {
    society: string; tutorName: string; rm: string;
    spoc: string; type: string; renewalStatus: string;
}

export type CardFilter = "overdue" | "urgent" | "soon" | "ontrack" | "completed" | "renewed";