"use client"
import { Button } from '@/components/ui/button';
import { useLogout } from '@refinedev/core'
import React from 'react'

const AdminDashboard = () => {

  const {mutate: logout} = useLogout();

  // async function testTeacherPOST() {
  //   try {
  //     const result = await fetch("http://localhost:8000/api/admin/parents/invite", {
  //       method: "POST", 
  //       headers: {"Content-Type": "application/json"}, 
  //       credentials: "include",
  //       body: JSON.stringify({
  //         studentId: "lO20tL8HdJwagjRlPEBiRiRl7sZMwZ8X",
  //         parentEmail: "rtesta1223@yahoo.com" 
  //       }),
  //     });

  //     console.log(result.ok);
  //     const text = await result.json();
  //     console.log(text);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  const handleLogout = async () => {
    logout(); 
  }
  return (
    <div className='flex flex-col gap-4'>
      WELCOME TO ADMIN
      <Button onClick = {() => handleLogout()}>logout</Button>
      {/* <Button onClick = {() => testTeacherPOST()}>Test</Button> */}
      
    </div>
  )
}

export default AdminDashboard;
