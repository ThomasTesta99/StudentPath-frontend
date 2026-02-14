"use client"
import { Button } from '@/components/ui/button';
import { useLogout } from '@refinedev/core'
import React from 'react'

const Admin = () => {

  const {mutate: logout} = useLogout();

  async function testTeacherPOST() {
    try {
      const result = await fetch("http://localhost:8000/api/admin/teachers/FV9l5RvWDmBxvlYMRRZZGV7hBopFhv6C", {
        method: "DELETE", 
        headers: {"Content-Type": "application/json"}, 
        credentials: "include",
        // body: JSON.stringify({
        //   name: "Joe Mama", 
        //   email: "joe@gmail.com", 
        //   password: "12345678", 
        // })
      });

      console.log(result.ok);
      const text = await result.json();
      console.log(text);
    } catch (error) {
      console.error(error);
    }
  }

  const handleLogout = async () => {
    logout(); 
  }
  return (
    <div>
      WELCOME TO ADMIN
      <Button onClick = {() => handleLogout()}>logout</Button>
      <Button onClick = {() => testTeacherPOST()}>test</Button>
      
    </div>
  )
}

export default Admin
