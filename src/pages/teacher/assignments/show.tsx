import { Assignment } from "@/types";
import { useGo, useShow } from "@refinedev/core";
import React from "react";
import { useParams } from "react-router";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    CalendarDays,
    ClipboardList,
    FileText,
    Hash,
    Layers3,
    AlertTriangle,
    BookOpen,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const AssignmentShow = () => {
    const { id } = useParams();
    const go = useGo();
    const { query: assignmentQuery } = useShow<Assignment>({
        resource: "assignments",
        id,
    });

    const assignment = assignmentQuery.data?.data;

    const renderTypeBadge = (type?: string) => {
        if (!type) return <Badge variant="secondary">N/A</Badge>;

        const formattedType = type
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());

        return (
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                {formattedType}
            </Badge>
        );
    };

    return (
        <ShowView>
            <ShowViewHeader
                title="Assignment Details"
                resource="assignments"
            />

            {assignmentQuery.isError ? (
                <Card className="border-destructive/30 shadow-sm">
                    <CardContent className="py-12 text-center">
                        <p className="text-sm text-muted-foreground">
                            Something went wrong while loading this assignment.
                        </p>
                    </CardContent>
                </Card>
            ) : !assignment ? (
                <Card className="shadow-sm">
                    <CardContent className="py-12 text-center">
                        <p className="text-sm text-muted-foreground">
                            Assignment not found.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <Card className="overflow-hidden border-0 shadow-md">
                        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-6 rounded-xl">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <BookOpen className="h-4 w-4" />
                                        <span>Assignment Overview</span>
                                    </div>

                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight">
                                            {assignment.title}
                                        </h1>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            View the assignment details, due date, type, and grading information.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {renderTypeBadge(assignment.type)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <CardContent className="space-y-6 p-6">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <InfoCard
                                    icon={<Hash className="h-4 w-4" />}
                                    label="Points Possible"
                                    value={
                                        assignment.pointsPossible !== undefined &&
                                        assignment.pointsPossible !== null
                                            ? String(assignment.pointsPossible)
                                            : "N/A"
                                    }
                                />

                                <InfoCard
                                    icon={<CalendarDays className="h-4 w-4" />}
                                    label="Due Date"
                                    value={
                                        assignment.dueDate
                                            ? formatDate(assignment.dueDate)
                                            : "N/A"
                                    }
                                />

                                <InfoCard
                                    icon={<Layers3 className="h-4 w-4" />}
                                    label="Type"
                                    value={
                                        assignment.type
                                            ? assignment.type
                                                  .replaceAll("_", " ")
                                                  .replace(/\b\w/g, (char) => char.toUpperCase())
                                            : "N/A"
                                    }
                                />

                                <InfoCard
                                    icon={<ClipboardList className="h-4 w-4" />}
                                    label="Assignment ID"
                                    value={assignment.id ?? "N/A"}
                                />
                            </div>

                            <Separator />

                            <Card className="border bg-muted/20 shadow-none">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <CardTitle className="text-base">Description</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Additional details and instructions for this assignment.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <div className="rounded-xl border bg-background p-5 min-h-[180px]">
                                        <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                                            {assignment.description?.trim()
                                                ? assignment.description
                                                : "No description provided."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>

                    <Card className="border-destructive/25 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                <CardTitle className="text-base">Danger Zone</CardTitle>
                            </div>
                            <CardDescription>
                                Deleting this assignment is permanent, cannot be undone, and will remove all grades.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Remove this assignment.
                            </div>

                            <DeleteButton
                                resource="assignments"
                                recordItemId={assignment.id}
                                onSuccess={() => {
                                    go({
                                        to: {
                                            resource: "assignments",
                                            action: "list",
                                        },
                                        type: "replace",
                                    });
                                }}
                            >
                                    Delete Assignment
                            </DeleteButton>
                        </CardContent>
                    </Card>
                </div>
            )}
        </ShowView>
    );
};

type InfoCardProps = {
    icon: React.ReactNode;
    label: string;
    value: string;
};

const InfoCard = ({ icon, label, value }: InfoCardProps) => {
    return (
        <div className="rounded-2xl border bg-background p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                {icon}
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                    {label}
                </span>
            </div>
            <p className="text-sm font-semibold break-words text-foreground">
                {value}
            </p>
        </div>
    );
};

export default AssignmentShow;