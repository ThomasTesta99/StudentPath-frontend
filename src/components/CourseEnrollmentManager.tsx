import EnrollStudent from "@/components/EnrollStudent";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { useDebouncedValue } from "@/lib/utilsTsx";
import { Section, TermDetails } from "@/types";
import { useTable } from "@refinedev/react-table";
import { useList } from "@refinedev/core";
import { ColumnDef } from "@tanstack/react-table";
import React, { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { BookOpen, CalendarDays, Search, SlidersHorizontal, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const CourseEnrollmentManager = () => {
    const [search, setSearch] = useState("");
    const [selectedTermId, setSelectedTermId] = useState<string>("all");
    const [useActiveTerm, setUseActiveTerm] = useState(false);

    const debouncedValue = useDebouncedValue(search, 300);

    const searchFilters = debouncedValue
        ? [{ field: "search", operator: "contains" as const, value: debouncedValue.trim() }]
        : [];

    const termFilters =
        selectedTermId === "all"
            ? []
            : [{ field: "termId", operator: "eq" as const, value: selectedTermId }];

    const activeTermFilters = useActiveTerm
        ? [{ field: "active", operator: "eq" as const, value: true }]
        : [];

    const columns = useMemo<ColumnDef<Section>[]>(
        () => [
            {
                id: "course",
                accessorFn: (row) => row.course?.name ?? "",
                header: () => <p className="column-title">Course</p>,
                size: 240,
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <p className="font-medium text-foreground">
                            {row.original.course?.name ?? "Unknown course"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {row.original.course?.code ?? "No code"}
                        </p>
                    </div>
                ),
            },
            {
                id: "sectionLabel",
                accessorFn: (row) => row.sectionLabel ?? "",
                header: () => <p className="column-title">Section</p>,
                size: 110,
                cell: ({ row }) => (
                    <Badge variant="secondary" className="font-medium">
                        {row.original.sectionLabel ?? "—"}
                    </Badge>
                ),
            },
            {
                id: "teacher",
                accessorFn: (row) => row.teacher?.name ?? "",
                header: () => <p className="column-title">Teacher</p>,
                size: 180,
                cell: ({ row }) => (
                    <span className="text-sm">{row.original.teacher?.name ?? "Unassigned"}</span>
                ),
            },
            {
                id: "term",
                accessorFn: (row) => row.term?.termName ?? "",
                header: () => <p className="column-title">Term</p>,
                size: 150,
                cell: ({ row }) => (
                    <span className="text-sm">{row.original.term?.termName ?? "—"}</span>
                ),
            },
            {
                id: "period",
                accessorFn: (row) => row.period?.number ?? "",
                header: () => <p className="column-title">Period</p>,
                size: 100,
                cell: ({ row }) => (
                    <span className="text-sm">
                        {row.original.period?.number
                            ? `Period ${row.original.period.number}`
                            : "—"}
                    </span>
                ),
            },
            {
                id: "roomNumber",
                accessorFn: (row) => row.roomNumber ?? "",
                header: () => <p className="column-title">Room</p>,
                size: 100,
                cell: ({ row }) => (
                    <span className="text-sm">{row.original.roomNumber ?? "—"}</span>
                ),
            },
            {
                id: "availableSeats",
                accessorFn: (row) => row.availableSeats ?? "",
                header: () => <p className="column-title">Seats</p>,
                size: 140,
                cell: ({ row }) => {
                    const availableSeats = row.original.availableSeats ?? 0;
                    const enrolledCount = row.original.enrolledCount ?? 0;
                    const capacity = row.original.capacity;

                    if (capacity == null) {
                        return <span className="text-sm">Open</span>;
                    }

                    return (
                        <div className="space-y-1">
                            <p className={cn("text-sm font-medium", enrolledCount >= capacity ? "text-red-400" : "")}>
                                {availableSeats} left
                            </p>
                            <p className={cn("text-xs text-muted-foreground", 
                                enrolledCount > capacity ? "text-red-400" : ''
                            )}>
                                {enrolledCount}/{capacity} enrolled
                            </p>
                        </div>
                    );
                },
            },
            {
                id: "view",
                header: () => <p className="column-title">Section</p>,
                size: 110,
                cell: ({ row }) =>
                    row.original.id ? (
                        <ShowButton
                            resource="sections"
                            recordItemId={row.original.id}
                            variant="outline"
                            size="sm"
                        >
                            View
                        </ShowButton>
                    ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                    ),
            },
            {
                id: "enroll",
                header: () => <p className="column-title">Enroll</p>,
                size: 130,
                cell: ({ row }) =>
                    row.original.id ? (
                        <EnrollStudent sectionId={row.original.id} />
                    ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                    ),
            },
        ],
        []
    );

    const sectionsTable = useTable<Section>({
        columns,
        refineCoreProps: {
            resource: "sections",
            meta: { path: "admin/sections" },
            pagination: {
                mode: "server",
                pageSize: 10,
            },
            filters: {
                mode: "server",
                permanent: [...searchFilters, ...termFilters],
            },
        },
    });

    const { query: termsQuery } = useList<TermDetails>({
        resource: "terms",
        pagination: { mode: "off" },
        meta: { path: "admin/terms" },
        filters: [...activeTermFilters],
    });

    useEffect(() => {
        if (!useActiveTerm) return;

        const activeTerm = termsQuery.data?.data?.[0];
        if (activeTerm) {
            setSelectedTermId(activeTerm.id);
        }
    }, [useActiveTerm, termsQuery.data?.data]);

    const handleActiveTermChange = (checked: boolean | "indeterminate") => {
        const isChecked = checked === true;
        setUseActiveTerm(isChecked);

        if (!isChecked) {
            setSelectedTermId("all");
        }
    };

    const total = sectionsTable.refineCore?.tableQuery?.data?.total ?? 0;
    const termCount = termsQuery.data?.data?.length ?? 0;

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden border-border/60 shadow-sm">
                <CardHeader className="bg-muted/30">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Course Enrollment</CardTitle>
                                    <CardDescription className="mt-1 max-w-2xl">
                                        Search sections, narrow by term, and enroll students into
                                        the correct course offering.
                                    </CardDescription>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border bg-background px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">
                                        Results
                                    </span>
                                </div>
                                <p className="mt-2 text-2xl font-semibold">{total}</p>
                            </div>

                            <div className="rounded-xl border bg-background px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CalendarDays className="h-4 w-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">
                                        Terms
                                    </span>
                                </div>
                                <p className="mt-2 text-2xl font-semibold">{termCount}</p>
                            </div>

                            <div className="rounded-xl border bg-background px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">
                                        Filter
                                    </span>
                                </div>
                                <p className="mt-2 text-sm font-medium">
                                    {useActiveTerm
                                        ? "Active term only"
                                        : selectedTermId === "all"
                                          ? "All terms"
                                          : "Custom term selected"}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_220px_auto]">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder="Search by course, section, or teacher..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <Select
                            value={selectedTermId}
                            onValueChange={setSelectedTermId}
                            disabled={termsQuery.isLoading || termsQuery.isError || useActiveTerm}
                        >
                            <SelectTrigger className="w-full cursor-pointer">
                                <SelectValue placeholder="Filter by term" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="cursor-pointer">
                                    All Terms
                                </SelectItem>

                                {termsQuery.isLoading && (
                                    <SelectItem value="loading" disabled>
                                        Loading terms...
                                    </SelectItem>
                                )}

                                {termsQuery.isError && (
                                    <SelectItem value="error" disabled>
                                        Failed to load terms
                                    </SelectItem>
                                )}

                                {!termsQuery.isLoading &&
                                    !termsQuery.isError &&
                                    termsQuery.data?.data?.map((term) => (
                                        <SelectItem
                                            key={term.id}
                                            value={term.id}
                                            className="cursor-pointer"
                                        >
                                            {term.termName}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>

                        <div className="flex items-center rounded-lg border px-3 py-2">
                            <Checkbox
                                id="active-term"
                                checked={useActiveTerm}
                                onCheckedChange={handleActiveTermChange}
                                disabled={termsQuery.isLoading}
                                className="cursor-pointer"
                            />
                            <label
                                htmlFor="active-term"
                                className="ml-2 cursor-pointer text-sm font-medium"
                            >
                                Active Term
                            </label>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                        <p>
                            Showing <span className="font-medium text-foreground">{total}</span>{" "}
                            section{total === 1 ? "" : "s"}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {debouncedValue && (
                                <Badge variant="secondary">Search: {debouncedValue}</Badge>
                            )}
                            {useActiveTerm && <Badge variant="secondary">Active Term</Badge>}
                            {!useActiveTerm && selectedTermId !== "all" && (
                                <Badge variant="secondary">Term Filter Applied</Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Available Sections</CardTitle>
                    <CardDescription>
                        Review sections and enroll students directly from the table below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="rounded-xl border bg-background">
                        <DataTable table={sectionsTable} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CourseEnrollmentManager;