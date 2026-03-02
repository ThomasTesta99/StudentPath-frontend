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
            token: "dbc2013b21abe112ec9d0d15d85eef592cee70d3382cc1ff0f6ee297a2c27b30",
        })
      });

      console.log(result.ok);
      const text = await result.json();
      console.log(text);
    } catch (error) {
      console.error(error);
    }
  }
  //dbc2013b21abe112ec9d0d15d85eef592cee70d3382cc1ff0f6ee297a2c27b30
  return (
    <div>
      WELCOME TO PARENT
      <Button onClick = {() => testTeacherPOST()}>test</Button>
      
    </div>
  )
}

export default Parentdash;
