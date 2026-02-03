"use client"
import { Button } from '@/components/ui/button';
import { useLogout } from '@refinedev/core'
import React from 'react'

const Admin = () => {

  const {mutate: logout} = useLogout();

  const handleLogout = async () => {
    logout(); 
  }
  return (
    <div>
      WELCOME TO ADMIN
      <Button onClick = {() => handleLogout()}>logout</Button>
    </div>
  )
}

export default Admin
