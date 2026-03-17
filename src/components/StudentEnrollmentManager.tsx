import { ShowButton } from "@/components/refine-ui/buttons/show";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { useList } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StudentProfile, StudentScheduleRow, TermDetails } from "@/types";
import { useDebouncedValue } from "@/lib/utilsTsx";
import { Check, Search, UserRound } from "lucide-react";
import UnenrollStudent from "./UnenrollStudent";
import FindCourse from "./FindCourse";

const StudentEnrollmentManager = () => {
    const [studentSearch, setStudentSearch] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");
    const [selectedTermId, setSelectedTermId] = useState<string>("all");
    const [useActiveTerm, setUseActiveTerm] = useState(false);

    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

    const studentDropdownRef = useRef<HTMLDivElement | null>(null);

    const debouncedStudentSearch = useDebouncedValue(studentSearch, 300);
    const shouldFetchStudents =
        isStudentDropdownOpen && debouncedStudentSearch.trim().length >= 2;

    const termFilters =
        selectedTermId === "all"
            ? []
            : [{ field: "termId", operator: "eq" as const, value: selectedTermId }];

    const activeTermFilters = useActiveTerm
        ? [{ field: "active", operator: "eq" as const, value: true }]
        : [];

    const { query: studentsQuery } = useList<StudentProfile>({
        resource: "students",
        pagination: {
            currentPage: 1,
            pageSize: 10,
        },
        meta: { path: "admin/students" },
        filters: [
            { field: "search", operator: "contains", value: debouncedStudentSearch.trim() },
        ],
        queryOptions: {
            enabled: shouldFetchStudents,
        },
    });

    const { query: termsQuery } = useList<TermDetails>({
        resource: "terms",
        pagination: { mode: "off" },
        meta: { path: "admin/terms" },
        filters: activeTermFilters,
    });

    const students = studentsQuery.data?.data ?? [];
    const terms = useActiveTerm ? termsQuery.data?.data ?? [] : termsQuery.data?.data ?? [];

    useEffect(() => {
        if (!useActiveTerm) return;

        const activeTerm = termsQuery.data?.data?.[0];
        if (activeTerm) {
            setSelectedTermId(activeTerm.id);
        }
    }, [useActiveTerm, termsQuery.data?.data]);

    useEffect(() => {
        const handlePointerDown = (e: PointerEvent) => {
            const studentEl = studentDropdownRef.current;

            if (studentEl && !studentEl.contains(e.target as Node)) {
                setIsStudentDropdownOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, []);

    const handleActiveTermChange = (checked: boolean | "indeterminate") => {
        const isChecked = checked === true;
        setUseActiveTerm(isChecked);

        if (!isChecked) {
            setSelectedTermId("all");
        }
    };

    const columns = useMemo<ColumnDef<StudentScheduleRow>[]>(
        () => [
            {
                id: "period",
                accessorFn: (row) => row.period?.number ?? "",
                header: () => <p className="column-title">Period</p>,
                size: 110,
                cell: ({ row }) => (
                    <div className="inline-flex min-w-[90px] items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                        {row.original.period?.number ? `Period ${row.original.period.number}` : "—"}
                    </div>
                ),
            },
            {
                id: "course",
                accessorFn: (row) => row.course?.name ?? "",
                header: () => <p className="column-title">Course Title</p>,
                size: 260,
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <p className="font-medium text-foreground">
                            {row.original.course?.name ?? "Free Period"}
                        </p>
                        {row.original.course?.code && (
                            <p className="text-xs text-muted-foreground">
                                {row.original.course.code}
                            </p>
                        )}
                    </div>
                ),
            },
            {
                id: "teacher",
                accessorFn: (row) => row.teacher?.name ?? "",
                header: () => <p className="column-title">Teacher</p>,
                size: 190,
                cell: ({ row }) => (
                    <span className="text-sm font-medium">
                        {row.original.teacher?.name ?? "Unassigned"}
                    </span>
                ),
            },
            {
                id: "room",
                accessorFn: (row) => row.section?.roomNumber ?? "",
                header: () => <p className="column-title">Room</p>,
                size: 110,
                cell: ({ row }) => (
                    <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                        {row.original.section?.roomNumber ?? "—"}
                    </span>
                ),
            },
            {
                id: "sectionDetails",
                header: () => <p className="column-title">Section</p>,
                size: 110,
                cell: ({ row }) =>
                    row.original.section?.id ? (
                        <ShowButton
                            resource="sections"
                            recordItemId={row.original.section.id}
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
                id: "actions", 
                accessorFn: (row) => row.isEnrolled,
                size: 100,
                header: () => <p className="column-title">Action</p>,
                cell: ({row}) => 
                    row.original.isEnrolled ? (
                        <UnenrollStudent studentId={selectedStudentId} sectionId={row.original.enrollment.sectionId}/>
                    ) : (
                        <FindCourse studentId={selectedStudentId} periodId={row.original.period.id}/>
                    )
            }
        ], [selectedStudentId]
    );

    const scheduleTable = useTable<StudentScheduleRow>({
        columns,
        refineCoreProps: {
            resource: "enrollments",
            meta: {
                path: `admin/enrollments/student/${selectedStudentId}`,
            },
            filters: {
              permanent: [...activeTermFilters, ...termFilters],
            },
            pagination: {
                mode: "off",
            },
            queryOptions: {
                enabled: !!selectedStudentId && selectedTermId !== "all",
            },
        },
    });

    const selectedStudent = students.find(
        (student) => student.userId === selectedStudentId
    );

    const scheduleRows = scheduleTable.refineCore.tableQuery?.data?.data ?? [];
    const scheduleRowCount = scheduleRows.length;

    return (
        <div className="space-y-6">
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="bg-muted/30">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <UserRound className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Student Schedule Management</CardTitle>
                                    <CardDescription className="mt-1 max-w-2xl">
                                        Search for a student, choose a term, and review their full
                                        period-by-period schedule.
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_220px_auto]">
                        <div className="relative" ref={studentDropdownRef}>
                            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder={
                                    selectedStudent
                                        ? `Selected: ${selectedStudent.user.name}`
                                        : studentsQuery.isLoading
                                          ? "Searching students..."
                                          : "Search student by name"
                                }
                                value={studentSearch}
                                onChange={(e) => {
                                    setStudentSearch(e.target.value);
                                    setIsStudentDropdownOpen(true);

                                    if (selectedStudentId) {
                                        setSelectedStudentId("");
                                    }
                                }}
                                onFocus={() => setIsStudentDropdownOpen(true)}
                                disabled={studentsQuery.isError}
                            />

                            {isStudentDropdownOpen && studentSearch.trim().length < 2 && (
                                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
                                    Type 2+ characters to search
                                </div>
                            )}

                            {isStudentDropdownOpen &&
                                studentSearch.trim().length >= 2 &&
                                !studentsQuery.isError && (
                                    <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-md border bg-popover shadow-md">
                                        {studentsQuery.isLoading ? (
                                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                                Searching...
                                            </div>
                                        ) : students.length > 0 ? (
                                            students.map((student) => (
                                                <button
                                                    type="button"
                                                    key={student.userId}
                                                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => {
                                                        setSelectedStudentId(student.userId);
                                                        setStudentSearch(student.user.name);
                                                        setIsStudentDropdownOpen(false);
                                                    }}
                                                >
                                                    <div className="flex flex-col">
                                                        <span>{student.user.name}</span>
                                                        {student.user.email && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {student.user.email}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {selectedStudentId === student.userId && (
                                                        <Check className="h-4 w-4" />
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                                No students found
                                            </div>
                                        )}
                                    </div>
                                )}
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
                                    terms.map((term) => (
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

                        <div className="flex items-center rounded-lg px-3 py-2">
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
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/60 shadow-sm">
                <CardHeader className="border-b bg-gradient-to-r from-muted/40 to-background pb-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <UserRound className="h-5 w-5" />
                                </div>

                                <div>
                                    <CardTitle className="text-lg sm:text-xl">
                                        Student Schedule
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Review the selected student&apos;s class schedule by period.
                                    </CardDescription>
                                </div>
                            </div>

                            {selectedStudentId && selectedTermId !== "all" && (
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    <div className="rounded-full border bg-background px-3 py-1 text-sm font-medium shadow-sm">
                                        {selectedStudent?.user.name ?? "Selected Student"}
                                    </div>

                                    <div className="rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground shadow-sm">
                                        {
                                            terms.find((term) => term.id === selectedTermId)?.termName ??
                                            "Selected Term"
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {!selectedStudentId ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-12 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                <UserRound className="h-6 w-6" />
                            </div>
                            <p className="text-base font-medium">No student selected</p>
                            <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                Search for a student above to view and manage their schedule.
                            </p>
                        </div>
                    ) : selectedTermId === "all" ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-12 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                <Search className="h-6 w-6" />
                            </div>
                            <p className="text-base font-medium">Term required</p>
                            <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                Choose a term or enable the active term filter to display the student&apos;s schedule.
                            </p>
                        </div>
                    ) : scheduleTable.refineCore?.tableQuery?.isLoading ? (
                        <div className="space-y-4 px-6 py-6">
                            <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
                            <div className="space-y-3">
                                {[...Array(6)].map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-14 animate-pulse rounded-xl border bg-muted/40"
                                    />
                                ))}
                            </div>
                        </div>
                    ) : scheduleTable.refineCore?.tableQuery?.isError ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-12 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                                <Search className="h-6 w-6" />
                            </div>
                            <p className="text-base font-medium">Unable to load schedule</p>
                            <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                Something went wrong while loading this student&apos;s schedule.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 p-4 sm:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-medium text-foreground">
                                        Schedule Overview
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Period-by-period classes, room assignments, and actions.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <div className="rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium">
                                        {scheduleRowCount} period{scheduleRowCount === 1 ? "" : "s"}
                                    </div>
                                    {useActiveTerm && (
                                        <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                            Active Term
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                                <DataTable table={scheduleTable} hidePagination={true}/>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentEnrollmentManager;