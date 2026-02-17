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
            token: "d907371ac224018efde3a4dfaf4d40cbc987c68ca2c7484f49bb7fc5af7dcb06",
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
