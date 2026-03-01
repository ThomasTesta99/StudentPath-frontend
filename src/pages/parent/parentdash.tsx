"use client"

import { Button } from '@/components/ui/button';
import React from 'react'

const Parentdash = () => {

  async function testTeacherPOST() {
    try {
      const result = await fetch("http://localhost:8000/api/parents/redeem-invite", {
        method: "POST", 
        headers: {"Content-Type": "application/json"}, 
        credentials: "include",
        body: JSON.stringify({
            token: "06ebd161e327d0bb7fb91850232089f19b91b30be5482b3269248ba2dc5083af",
        })
      });

      console.log(result.ok);
      const text = await result.json();
      console.log(text);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      WELCOME TO PARENT
      <Button onClick = {() => testTeacherPOST()}>test</Button>
      
    </div>
  )
}

export default Parentdash;
