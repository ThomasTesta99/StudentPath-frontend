export const USER_ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
  PARENT: "parent",
};

export const ROLE_BASED_REDIRECT = {
    [USER_ROLES.STUDENT]: "/student", 
    [USER_ROLES.TEACHER]: "/teacher", 
    [USER_ROLES.ADMIN]: "/admin", 
    [USER_ROLES.PARENT]: "/parent", 
}

const getEnvVar = (key: string): string => {
    const value = import.meta.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

export const BACKEND_BASE_URL = getEnvVar("VITE_BACKEND_BASE_URL");