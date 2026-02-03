
import SignInForm from '@/components/SignInForm'
import { useIsAuthenticated } from '@refinedev/core'
import React from 'react'
import { Navigate } from 'react-router';

const LoginPage = () => {
  const {data: isAuthenticated, isLoading} = useIsAuthenticated();
  if(isLoading) return <div>Loading...</div>

  if(isAuthenticated?.authenticated){
    return <Navigate to="/" replace/>
  }

  return (
    <div>
      <SignInForm />
    </div>
  )
}

export default LoginPage
