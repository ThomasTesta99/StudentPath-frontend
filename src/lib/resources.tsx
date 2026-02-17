import { IResourceItem } from "@refinedev/core";
import { BookOpen, Building2, CalendarRange, HomeIcon, UserCog, UserPlus, Users, UsersRound } from "lucide-react";

export const allResources: IResourceItem[] = [
    //ADMIN
    {
        name: "admin-dashboard",
        list: "/admin",
        meta: { label: "Home", roles: ["admin"], icon: <HomeIcon /> },
    },
    {
        name: "terms",
        list: "/admin/terms",
        create: "/admin/terms/create", 
        edit: "/admin/terms/edit/:id", 
        show: "/admin/terms/show/:id", 
        meta: {label: "Terms", icon: <CalendarRange />, roles: ["admin"]}, 
    },
    {
        name: "departments", 
        list: "/admin/departments", 
        create: "/admin/departments/create", 
        edit: "/admin/departments/edit/:id", 
        show: "/admin/departments/show/:id", 
        meta: {label: "Departments", icon: <Building2 />, roles: ["admin"]}, 
    },
    {
        name: "courses", 
        list: "/admin/courses", 
        create: "/admin/courses/create", 
        edit: "/admin/courses/edit/:id", 
        show: "/admin/courses/show/:id", 
        meta: {label: "Courses", icon: <BookOpen />, roles: ["admin"]}, 
    },
    {
        name: "enrollments", 
        list: "/admin/enrollments", 
        create: "/admin/enrollments/create", 
        edit: "/admin/enrollments/edit/:id", 
        show: "/admin/enrollments/show/:id", 
        meta: {label: "Enrollments", icon: <UserPlus />, roles: ["admin"]}, 
    },
    {
        name: "teachers", 
        list: "/admin/teachers", 
        create: "/admin/teachers/create", 
        edit: "/admin/teachers/edit/:id", 
        show: "/admin/teachers/show/:id", 
        meta: {label: "Teachers", icon: <UserCog />, roles: ["admin"]}, 
    },
    {
        name: "students", 
        list: "/admin/students", 
        create: "/admin/students/create", 
        edit: "/admin/students/edit/:id", 
        show: "/admin/students/show/:id", 
        meta: {label: "Students", icon: <UsersRound />, roles: ["admin"]}, 
    },
    {
        name: "parents", 
        list: "/admin/parents", 
        create: "/admin/parents/create", 
        edit: "/admin/parents/edit/:id", 
        show: "/admin/parents/show/:id", 
        meta: {label: "Parents", icon: <Users />, roles: ["admin"]}, 
    },

]