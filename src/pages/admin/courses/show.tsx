import { ShowButton } from '@/components/refine-ui/buttons/show';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { ShowView, ShowViewHeader } from '@/components/refine-ui/views/show-view';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Course, CourseEnrollment } from '@/types';
import { useShow } from '@refinedev/core';
import { useTable } from '@refinedev/react-table';
import { ColumnDef } from '@tanstack/react-table';
import React, { ReactNode, useMemo } from 'react';
import { useParams } from 'react-router';
import { BookOpen, Building2, CalendarRange, GraduationCap, School, Users } from 'lucide-react';
import EnrollStudent from '@/components/EnrollStudent';
import UnenrollStudent from '@/components/UnenrollStudent';

const DetailItem = ({
    label,
    value,
}: {
    label: string;
    value?: ReactNode;
}) => {
    return (
        <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium">
                {value || <span className="text-muted-foreground">Not available</span>}
            </p>
        </div>
    );
};

const ShowCourse = () => {
    const { id } = useParams();

    const { query: courseQuery } = useShow<Course>({
        resource: 'courses',
        id,
    });

    const course = courseQuery.data?.data;

    const enrollmentsTable = useTable<CourseEnrollment>({
        columns: useMemo<ColumnDef<CourseEnrollment>[]>(
            () => [
                {
                    id: 'name',
                    accessorFn: (row) => row.student.name,
                    size: 180,
                    header: () => <p className="column-title">Student Name</p>,
                    cell: ({ row }) => <span>{row.original.student.name}</span>,
                },
                {
                    id: 'email',
                    accessorFn: (row) => row.student.email,
                    size: 220,
                    header: () => <p className="column-title">Email</p>,
                    cell: ({ row }) => <span>{row.original.student.email}</span>,
                },
                {
                    id: 'osis',
                    accessorFn: (row) => row.student.osis,
                    size: 120,
                    header: () => <p className="column-title">OSIS</p>,
                    cell: ({ row }) => <span>{row.original.student.osis}</span>,
                },
                {
                    id: 'unenroll',
                    size: 120,
                    header: () => <p className="column-title">Unenroll</p>,
                    cell: ({row}) => (
                        <UnenrollStudent courseId={id} studentId={row.original.studentId}/>
                    ),
                },
                {
                    id: 'details',
                    size: 100,
                    header: () => <p className="column-title">Details</p>,
                    cell: ({ row }) => (
                        <ShowButton
                            resource="students"
                            recordItemId={row.original.studentId ?? '-'}
                            variant="outline"
                            size="sm"
                        >
                            View
                        </ShowButton>
                    ),
                },
            ], [id] 
        ),
        refineCoreProps: {
            resource: `admin/enrollments/${id}/roster`,
            pagination: {
                pageSize: 10,
                mode: 'server',
            },
            filters: {
                permanent: [{ field: 'courseId', operator: 'eq', value: id }],
            },
        },
    });

    const totalEnrolled =
        enrollmentsTable.refineCore?.tableQuery?.data?.total ??
        enrollmentsTable.refineCore?.tableQuery?.data?.data?.length ??
        0;

    if (courseQuery.isLoading || courseQuery.isError || !course) {
        return (
            <ShowView>
                <ShowViewHeader resource="courses" title="Course Details" />
                <p className="text-sm text-muted-foreground">
                    {courseQuery.isLoading
                        ? 'Loading course details...'
                        : courseQuery.isError
                        ? 'Failed to load course details.'
                        : 'Course details not found.'}
                </p>
            </ShowView>
        );
    }

    return (
        <ShowView>
            <ShowViewHeader resource="courses" title="Course Details" />
            <Separator />

            <div className="space-y-6 p-6">
                <Card>
                    <CardHeader className="space-y-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-3">
                                <Badge variant="secondary" className="w-fit text-sm">
                                    {course.code}
                                </Badge>

                                <div>
                                    <CardTitle className="text-3xl font-bold tracking-tight">
                                        {course.name}
                                    </CardTitle>
                                    <CardDescription className="mt-2 max-w-3xl text-sm">
                                        {course.description?.trim()
                                            ? course.description
                                            : 'No course description has been added yet.'}
                                    </CardDescription>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-lg border px-4 py-3">
                                    <p className="text-xs text-muted-foreground">Teacher</p>
                                    <p className="text-sm font-medium">
                                        {course.teacher?.name || 'Not assigned'}
                                    </p>
                                </div>
                                <div className="rounded-lg border px-4 py-3">
                                    <p className="text-xs text-muted-foreground">Students</p>
                                    <p className="text-sm font-medium">{totalEnrolled}</p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Course Information</CardTitle>
                            <CardDescription>
                                Academic and administrative details for this course.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <DetailItem
                                    label="Teacher"
                                    value={
                                        <span className="inline-flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                            {course.teacher?.name || 'Not assigned'}
                                        </span>
                                    }
                                />
                                <DetailItem
                                    label="Department"
                                    value={
                                        <span className="inline-flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            {course.department?.name || 'Not assigned'}
                                        </span>
                                    }
                                />
                                <DetailItem
                                    label="Term"
                                    value={
                                        <span className="inline-flex items-center gap-2">
                                            <CalendarRange className="h-4 w-4 text-muted-foreground" />
                                            {course.term?.termName || 'Not assigned'}
                                        </span>
                                    }
                                />
                                <DetailItem
                                    label="Grade Level"
                                    value={
                                        <span className="inline-flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                            {course.gradeLevel || 'Not assigned'}
                                        </span>
                                    }
                                />
                                <DetailItem
                                    label="School"
                                    value={
                                        <span className="inline-flex items-center gap-2">
                                            <School className="h-4 w-4 text-muted-foreground" />
                                            {course.school?.schoolName || 'Not available'}
                                        </span>
                                    }
                                />
                                <DetailItem
                                    label="Course Code"
                                    value={<Badge variant="outline">{course.code}</Badge>}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Roster Summary</CardTitle>
                            <CardDescription>
                                Quick enrollment overview for this course.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Enrolled Students</p>
                                        <p className="text-2xl font-bold">{totalEnrolled}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">Instructor</p>
                                <p className="mt-1 font-medium">
                                    {course.teacher?.name || 'No instructor assigned'}
                                </p>
                            </div>

                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">Department</p>
                                <p className="mt-1 font-medium">
                                    {course.department?.name || 'No department assigned'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className='flex flex-row items-start justify-between'>
                        <div className="space-y-1">
                            <CardTitle className="text-lg">Course Roster</CardTitle>
                            <CardDescription>
                                View enrolled students and manage course membership.
                            </CardDescription>
                        </div>
                        <EnrollStudent courseId={course.id}/>
                    </CardHeader>
                    <CardContent>
                        <DataTable table={enrollmentsTable} />
                    </CardContent>
                </Card>
            </div>
        </ShowView>
    );
};

export default ShowCourse;