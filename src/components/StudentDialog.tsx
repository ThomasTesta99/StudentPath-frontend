import { ReactNode, useEffect, useMemo, useState } from "react";
import { useList, useNotification } from "@refinedev/core";
import { StudentSearchResult } from "@/types";
import { useDebouncedValue } from "@/lib/utilsTsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

type StudentSelectDialogProps = {
    triggerLabel: string;
    title: string;
    description: ReactNode;
    submitLabel: (count: number) => string;
    submittingLabel: string;
    isSubmitting?: boolean;
    onSubmit: (selectedStudentIds: string[]) => Promise<void>;
    afterContent?: ReactNode;
};

const StudentSelectDialog = ({
    triggerLabel,
    title,
    description,
    submitLabel,
    submittingLabel,
    isSubmitting = false,
    onSubmit,
    afterContent,
}: StudentSelectDialogProps) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [selectedStudentMap, setSelectedStudentMap] = useState<Record<string, StudentSearchResult>>({});
    const debouncedSearch = useDebouncedValue(search, 300);
    const { open: notify } = useNotification();

    const { result, query: { isLoading: studentsLoading } } = useList<StudentSearchResult>({
        resource: "students",
        pagination: {
            currentPage: 1,
            pageSize: 10,
        },
        filters: [
            { field: "search", operator: "contains", value: debouncedSearch },
        ],
        queryOptions: {
            enabled: open,
        },
    });

    const students = useMemo(() => {
        return result.data ?? [];
    }, [result.data]);

    useEffect(() => {
        if (students.length === 0) return;

        setSelectedStudentMap((prev) => {
            const next = { ...prev };

            for (const student of students) {
                next[student.userId] = student;
            }

            return next;
        });
    }, [students]);

    const selectedStudents = useMemo(() => {
        return selectedStudentIds
            .map((id) => selectedStudentMap[id])
            .filter(Boolean) as StudentSearchResult[];
    }, [selectedStudentIds, selectedStudentMap]);

    const toggleStudent = (studentId: string) => {
        setSelectedStudentIds((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        );
    };

    const resetDialog = () => {
        setSearch("");
        setSelectedStudentIds([]);
        setSelectedStudentMap({});
    };

    const handleSubmit = async () => {
        if (selectedStudentIds.length === 0) {
            notify?.({
                type: "error",
                message: "Please select at least one student",
            });
            return;
        }

        await onSubmit(selectedStudentIds);
        setOpen(false);
        resetDialog();
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
                <Button>{triggerLabel}</Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl [&>button]:cursor-pointer">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Input
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="rounded-md border max-h-80 overflow-y-auto divide-y">
                        {studentsLoading ? (
                            <div className="p-4 text-sm text-muted-foreground">
                                Loading students...
                            </div>
                        ) : students.length === 0 ? (
                            <div className="p-4 text-muted-foreground">
                                No students found.
                            </div>
                        ) : (
                            students.map((student) => (
                                <div key={student.userId} className="flex items-start justify-between p-4">
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            checked={selectedStudentIds.includes(student.userId)}
                                            onCheckedChange={() => toggleStudent(student.userId)}
                                            className="cursor-pointer"
                                        />
                                        <div className="space-y-1">
                                            <p className="font-medium">{student.user.name}</p>
                                            <p className="text-sm text-muted-foreground">{student.user.email}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Student ID: {student.userId}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Grade: {student.gradeLevel}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {selectedStudents.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Selected Students</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedStudents.map((student) => (
                                    <Badge key={student.userId} variant="secondary">
                                        {student.user.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || selectedStudentIds.length === 0}
                        >
                            {isSubmitting ? submittingLabel : submitLabel(selectedStudentIds.length)}
                        </Button>
                    </div>

                    {afterContent}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default StudentSelectDialog;