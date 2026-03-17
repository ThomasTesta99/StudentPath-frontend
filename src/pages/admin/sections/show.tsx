import EnrollStudent from "@/components/EnrollStudent";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import UnenrollStudent from "@/components/UnenrollStudent";
import { CourseEnrollment, Section } from "@/types";
import { useGo, useShow } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { BookOpen, Building2, CalendarDays, DoorOpen, UserRound, Users } from "lucide-react";
import { ReactNode, useMemo } from "react";
import { useParams } from "react-router";

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

const ShowSection = () => {
    const { id } = useParams();
    const go = useGo();
    const { query: sectionQuery } = useShow<Section>({
        resource: 'sections',
        id,
        meta: {
            path: 'admin/sections',
        },
    });

    const section = sectionQuery.data?.data;

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
                    cell: ({ row }) => (
                        <UnenrollStudent sectionId={id!} studentId={row.original.studentId} />
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
            ],
            [id]
        ),
        refineCoreProps: {
            resource: `admin/enrollments/${id}/roster`,
            pagination: {
                pageSize: 10,
                mode: 'server',
            },
        },
    });

    const totalEnrolled =
        enrollmentsTable.refineCore?.tableQuery?.data?.total ??
        enrollmentsTable.refineCore?.tableQuery?.data?.data?.length ??
        0;

    const capacity = section?.capacity ?? 0;

    const availableSeats =
        capacity === 0 ? 0 : Math.max(capacity - totalEnrolled, 0);

    const isFull =
        capacity !== 0 && availableSeats <= 0;

    if (sectionQuery.isLoading || sectionQuery.isError || !section) {
        return (
            <ShowView>
                <ShowViewHeader resource="sections" title="Section Details" />
                <p className="text-sm text-muted-foreground">
                    {sectionQuery.isLoading
                        ? 'Loading section details...'
                        : sectionQuery.isError
                        ? 'Failed to load section details.'
                        : 'Section details not found.'}
                </p>
            </ShowView>
        );
    }

    return (
        <ShowView>
            <ShowViewHeader resource="sections" title="Section Details" />
            <Separator />

            <div className="space-y-6 p-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-3">
                                <Badge variant="secondary" className="w-fit text-sm">
                                    {section.course?.code || 'Course'}
                                </Badge>

                                <div>
                                    <CardTitle className="text-3xl font-bold tracking-tight">
                                        {section.course?.name} — Section {section.sectionLabel}
                                    </CardTitle>
                                    <CardDescription className="mt-2 max-w-3xl text-sm">
                                        {section.course?.description?.trim()
                                            ? section.course.description
                                            : 'No course description has been added yet.'}
                                    </CardDescription>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 lg:items-end">

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[420px]">
                                    <div className="rounded-lg border px-4 py-3">
                                        <p className="text-xs text-muted-foreground">Teacher</p>
                                        <p className="text-sm font-medium">
                                            {section.teacher?.name || "Not assigned"}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border px-4 py-3">
                                        <p className="text-xs text-muted-foreground">Students</p>
                                        <p className="text-sm font-medium">{totalEnrolled}</p>
                                    </div>

                                    <div className="rounded-lg border px-4 py-3">
                                        <p className="text-xs text-muted-foreground">Available Seats</p>
                                        <p className="text-sm font-medium">
                                            {availableSeats === null ? "Open" : availableSeats}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <DeleteButton
                                        resource="sections"
                                        recordItemId={section.id}
                                        meta={{ path: "admin/sections" }}
                                        confirmTitle="Delete this section?"
                                        confirmDescription={`Section ${section.sectionLabel} will be permanently deleted, along with all student enrollments.`}
                                        confirmOkLabel="Delete section"
                                        cancelLabel="Cancel"
                                        size="sm"
                                        onSuccess={() => {
                                            go({
                                                to: {
                                                    resource: "sections",
                                                    action: "list",
                                                },
                                                type: "replace",
                                            }); 
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Section Information</CardTitle>
                            <CardDescription>
                                Academic and scheduling details for this section.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <DetailItem
                                    label="Department"
                                    value={
                                        <span className="inline-flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            {section.department?.name || 'Not assigned'}
                                        </span>
                                    }
                                />
                                <DetailItem
                                    label="Course"
                                    value={
                                        <span className="inline-flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                            {section.course?.name || 'Not available'}
                                        </span>
                                    }
                                />
                                <DetailItem
                                    label="Section"
                                    value={<Badge variant="outline">{section.sectionLabel}</Badge>}
                                />
                                <DetailItem
                                    label="Teacher"
                                    value={
                                        <span className="inline-flex items-center gap-2">
                                            <UserRound className="h-4 w-4 text-muted-foreground" />
                                            {section.teacher?.name || 'Not assigned'}
                                        </span>
                                    }
                                />
                                <DetailItem
                                    label="Term"
                                    value={
                                        <span className="inline-flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            {section.term?.termName || 'Not assigned'}
                                        </span>
                                    }
                                />
                                <DetailItem
                                    label="Period"
                                    value={
                                        section.period?.number
                                            ? `Period ${section.period.number}`
                                            : 'Not assigned'
                                    }
                                />
                                <DetailItem
                                    label="Capacity"
                                    value={
                                        capacity === null ? "No capacity set" : `${totalEnrolled}/${capacity} enrolled`
                                    }
                                />

                                <DetailItem
                                    label="Available Seats"
                                    value={
                                        availableSeats === null ? (
                                            "Open"
                                        ) : isFull ? (
                                            <Badge variant="destructive">Full</Badge>
                                        ) : (
                                            `${availableSeats} seat${availableSeats === 1 ? "" : "s"} left`
                                        )
                                    }
                                />
                                <DetailItem
                                    label="Room Number"
                                    value={
                                        <span className="inline-flex items-center gap-2">
                                            <DoorOpen className="h-4 w-4 text-muted-foreground" />
                                            {section.roomNumber || 'Not assigned'}
                                        </span>
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Roster Summary</CardTitle>
                            <CardDescription>
                                Quick enrollment overview for this section.
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
                                    {section.teacher?.name || 'No instructor assigned'}
                                </p>
                            </div>

                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">Department</p>
                                <p className="mt-1 font-medium">
                                    {section.department?.name || 'No department assigned'}
                                </p>
                            </div>

                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">Capacity</p>
                                <p className="mt-1 font-medium">
                                    {capacity === null ? "No capacity set" : capacity}
                                </p>
                            </div>

                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">Available Seats</p>
                                <p className="mt-1 font-medium">
                                    {availableSeats === null
                                        ? "Open"
                                        : `${availableSeats} seat${availableSeats === 1 ? "" : "s"} left`}
                                </p>
                                {isFull && (
                                    <Badge variant="destructive" className="mt-2">
                                        Section Full
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg">Section Roster</CardTitle>
                            <CardDescription>
                                View enrolled students and manage section membership.
                            </CardDescription>
                        </div>
                        <EnrollStudent sectionId={section.id} />
                    </CardHeader>
                    <CardContent>
                        <DataTable table={enrollmentsTable} />
                    </CardContent>
                </Card>
            </div>
        </ShowView>
    );
};

export default ShowSection;