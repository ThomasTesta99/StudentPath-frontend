import { ShowView, ShowViewHeader } from '@/components/refine-ui/views/show-view';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Course, Section } from '@/types';
import { useShow } from '@refinedev/core';
import React, { ReactNode, useMemo } from 'react';
import { useParams } from 'react-router';
import { BookOpen, Building2, School} from 'lucide-react';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { useTable } from '@refinedev/react-table';
import { ColumnDef } from '@tanstack/react-table';
import { ShowButton } from '@/components/refine-ui/buttons/show';
import { CreateButton } from '@/components/refine-ui/buttons/create';

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

    const sectionsTable = useTable<Section>({
        columns: useMemo<ColumnDef<Section>[]>(() => [
            {
                id: "sectionLabel",
                accessorFn: (row) => row.sectionLabel ?? "-",
                size: 60,
                header: () => <p className="column-title">Section</p>,
                cell: ({ row }) => <span>{row.original.sectionLabel}</span>,
            },
            {
                id: "teacher",
                accessorFn: (row) => row.teacher.name ?? "-",
                size: 80,
                header: () => <p className="column-title">Teacher</p>,
                cell: ({ row }) => <span>{row.original.teacher.name}</span>,
            },
            {
                id: "term",
                accessorFn: (row) => row.term.termName ?? "-",
                size: 50,
                header: () => <p className="column-title">Term</p>,
                cell: ({ row }) => <span>{row.original.term.termName}</span>,
            },
            {
                id: "period",
                accessorFn: (row) => row.period.number ?? "-",
                size: 50,
                header: () => <p className="column-title">Period</p>,
                cell: ({ row }) => <span>Period {row.original.period.number}</span>,
            },
            {
                id: "capacity",
                accessorFn: (row) => row.capacity ?? "-",
                size: 50,
                header: () => <p className="column-title">Capacity</p>,
                cell: ({ row }) => <span>{row.original.capacity}</span>,
            },
            {
                id: "roomNumber",
                accessorFn: (row) => row.roomNumber ?? "-",
                size: 50,
                header: () => <p className="column-title">Room</p>,
                cell: ({ row }) => <span>{row.original.roomNumber ?? "-"}</span>,
            },
            {
                id: 'details',
                size: 50,
                header: () => <p className="column-title">Details</p>,
                cell: ({ row }) => (
                    <ShowButton
                        resource="sections"
                        recordItemId={row.original.id ?? '-'}
                        variant="outline"
                        size="sm"
                    >
                        View
                    </ShowButton>
                ),
            },
        ], []),
        refineCoreProps: {
            resource: "sections",
            meta: {
                path: "admin/sections"
            },
            pagination: {
                pageSize: 10, 
                mode: "server", 
            },
            filters: {
                permanent: [
                    { field: "courseId", operator: "eq", value: id },
                ],
            },
        }
    })
    

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
                                    label="School"
                                    value={
                                        <span className="inline-flex items-center gap-2">
                                            <School className="h-4 w-4 text-muted-foreground" />
                                            {course.school?.schoolName || 'Not available'}
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
                                    label="Grade Level"
                                    value={
                                        <span className="inline-flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                            {course.gradeLevel || 'Not assigned'}
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

                </div>

                <Card>
                    <CardHeader className='flex flex-row items-start justify-between'>
                        <div className="space-y-1">
                            <CardTitle className="text-lg">Course Sections</CardTitle>
                            <CardDescription>
                                View sections offered for this course.
                            </CardDescription>
                        </div>
                        <CreateButton resource='sections' />
                    </CardHeader>
                    <CardContent>
                        <DataTable table={sectionsTable} />
                    </CardContent>
                </Card>
            </div>
        </ShowView>
    );
};

export default ShowCourse;