import { useGetIdentity } from "@refinedev/core";
import { Navigate, Outlet } from "react-router";

type Role = "student" | "teacher" | "parent" | "admin";
type Identity = {role? : Role};

const roleHome: Record<Role, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
  parent: "/parent",
};

export const RequireRole = ({allow} : {allow : Role[]}) => {
    const {data: user, isLoading} = useGetIdentity<Identity>();
    if(isLoading) return <div>Loading...</div>

    if(!user?.role){
        return <Navigate to="/login" replace />
    }

    if(!allow.includes(user.role)){
        return <Navigate to={roleHome[user.role]} replace />;
    }

    return <Outlet />
}