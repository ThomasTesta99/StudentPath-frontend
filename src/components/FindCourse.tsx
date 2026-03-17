import React, { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { useDebouncedValue } from "@/lib/utilsTsx";
import {
    HttpError,
    useCreate,
    useInvalidate,
    useList,
    useNotification,
} from "@refinedev/core";
import { CreateEnrollment, SectionSearchResult } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const FindCourse = ({
    studentId,
    periodId,
}: {
    studentId: string;
    periodId: string;
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedSectionId, setSelectedSectionId] = useState("");
    const debouncedSearch = useDebouncedValue(search, 300);
    const { open: notify } = useNotification();
    const invalidate = useInvalidate();

    const {
        mutateAsync: enrollStudent,
        mutation: { isPending: isEnrolling },
    } = useCreate<CreateEnrollment>();

    const { result, query } = useList<SectionSearchResult>({
        resource: "sections",
        pagination: {
            currentPage: 1,
            pageSize: 10,
        },
        meta: {
            path: "admin/sections",
        },
        filters: [
            { field: "search", operator: "contains", value: debouncedSearch.trim() },
            { field: "periodId", operator: "eq", value: periodId },
        ],
        queryOptions: {
            enabled: open && debouncedSearch.trim().length >= 2,
        },
    });

    const sections = useMemo(() => {
        return result.data ?? [];
    }, [result.data]);

    const sectionsLoading = query.isLoading;

    const resetDialog = () => {
        setSearch("");
        setSelectedSectionId("");
    };

    const handleSubmit = async () => {
        if (!selectedSectionId) {
            notify?.({
                type: "error",
                message: "Please select a course",
            });
            return;
        }

        try {
            await enrollStudent({
                resource: "enrollments",
                meta: { path: "admin/enrollments" },
                values: {
                    sectionId: selectedSectionId,
                    studentId,
                },
                successNotification: false,
                errorNotification: false,
            });

            notify?.({
                type: "success",
                message: "Student enrolled successfully.",
            });

            setOpen(false);
            resetDialog();

            const enrolledSectionId = selectedSectionId;

            setOpen(false);
            resetDialog();

            await Promise.all([
                invalidate({
                    resource: "enrollments",
                    invalidates: ["list"],
                }),
                invalidate({
                    resource: "sections",
                    invalidates: ["list"],
                }),
                invalidate({
                    resource: `admin/enrollments/${enrolledSectionId}/roster`,
                    invalidates: ["list"],
                }),
            ]);
        } catch (error) {
            const err = error as HttpError;
            notify?.({
                type: "error",
                message: `An error occurred creating enrollment: ${err.message}`,
            });
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) resetDialog();
            }}
        >
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    Find Course
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg [&>button]:cursor-pointer">
                <DialogHeader>
                    <DialogTitle>Find Course</DialogTitle>
                    <DialogDescription>
                        Search for a course in this period and enroll the student.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Input
                        placeholder="Search courses..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setSelectedSectionId("");
                        }}
                    />

                    {search.trim().length < 2 ? (
                        <div className="rounded-md border p-4 text-sm text-muted-foreground">
                            Type at least 2 characters to search.
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto rounded-md border divide-y">
                            {sectionsLoading ? (
                                <div className="p-4 text-sm text-muted-foreground">
                                    Loading sections...
                                </div>
                            ) : sections.length === 0 ? (
                                <div className="p-4 text-sm text-muted-foreground">
                                    No sections found.
                                </div>
                            ) : (
                                sections.map((section) => {
                                    const isSelected = selectedSectionId === section.id;

                                    return (
                                        <button
                                            key={section.id}
                                            type="button"
                                            className={cn(
                                                "flex w-full items-start justify-between p-4 text-left hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                                isSelected && "bg-accent"
                                            )}
                                            onClick={() => setSelectedSectionId(section.id)}
                                        >
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {section.course?.name ?? "Unnamed Course"}
                                                </p>
                                                <div className="text-sm text-muted-foreground">
                                                    <p>Code: {section.course?.code ?? "—"}</p>
                                                    <p>Room: {section.roomNumber ?? "—"}</p>
                                                    <p>
                                                        Teacher: {section.teacher?.name ?? "Unassigned"}
                                                    </p>
                                                </div>
                                            </div>

                                            {isSelected && <Check className="h-4 w-4 shrink-0" />}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isEnrolling}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isEnrolling || !selectedSectionId}>
                        {isEnrolling ? "Enrolling..." : "Enroll"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FindCourse;