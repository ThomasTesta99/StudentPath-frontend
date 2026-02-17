import { User } from '@/types';
import { useGetIdentity } from '@refinedev/core';
import React from 'react'
import { Navigate } from 'react-router';

const RoleRedirect = () => {
    const {data: user, isLoading} = useGetIdentity<User>();
    if(isLoading) return <div>Loading...</div>

    if(!user?.profileRole) return <Navigate to="/login" replace />

    if(user.profileRole === 'admin') return <Navigate to="/admin" replace />
    if(user.profileRole === 'teacher') return <Navigate to="/teacher" replace />
    if(user.profileRole === 'student') return <Navigate to="/student" replace />
    if(user.profileRole === 'parent') return <Navigate to="/parent" replace />
    return <Navigate to="/login" replace />;
}

export default RoleRedirect
