
import BellScheduleDetails from '@/components/BellScheduleDetails';
import PeriodDetails from '@/components/PeriodDetails';
import SchoolInformation from '@/components/SchoolInformation'
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import React from 'react'

const AdminDashboard = () => {
  
  return (
    <div className="space-y-6 p-6">
      <Breadcrumb />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage school settings, grade levels, bell schedule, and periods.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SchoolInformation />
        <BellScheduleDetails />
        <PeriodDetails />
      </div>
    </div>
  )
}

export default AdminDashboard
