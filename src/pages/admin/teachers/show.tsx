import { ShowView, ShowViewHeader } from '@/components/refine-ui/views/show-view';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { capitalizeFirst, formatDate } from '@/lib/utils';
import { Field } from '@/lib/utilsTsx';
import { TeacherProfile } from '@/types';
import { useShow } from '@refinedev/core';
import React from 'react'
import { useParams } from 'react-router'

const ShowTeacher = () => {
    const {id} = useParams();

    const {query} = useShow<TeacherProfile>({
        resource: "teachers",
        id: id, 
    });

    const teacher = query?.data?.data;

    if(query.isLoading || query.isError || !teacher){
        return (
            <ShowView>
                <ShowViewHeader resource='teachers' title='Instructor Details'/>
                <p className="text-sm text-muted-foreground">
                {query.isLoading
                    ? "Loading instructor details..."
                    : query.isError
                    ? "Failed to load instructor details."
                    : "Instructor details not found."}
                </p>
            </ShowView>
        )
    }

    return (
        <ShowView className="space-y-6">
        <ShowViewHeader resource="teachers" title="Instructor Details" />

        <Separator />

        <div className="mx-auto w-full max-w-5xl space-y-6">
            <Card>
            <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-2xl font-bold leading-tight">
                    {teacher.user.name}
                </CardTitle>

                <div className="flex gap-2">
                    <Badge variant={teacher.user.emailVerified ? "default" : "secondary"}>
                    {teacher.user.emailVerified ? "Verified" : "Unverified"}
                    </Badge>

                    {teacher.user.banned && (
                    <Badge variant="destructive">Banned</Badge>
                    )}
                </div>
                </div>

                <p className="text-sm text-muted-foreground">
                Instructor profile and account details.
                </p>
            </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Field label="Email" value={teacher.user.email} />
                    <Field label="Profile Role" value={capitalizeFirst(teacher.user.profileRole)} />
                    <Field label="System Role" value={capitalizeFirst(teacher.user.role)} />
                    <Field label="User ID" value={teacher.userId} />
                    <Field label="School ID" value={teacher.schoolId} />
                    <Field label="School Name" value={teacher.school?.schoolName ?? "-"} />
                    </div>
                </CardContent>
                </Card>

                <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Dates</CardTitle>
                </CardHeader>

                <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Field label="Teacher Profile Created" value={formatDate(teacher.createdAt)} />
                    <Field label="Teacher Profile Updated" value={formatDate(teacher.updatedAt)} />
                    <Field label="User Created" value={formatDate(teacher.user.createdAt)} />
                    <Field label="User Updated" value={formatDate(teacher.user.updatedAt)} />
                </CardContent>
                </Card>
            </div>
        </ShowView>
    )
}

export default ShowTeacher
