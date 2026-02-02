import { Authenticated } from '@refinedev/core'
import React from 'react'
import { Outlet } from 'react-router'

const Protected = () => {
  return (
    <Authenticated key="protected" redirectOnFail="/login">
        <Outlet />
    </Authenticated>
  )
}

export default Protected
