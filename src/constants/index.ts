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