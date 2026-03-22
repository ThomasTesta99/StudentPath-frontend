import { CreateButton } from "@/components/refine-ui/buttons/create";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TeacherCourseRow } from "@/types";
import { useList } from "@refinedev/core";
import { BookOpen, ClipboardPlus } from "lucide-react";
import React, { useMemo } from "react";

const AssignmentsList = () => {
    const { query: coursesQuery } = useList<TeacherCourseRow>({
        resource: "classes",
        meta: { path: "teacher/courses" },
        pagination: {
            mode: "off",
        },
    });

    const courses = useMemo(() => {
        return coursesQuery?.data?.data ?? [];
    }, [coursesQuery?.data?.data]);

    const isLoading = coursesQuery?.isLoading;
    const isError = coursesQuery?.isError;

    return (
        <ListView>
            <Breadcrumb />

            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Create Assignment
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Select a course below to start creating a new assignment.
                    </p>
                </div>

                <Separator />

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Card key={index} className="border-border/60 shadow-sm">
                                <CardHeader className="space-y-3">
                                    <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
                                    <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
                                </CardHeader>
                                <CardContent>
                                    <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : isError ? (
                    <Card className="border-destructive/30">
                        <CardContent className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-center">
                            <div className="rounded-full bg-destructive/10 p-3">
                                <BookOpen className="h-5 w-5 text-destructive" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="font-medium">Unable to load courses</h2>
                                <p className="text-sm text-muted-foreground">
                                    There was a problem loading your classes. Please try again.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : courses.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-4 text-center">
                            <div className="rounded-full bg-primary/10 p-4">
                                <ClipboardPlus className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold">No courses available</h2>
                                <p className="max-w-md text-sm text-muted-foreground">
                                    Once you are assigned to courses, they will appear here so you
                                    can create assignments for them.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {courses.map((course) => (
                            <Card
                                key={course.id}
                                className="group border-border/60 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                            <BookOpen className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0 space-y-1">
                                            <CardTitle className="truncate text-base font-semibold">
                                                {course.name}
                                            </CardTitle>

                                            <p className="text-sm text-muted-foreground">
                                                Create and assign work for this course.
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    <CreateButton
                                        resource="assignments"
                                        meta={{ query: { courseId: course.id } }}
                                        className="w-full"
                                    >
                                        Create assignment
                                    </CreateButton>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </ListView>
    );
};

export default AssignmentsList;