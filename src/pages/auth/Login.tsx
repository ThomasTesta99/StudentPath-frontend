"use client"
import { Button } from '@/components/ui/button';
import { authProvider } from '@/providers/auth';

import { useLogin } from '@refinedev/core';
import React from 'react'

const Login = () => {


  const { mutate: login } = useLogin();

  const signin = async () => {
    //login({email, password});
  }
  
  const check = async () => {
    console.log(await authProvider.check())
  }

  return (
    <div>
      <Button onClick={signin}>sign in</Button>
      <Button onClick={check}>Check</Button>
    </div>
  )
}

export default Login
