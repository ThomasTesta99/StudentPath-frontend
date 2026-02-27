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
    termId: string;
    teacherId: string;
    departmentId: string;
    gradeLevel: string;
    school?: {
        schoolName: string;
    };
    term?: TermDetails;
    department?: Department; 
    teacher?: User;
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

export type School = {
    createdAt: Date;
    updatedAt: Date;
    id: string;
    schoolName: string;
}

export type StudentProfile = {
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    schoolId: string;
    osis: Date;
    dob: string;
    gradeLevel: string;
    user: User;
    school?: School;
}