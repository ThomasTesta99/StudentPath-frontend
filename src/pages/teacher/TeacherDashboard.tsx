import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useList } from "@refinedev/core";
import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarRange,
  ChevronRight,
  Clock3,
  DoorOpen,
  GraduationCap,
  Users,
} from "lucide-react";
import { Class, TermDetails } from "@/types";
import { ShowButton } from "@/components/refine-ui/buttons/show";

const TeacherDashboard = () => {
    const [selectedTermId, setSelectedTermId] = useState<string>("");

    const {
        query: termsQuery
    } = useList<TermDetails>({
            resource: "terms",
            pagination: {
                mode: "off",
            },
            meta: {
                path: "teacher/terms",
            },
    });

    const terms = useMemo(() => {
        return termsQuery?.data?.data ?? [];
    }, [termsQuery?.data?.data]);

    useEffect(() => {
        if (selectedTermId) return;
        if (!terms.length) return;

        const activeTerm = terms.find((term) => term.isActive);
        if (activeTerm) {
            setSelectedTermId(activeTerm.id);
        } else {
            setSelectedTermId("all");
        }
    }, [terms, selectedTermId]);

    const classFilters = useMemo(() => {
        if (!selectedTermId || selectedTermId === "all") return [];
        return [
        {
            field: "termId",
            operator: "eq" as const,
            value: selectedTermId,
        },
        ];
    }, [selectedTermId]);

    const {
        query: classeQuery
    } = useList<Class>({
        resource: "classes",
        filters: classFilters,
        pagination: {
            mode: "off",
        },
        meta: {
            path: "teacher/sections",
        },
    });

    const classes = useMemo(() => {
        return classeQuery?.data?.data ?? [];
    }, [classeQuery?.data?.data]);

    const selectedTerm = useMemo(() => {
        if (selectedTermId === "all") return null;
        return terms.find((term) => term.id === selectedTermId) ?? null;
    }, [terms, selectedTermId]);

    const totalStudents = useMemo(() => {
        return classes.reduce((sum, item) => sum + (item.studentCount ?? 0), 0);
    }, [classes]);

    const activeTermCount = useMemo(() => {
        return terms.filter((term) => term.isActive).length;
    }, [terms]);

    const formatPeriodTime = (startTime?: string, endTime?: string) => {
        if (!startTime || !endTime) return "Time unavailable";
        return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
    };

    return (
        <div className="space-y-6 p-6">
            <Breadcrumb />

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
                    <p className="text-muted-foreground">
                        View your assigned classes, student rosters, and academic workspace by term.
                    </p>
                </div>

                <div className="w-full max-w-xs">
                    <label className="mb-2 block text-sm font-medium">Term</label>
                    <Select
                        value={selectedTermId}
                        onValueChange={setSelectedTermId}
                        disabled={termsQuery.isLoading || termsQuery.isError}
                    >
                        <SelectTrigger className="cursor-pointer">
                            <SelectValue placeholder="Select a term" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="cursor-pointer">All Terms</SelectItem>
                            {terms.map((term) => (
                                <SelectItem key={term.id} value={term.id} className="cursor-pointer">
                                {term.termName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Your Classes</CardDescription>
                        <CardTitle className="text-3xl">{classes.length}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>
                            {selectedTerm ? `Assigned in ${selectedTerm.termName}` : "Across all selected terms"}
                        </span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Students</CardDescription>
                        <CardTitle className="text-3xl">{totalStudents}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Combined enrollment across visible classes</span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Active Terms</CardDescription>
                        <CardTitle className="text-3xl">{activeTermCount}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarRange className="h-4 w-4" />
                        <span>Terms currently marked active</span>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Classes</CardTitle>
                    <CardDescription>
                        Open a class to view its roster and section details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {termsQuery.isLoading || classeQuery.isLoading ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl border p-4 space-y-3 animate-pulse"
                                >
                                    <div className="h-5 w-2/3 rounded bg-muted" />
                                    <div className="h-4 w-1/2 rounded bg-muted" />
                                    <div className="h-4 w-full rounded bg-muted" />
                                    <div className="h-4 w-3/4 rounded bg-muted" />
                                    <div className="h-9 w-full rounded bg-muted" />
                                </div>
                            ))}
                        </div>
                    ) : termsQuery.isError || classeQuery.isError ? (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
                            <h3 className="font-semibold">Unable to load dashboard</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                There was a problem loading your terms or classes. Try refreshing the page.
                            </p>
                        </div>
                    ) : classes.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-10 text-center">
                            <GraduationCap className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">No classes found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {selectedTerm
                                ? `You do not have any assigned classes for ${selectedTerm.termName}.`
                                : "You do not have any assigned classes yet."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {classes.map((item) => (
                                <Card
                                    key={item.id}
                                    className="flex h-full flex-col justify-between border-border/70"
                                >
                                    <CardHeader className="space-y-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl">{item.course.name}</CardTitle>
                                                <CardDescription>
                                                    {item.sectionLabel || "Section"} • {item.term.termName}
                                                </CardDescription>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-4 w-4" />
                                                <span>
                                                    {item.course.gradeLevel ? ` Grade ${item.course.gradeLevel}` : ""}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Clock3 className="h-4 w-4" />
                                                <span>
                                                    Period {item.period.number} •{" "}
                                                    {formatPeriodTime(item.period.startTime, item.period.endTime)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <DoorOpen className="h-4 w-4" />
                                                <span>{item.roomNumber ? `Room ${item.roomNumber}` : "Room not assigned"}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                <span>{item.studentCount} students enrolled</span>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <ShowButton
                                            className="w-full"
                                            resource="classes"
                                            recordItemId={item.id}
                                        >
                                            Open Class
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </ShowButton>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TeacherDashboard;