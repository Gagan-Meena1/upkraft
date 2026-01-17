export interface PerformanceScore {
    userId: string | { _id: string };
    score: number;
}

export interface Course {
    _id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    duration: string;
    courseQuality: number;
    instructorId: string;
    curriculum: Array<any>;
    performanceScores?: PerformanceScore[];
}

export interface StudentData {
    studentId: string;
    username: string;
    email: string;
    contact?: string;
    age?: string | number;
    city?: string;
    profileImage?: string;
    courses?: Course[];
}


export interface StudentProfileDetailsProps {
    data?: StudentData;
    assignmentCount?: number;
    pendingAssignmentCount?: number;
}