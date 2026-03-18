export type User = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    role: "user" | "admin";
    profileRole: Role;
    banned: boolean;
    banReason: string | null;
    banExpires: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type Role = "student" | "teacher" | "parent" | "admin"

export type Terms = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    schoolId: string;
    termName: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}

export type ListResponse<T = unknown> = {
    data?: T[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

export type CreateResponse<T = unknown> = {
    data?: T;
};

export type GetOneResponse<T = unknown> = {
    data?: T;
};

export type DeleteOneResponse<T = unknown> = {
    data?: T;
};


export type TermDetails = {
    id: string;
    schoolId: string;
    termName: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}

export type Department = {
    id: string;
    name: string;
    code: string;
    createdAt: Date;
    updatedAt: Date;
    schoolId: string;
    school?:{
        schoolName: string;
    }
}



export type Course = {
    id: string;
    name: string;
    schoolId: string;
    description?: string;
    code: string;
    departmentId: string;
    gradeLevel: string;
    school?: {
        schoolName: string;
    };
    department?: Department; 
}

export type Section = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    schoolId: string;
    termId: string;
    courseId: string;
    periodId: string;
    teacherId: string;
    capacity: number;
    enrolledCount?: number;
    availableSeats?: number | null;
    sectionLabel: string;
    roomNumber: string | null;
    term: TermDetails;
    course: Course;
    period: Period;
    department: Department;
    teacher: User;
    
}

export type TeacherProfile = {
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    schoolId: string;
    user: User
    school?: {
        schoolName: string
    }
}

export const GRADE_LEVELS = ["6", "7", "8", "9", "10", "11", "12"] as const;
export type GradeLevel = (typeof GRADE_LEVELS)[number];

export type School = {
    createdAt: Date;
    updatedAt: Date;
    id: string;
    gradeLevels?: GradeLevel[]; 
    schoolName: string;
}

export type StudentProfile = {
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    schoolId: string;
    osis: string;
    dob: string;
    gradeLevel: string;
    user: User;
    school?: {
        schoolName: string;
    };
}

export type Enrollment = {
    sectionId: string;
    createdAt: Date;
    updatedAt: Date;
    studentId: string;
    course: Course;
    teacher?: {
        name: string;
    }
}

export type ParentStudentLink = {
    user: User;
    createdAt: Date;
    updatedAt: Date;
    parentId: string;
    studentId: string;
}

export type ParentProfile = {
    user: User;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    schoolId: string;
}

export type ParentInviteResult = {
    inviteId: string;
    studentId: string;
    parentEmail: string;
    token: string;
    expiresAt: Date;
}

export type StudentSearchResult = StudentProfile;

export type CourseEnrollment = {
    student: {
        userId: string;
        name: string;
        email: string;
        osis: string;
    };
    createdAt: Date;
    updatedAt: Date;
    sectionId: string;
    studentId: string;
}

export type CreateEnrollment = {
    createdAt: Date;
    updatedAt: Date;
    sectionId: string;
    studentId: string;
}

export type StudentEnrollmentResult = {
    sectionId: string;
    createdAt: Date;
    updatedAt: Date;
    studentId: string;
}

export type BellSchedule = {
    id: string;
    schoolId: string;
    name: string;
    type: string;
    dayStartTime: string;
    dayEndTime: string;
};

export type Period = {
    id: string;
    bellScheduleId: string;
    number: number;
    startTime: string;
    endTime: string;
};

export const BELL_SCHEDULE_TYPE_OPTIONS = [
    { value: 'regular', label: 'Regular Day' },
    { value: 'early_dismissal', label: 'Early Dismissal' },
    { value: 'late_start', label: 'Late Start' },
    { value: 'testing', label: 'Testing Day' },
    { value: 'assembly', label: 'Assembly Day' },
    { value: 'custom', label: 'Custom' },
]

export type EnrollmentListRow = {
    sectionId: string;
    studentId: string;
    createdAt: string;
    updatedAt: string;
    student: EnrolledStudent;
    section: Section;
    course: Course;
    teacher: User;
    period: Period;
};


export type EnrolledStudent = {
    id: string;
    name: string;
    email: string;
    osis: string;
    gradeLevel: GradeLevel;
}

export type StudentScheduleRow = {
    period: Period;
    enrollment: Enrollment;
    section: Section;
    course: Course;
    teacher: {
        id: string;
        name: string;
    };
    isEnrolled: boolean;
};

export type SectionSearchResult = Section;

// TEACHER TYPES 

export type Class = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    schoolId: string;
    termId: string;
    courseId: string;
    periodId: string;
    teacherId: string;
    capacity: number;
    sectionLabel: string;
    roomNumber: string | null;

    course: Course;
    term: TermDetails;
    period: Period;
    bellSchedule: BellSchedule;
    studentCount: number;
}

export type TeacherSectionDetail = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    schoolId: string;
    termId: string;
    courseId: string;
    periodId: string;
    teacherId: string;
    capacity: number;
    sectionLabel: string;
    roomNumber: string | null;

    course: Course;
    term: TermDetails;
    period: Period;
    bellSchedule: BellSchedule | null;
    studentCount: number;
    teacher: TeacherProfile;
};

export type TeacherRosterRow = {
    studentId: string;
    name: string;
    osis: string;
    gradeLevel: string;
    enrollmentCreatedAt: Date;
}