import { useGetIdentity } from '@refinedev/core';
import React from 'react'
import { Navigate } from 'react-router';

type Identity = {
    role?: 'admin' | 'teacher' | 'student' | 'parent';
};

const RoleRedirect = () => {
    const {data: user, isLoading} = useGetIdentity<Identity>();
    if(isLoading) return <div>Loading...</div>

    if(!user?.role) return <Navigate to="/login" replace />

    if(user.role === 'admin') return <Navigate to="/admin" replace />
    if(user.role === 'teacher') return <Navigate to="/teacher" replace />
    if(user.role === 'student') return <Navigate to="/student" replace />
    if(user.role === 'parent') return <Navigate to="/parent" replace />
    return <Navigate to="/login" replace />;
}

export default RoleRedirect
