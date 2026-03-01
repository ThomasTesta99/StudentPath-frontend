import { ParentInviteResult, StudentSearchResult } from '@/types';
import { HttpError, useCreate, useList, useNotification } from '@refinedev/core';
import React, { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { formatDate } from '@/lib/utils';

function useDebouncedValue<T>(value: T, delay = 300){
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

const ConnectStudent = ({parentEmail} : {parentEmail: string}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [inviteResults, setInviteResults] = useState<ParentInviteResult[]>([]);
    const [selectedStudentMap, setSelectedStudentMap] = useState<Record<string, StudentSearchResult>>({});
    const debouncedSearch = useDebouncedValue(search, 300);
    const {open: notify} = useNotification();

    const {
        mutateAsync: createInvite, 
        mutation: {isPending: isInviting}
    } = useCreate<ParentInviteResult>();

    const {result, query: {isLoading: studentsLoading}} = useList<StudentSearchResult>({
        resource: "students", 
        pagination: {
            currentPage: 1, 
            pageSize: 10, 
        }, 
        filters: [
            {field: "search", operator: "contains", value: debouncedSearch},
        ],
        queryOptions: {
            enabled: open, 
        }
    });

    const students = result?.data ?? [];

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

    const handleSendInvites = async () => {
        if(selectedStudentIds.length === 0){
            notify?.({
                type: "error", 
                message: "Please select at least one student", 
            });
            return;
        }

        try {
            const createdInvites: ParentInviteResult[] = [];

            for(const studentId of selectedStudentIds){
                const response = await createInvite({
                    resource: "parents", 
                    values: {
                        studentId, 
                        parentEmail, 
                    }, 
                    meta: {
                        path: "admin/parents/invite", 
                    }, 
                    successNotification: false, 
                    errorNotification: false, 
                });

                if(response.data){
                    createdInvites.push(response.data);
                }

            }
            setInviteResults(createdInvites);

            notify?.({
                type: "success", 
                message: 
                    createdInvites.length === 1
                        ? "Invite created successfully" 
                        : `${createdInvites.length} invites created successfully.`
            });
        } catch (error) {
            const err = error as HttpError;
            notify?.({
                type: "error",
                message: err.message ?? "Failed to create invite"
            })
        }
    }

    const resetDialog = () => {
        setSearch("");
        setSelectedStudentIds([]);
        setInviteResults([]);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if(!next) resetDialog();
            }}
            
        >
            <DialogTrigger>
                <Button>Connect Student</Button>
            </DialogTrigger>

            <DialogContent className='max-w-3xl [&>button]:cursor-pointer'>
                <DialogHeader>
                    <DialogTitle>Connect Student</DialogTitle>
                    <DialogDescription>
                        Search for one or more students and send an invite to{" "}
                        <span className="font-medium">{parentEmail}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Input
                        placeholder='Search students...'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="rounded-md border max-h-80 overflow-y-auto divide-y">
                        {studentsLoading ? (
                            <div className="p-4 text-sm text-muted-foreground">
                                Loading Students...
                            </div>
                        ): students.length === 0 ? (
                            <div className="p-4 text-muted-foreground">
                                No Students found.
                            </div>
                        ): (
                            students.map((student) => (
                                <div key={student.userId} className='flex items-start justify-between p-4'>
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            checked={selectedStudentIds.includes(student.userId)}
                                            onCheckedChange={() => toggleStudent(student.userId)}
                                        />
                                        <div className="space-y-1">
                                            <p className="font-medium">{student.user.name}</p>
                                            <p className="text-sm text-muted-foreground">{student.user.email}</p>
                                            <p className="text-xs text-muted-foreground">Student Id: {student.userId}</p>
                                            <p className="text-xs text-muted-foreground">Grade: {student.gradeLevel}</p>
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
                            onClick={handleSendInvites}
                            disabled={isInviting || selectedStudentIds.length === 0}
                        >
                            {isInviting ? "Sending..." : `Send ${selectedStudentIds.length === 1 ? "Invite" : "Invites"}`}
                        </Button>
                    </div>

                    {inviteResults.length > 0 && (
                        <div className="space-y-3">
                            <p className="font-medium">Dev Invite Tokens</p>

                            {inviteResults.map((invite) => (
                                <Card key={invite.inviteId}>
                                    <CardContent className='pt-6 space-y-2 overflow-x-hidden'>
                                        <p>
                                            <span className="font-medium">Student ID: </span>{" "}
                                            {invite.studentId}
                                        </p>
                                        <p>
                                            <span className="font-medium">Parent Email: </span>{" "}
                                            {invite.parentEmail}
                                        </p>
                                        <div className="space-y-1">
                                            <p className="font-medium">Token:</p>
                                            <div className="rounded-md border bg-muted px-3 py-2 font-mono text-xs break-all">
                                                {invite.token}
                                            </div>
                                        </div>
                                        <p>
                                            <span className="font-medium">Expires: </span>{" "}
                                            {formatDate(invite.expiresAt)}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ConnectStudent
