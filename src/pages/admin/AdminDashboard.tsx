"use client"
import { Button } from '@/components/ui/button';
import { useLogout } from '@refinedev/core'
import React from 'react'

const AdminDashboard = () => {

  const {mutate: logout} = useLogout();

  const handleLogout = async () => {
    logout(); 
  }
  return (
    <div className='flex flex-col gap-4'>
      WELCOME TO ADMIN
      <Button onClick = {() => handleLogout()}>logout</Button>
      
    </div>
  )
}

export default AdminDashboard;
