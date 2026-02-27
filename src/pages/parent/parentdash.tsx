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
            token: "e5966ba270737036c72a057e4d3822ecbf0e7e037f716b70d220cd8b08263f18",
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
