export type User = {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role: "admin" | "user";
    profileRole: Role;
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

export type TermDetails = {
    id: string;
    schoolId: string;
    termName: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}
