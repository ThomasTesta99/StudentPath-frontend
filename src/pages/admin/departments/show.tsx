import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { ShowView, ShowViewHeader } from '@/components/refine-ui/views/show-view'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Course, Department } from '@/types';
import { useShow } from '@refinedev/core'
import { useTable } from '@refinedev/react-table';
import React, { useMemo } from 'react'
import { useParams } from 'react-router';
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge';
import { ShowButton } from '@/components/refine-ui/buttons/show';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-base font-medium">{value}</div>
    </div>
  );
}

const DepartmentsShow = () => {
  const {id} = useParams();
  const {query: departmentsQuery} = useShow<Department>({
    resource: "departments",
    id
  });

  const department = departmentsQuery.data?.data;
  const coursesTable = useTable<Course>({
    columns: useMemo<ColumnDef<Course>[]>(() => [
       {
        id: "code", 
        accessorKey: "code", 
        size: 80, 
        header: () => <p className='column-title'>Course Code</p>,
        cell: ({getValue}) => <Badge>{getValue<string>()}</Badge>
      },
      {
        id: "courseName", 
        accessorKey: "name",
        size: 100, 
        header: () => <p className='column-title'>Course Name</p>,
        cell: ({getValue}) => <span>{getValue<string>()}</span>
      },
      {
        id: "instructor", 
        accessorFn: (row) => row.teacher?.name ?? "-", 
        size: 120, 
        header: () => <p className='column-title'>Course Instructor</p>,
        cell: ({row}) => (
          <span>{row.original.teacher?.name ?? "-"}</span>
        )
      }, 
      {
        id: "term",
        accessorFn: (row) => row.term?.termName ?? "-", 
        size: 120, 
        header: () => <p className='column-title'>Term</p>,
        cell: ({row}) => (
          <span>{row.original.term?.termName ?? "-"}</span>
        )
      }, 
      {
        id: "details", 
        size: 100,
        header: () => <p className="column-title">Details</p>,
        cell: ({ row }) => <ShowButton resource="courses" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton>
      }
    ], []), 
    refineCoreProps: {
      resource: "courses", 
      pagination: {
        pageSize: 10, 
        mode: "server", 
      },
      filters: {
        permanent: [
          { field: "departmentId", operator: "eq", value: id },
        ],
      },
    }
  })
  
  if(departmentsQuery.isLoading || departmentsQuery.isError || !department){
    return (
      <ShowView className='class-view'>
        <ShowViewHeader resource='departments' title="Department Details"/>
        <p className="text-sm text-muted-foreground">
          {departmentsQuery.isLoading
            ? "Loading department details..."
            : departmentsQuery.isError
            ? "Failed to load department details."
            : "Department details not found."}
        </p>
      </ShowView>
    )
  }
  

  return (
    <ShowView className='space-y-6'>
      <ShowViewHeader resource='departments' title='Department Details'/>
      <Separator />

      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Card>
          <CardHeader className='space-y-2 w-full'>
            <CardTitle className='text-2xl font-bold leading-tight text-center'>
              {department.name}
            </CardTitle>
          </CardHeader>

          <Separator />

          <CardContent  className="gap-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label='School Name' value = {department.school?.schoolName ?? "-"} />
              <Field label='School ID' value = {department.schoolId} />
            </div>
            <Field label='Department ID' value={department.id}/>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='space-y-2 w-full'>
            <CardTitle className='text-xl font-bold'>Courses in the {department.name} department: </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable table = {coursesTable} />
          </CardContent>
        </Card>
      </div>
    </ShowView>
  )
}

export default DepartmentsShow
