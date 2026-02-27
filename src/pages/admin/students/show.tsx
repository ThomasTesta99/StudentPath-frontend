import { DeleteButton } from '@/components/refine-ui/buttons/delete';
import { ShowView, ShowViewHeader } from '@/components/refine-ui/views/show-view';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { capitalizeFirst, formatDate } from '@/lib/utils';
import { Field } from '@/lib/utilsTsx';
import {  Enrollments, ParentStudentLink, StudentProfile } from '@/types';
import { useGo, useShow } from '@refinedev/core';
import React, { useMemo } from 'react';
import { useParams } from 'react-router';
import { useTable } from '@refinedev/react-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { ShowButton } from '@/components/refine-ui/buttons/show';

const ShowStudent = () => {
  const go = useGo();
  const { id } = useParams();

  const { query } = useShow<StudentProfile>({
    resource: "students",
    id,
  });

  const student = query?.data?.data;
  const enrollments = useTable<Enrollments>({
    columns: useMemo<ColumnDef<Enrollments>[]>(() => [
      {
        id: "code", 
        accessorFn: (row) => row.course.code ?? "-",
        size: 80, 
        header: () => <p className='column-title'>Course Code</p>,
        cell: ({row}) => <Badge>{row.original.course.code}</Badge>
      },
      {
        id: "courseName", 
        accessorFn: (row) => row.course.name ?? "-",
        size: 100, 
        header: () => <p className='column-title'>Course Name</p>,
        cell: ({row}) => <span>{row.original.course.name}</span>
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
        id: "details", 
        size: 100,
        header: () => <p className="column-title">Details</p>,
        cell: ({ row }) => <ShowButton resource="courses" recordItemId={row.original.courseId} variant="outline" size="sm">View</ShowButton>
      }
    ], []), 
    refineCoreProps: {
      resource: 'enrollments', 
      pagination: {
        pageSize: 10, 
        mode: "server", 
      },
      filters: {
        permanent: [
          { field: "studentId", operator: "eq", value: id },
        ],
      },
    }
  })

  const parents = useTable<ParentStudentLink>({
    columns: useMemo<ColumnDef<ParentStudentLink>[]>(() =>[
      {
        id: "name", 
        accessorFn: (row) => row.user.name ?? "-",
        size: 60,
        header: () => <p className='column-title'>Name</p>,
        cell: ({row}) => <span>{row.original.user.name}</span>
      }, 
      {
        id: "email", 
        accessorFn: (row) => row.user.email ?? "-",
        size: 90,
        header: () => <p className='column-title'>Email</p>,
        cell: ({row}) => <span>{row.original.user.email}</span>
      },
      {
        id: "details", 
        size: 50, 
        header: () => <p className='column-title'>Details</p>,
        cell: ({ row }) => <ShowButton resource="parents" recordItemId={row.original.user.id} variant="outline" size="sm">View</ShowButton>

      }
    ], []), 
    refineCoreProps: {
      resource: "students",
      meta: {
        path: "admin/students/parents"
      },
      pagination: {
        pageSize: 10, 
        mode: "server", 
      },
      filters: {
        permanent: [
          { field: "studentId", operator: "eq", value: id },
        ],
      },
    }
  })

  if (query.isLoading || query.isError || !student) {
    return (
      <ShowView>
        <ShowViewHeader resource="students" title="Student Details" />
        <p className="text-sm text-muted-foreground">
          {query.isLoading
            ? "Loading student details..."
            : query.isError
            ? "Failed to load student details."
            : "Student details not found."}
        </p>
      </ShowView>
    );
  }

  return (
    <ShowView className="space-y-6">
        <ShowViewHeader resource="students" title="Student Details" />

        <Separator />

        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-2xl font-bold leading-tight">
                          {student.user.name}
                      </CardTitle>

                      <div className="flex gap-2">
                          <Badge variant={student.user.emailVerified ? "default" : "secondary"}>
                            {student.user.emailVerified ? "Email Verified" : "Email Unverified"}
                          </Badge>

                      </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                      Student profile and account details.
                  </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field label="Email" value={student.user.email} />
                  <Field label="Profile Role" value={capitalizeFirst(student.user.profileRole)} />
                  <Field label="System Role" value={capitalizeFirst(student.user.role)} />
                  <Field label="User ID" value={student.userId} />
                  <Field label="School ID" value={student.schoolId} />
                  <Field label="School Name" value={student.school?.schoolName ?? "-"} />
                  <Field label="OSIS" value={String(student.osis)} />
                  <Field label="Grade Level" value={student.gradeLevel} />
                  <Field label="Date of Birth" value={student.dob} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dates</CardTitle>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-2">
                <Field label="Student Profile Created" value={formatDate(student.createdAt)} />
                <Field label="Student Profile Updated" value={formatDate(student.updatedAt)} />
                <Field label="User Created" value={formatDate(student.user.createdAt)} />
                <Field label="User Updated" value={formatDate(student.user.updatedAt)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Deleting this student will permanently remove their account.
                </p>

                <div className="flex justify-end">
                  <DeleteButton
                    resource="students"
                    recordItemId={student.userId}
                    onSuccess={() => {
                      go({
                          to: {
                              resource: "students",
                              action: "list",
                          },
                          type: "replace",
                      });
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
        <div className='grid grid-cols-2 w-full gap-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-xl'>Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable table={enrollments} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className='text-xl'>Parent Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable table={parents} />
            </CardContent>
          </Card>
        </div>
    </ShowView>
  );
};

export default ShowStudent;