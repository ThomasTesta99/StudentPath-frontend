import { User } from "@/types";
import { useGetIdentity } from "@refinedev/core";
import { Navigate, Outlet } from "react-router";

type Role = "student" | "teacher" | "parent" | "admin";

const roleHome: Record<Role, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
  parent: "/parent",
};

export const RequireRole = ({allow} : {allow : Role[]}) => {
    const {data: user, isLoading} = useGetIdentity<User>();
    if(isLoading) return <div>Loading...</div>

    if(!user?.profileRole){
        return <Navigate to="/login" replace />
    }

    if(!allow.includes(user.profileRole)){
        return <Navigate to={roleHome[user.profileRole]} replace />;
    }

    return <Outlet />
}