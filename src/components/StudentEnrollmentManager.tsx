import { ShowButton } from "@/components/refine-ui/buttons/show";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { useList } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StudentProfile, StudentScheduleRow, TermDetails } from "@/types";
import { useDebouncedValue } from "@/lib/utilsTsx";
import { Check, Search, UserRound } from "lucide-react";

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
                size: 90,
                cell: ({ row }) => (
                    <span className="font-semibold">
                        {row.original.period?.number
                            ? `Period ${row.original.period.number}`
                            : "—"}
                    </span>
                ),
            },
            {
                id: "code",
                accessorFn: (row) => row.course?.code ?? "",
                header: () => <p className="column-title">Code</p>,
                size: 100,
                cell: ({ row }) => (
                    <span className="text-sm font-medium">
                        {row.original.course?.code ?? "—"}
                    </span>
                ),
            },
            {
                id: "course",
                accessorFn: (row) => row.course?.name ?? "",
                header: () => <p className="column-title">Course Title</p>,
                size: 240,
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <p className="font-medium text-foreground">
                            {row.original.course?.name ?? "Free Period"}
                        </p>
                    </div>
                ),
            },
            {
                id: "teacher",
                accessorFn: (row) => row.teacher?.name ?? "",
                header: () => <p className="column-title">Teacher</p>,
                size: 180,
                cell: ({ row }) => (
                    <span className="text-sm">
                        {row.original.teacher?.name ?? "Unassigned"}
                    </span>
                ),
            },
            {
                id: "room",
                accessorFn: (row) => row.section?.roomNumber ?? "",
                header: () => <p className="column-title">Room</p>,
                size: 100,
                cell: ({ row }) => (
                    <span className="text-sm">{row.original.section?.roomNumber ?? "—"}</span>
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
        ],
        []
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

            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Student Schedule</CardTitle>
                    <CardDescription>
                        Review the selected student's schedule by period.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    {!selectedStudentId ? (
                        <p className="text-sm text-muted-foreground">
                            Search for and select a student to display their schedule.
                        </p>
                    ) : selectedTermId === "all" ? (
                        <p className="text-sm text-muted-foreground">
                            Select a term to display the student's schedule.
                        </p>
                    ) : (
                        <div className="rounded-xl border bg-background">
                            <DataTable table={scheduleTable} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentEnrollmentManager;