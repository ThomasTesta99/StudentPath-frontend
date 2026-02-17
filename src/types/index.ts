export type User = {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role: "admin" | "user";
    profileRole: Role;
}

export type Role = "student" | "teacher" | "parent" | "admin"