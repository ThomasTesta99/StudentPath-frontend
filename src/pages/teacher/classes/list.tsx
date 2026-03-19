import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import ClassCard from "@/components/teacher/ClassCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Class as SectionClass, TermDetails } from "@/types";
import { useList } from "@refinedev/core";
import React, { useMemo, useState } from "react";
import { BookOpen, CalendarRange } from "lucide-react";

const ClassesList = () => {
    const [termSort, setTermSort] = useState<"date-desc" | "date-asc">("date-asc");

    const { query: termsQuery } = useList<TermDetails>({
        resource: "terms",
        meta: { path: "teacher/terms" },
        pagination: {
            mode: "off",
        },
    });

    const { query: classesQuery } = useList<SectionClass>({
        resource: "classes",
        meta: { path: "teacher/sections" },
        pagination: {
            mode: "off",
        },
    });

    const terms = useMemo(() => {
        return termsQuery.data?.data ?? [];
    }, [termsQuery.data?.data]);

    const classes = useMemo(() => {
        return classesQuery.data?.data ?? [];
    }, [classesQuery.data?.data]);

    const sortedTerms = useMemo(() => {
        const copiedTerms = [...terms];

        copiedTerms.sort((a, b) => {
            const aDate = new Date(a.startDate).getTime();
            const bDate = new Date(b.startDate).getTime();

            if (termSort === "date-asc") {
                return aDate - bDate;
            }

            return bDate - aDate;
        });

        return copiedTerms;
    }, [terms, termSort]);

    const classesByTerm = useMemo(() => {
        return classes.reduce<Record<string, SectionClass[]>>((acc, classItem) => {
            const termId = classItem.termId;
            if (!termId) return acc;

            if (!acc[termId]) {
                acc[termId] = [];
            }

            acc[termId].push(classItem);
            return acc;
        }, {});
    }, [classes]);

    if (termsQuery.isLoading || classesQuery.isLoading) {
        return (
            <ListView>
                <Breadcrumb />
                <div className="space-y-2">
                    <h1 className="page-title">Classes</h1>
                    <p className="text-sm text-muted-foreground">
                        Loading your classes...
                    </p>
                </div>
            </ListView>
        );
    }

    if (termsQuery.isError) {
        return (
            <ListView>
                <Breadcrumb />
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
                    <h1 className="page-title mb-2">Classes</h1>
                    <p className="text-sm text-destructive">Failed to load terms.</p>
                </div>
            </ListView>
        );
    }

    if (classesQuery.isError) {
        return (
            <ListView>
                <Breadcrumb />
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
                    <h1 className="page-title mb-2">Classes</h1>
                    <p className="text-sm text-destructive">Failed to load classes.</p>
                </div>
            </ListView>
        );
    }

    return (
        <ListView>
            <div className="space-y-6">
                <Breadcrumb />

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="page-title">Classes</h1>
                        <p className="text-sm text-muted-foreground">
                            View your classes grouped by term.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm text-muted-foreground w-fit">
                            <BookOpen className="h-4 w-4" />
                            <span>{classes.length} total classes</span>
                        </div>

                        <div className="w-full sm:w-[220px]">
                            <Select
                                value={termSort}
                                onValueChange={(value: "date-desc" | "date-asc") => setTermSort(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sort terms" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date-desc">Newest term first</SelectItem>
                                    <SelectItem value="date-asc">Oldest term first</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {sortedTerms.length === 0 ? (
                    <Card className="rounded-2xl border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <CalendarRange className="mb-3 h-10 w-10 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">No terms found</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                There are no available terms to display yet.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {sortedTerms.map((term) => {
                            const termClasses = classesByTerm[term.id] ?? [];

                            return (
                                <Card
                                    key={term.id}
                                    className="overflow-hidden rounded-2xl border shadow-sm"
                                >
                                    <CardHeader className="bg-muted/30 pb-4">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <CalendarRange className="h-5 w-5 text-muted-foreground" />
                                                    <h2 className="text-xl font-semibold tracking-tight">
                                                        {term.termName}
                                                    </h2>
                                                </div>

                                                <p className="text-sm text-muted-foreground">
                                                    {termClasses.length}{" "}
                                                    {termClasses.length === 1 ? "class" : "classes"}
                                                </p>
                                            </div>

                                            <div className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                                {termClasses.length} {termClasses.length === 1 ? "class" : "classes"}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <Separator />

                                    <CardContent className="pt-6">
                                        {termClasses.length > 0 ? (
                                            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                                                {termClasses.map((classItem) => (
                                                    <ClassCard
                                                        key={classItem.id}
                                                        classDetails={classItem}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center">
                                                <p className="text-sm font-medium">
                                                    No classes for this term
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Once classes are assigned, they'll appear here.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </ListView>
    );
};

export default ClassesList;