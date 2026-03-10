import { useCustomMutation, useInvalidate, useNotification } from '@refinedev/core';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { BACKEND_BASE_URL } from '@/constants';

const UnenrollStudent = ({
    sectionId,
    studentId, 
}: {
    sectionId?: string;
    studentId: string;
}) => {
    const invalidate = useInvalidate();
    const [open, setOpen] = useState(false);
    const { open: notify } = useNotification();
    const { mutateAsync: unEnrollStudent, mutation } = useCustomMutation();

    const isUnenrolling = mutation.isPending;

    const handleUnenroll = async () => {
        if (!sectionId) return;

        try {
            await unEnrollStudent({
                url: `${BACKEND_BASE_URL}/admin/enrollments/${sectionId}/${studentId}`,
                method: 'delete',
                values: {},
                successNotification: false,
                errorNotification: false,
            });

            notify?.({
                type: 'success',
                message: 'Student unenrolled successfully.'
            });

            setOpen(false);
            await invalidate({
                resource: `admin/enrollments/${sectionId}/roster`,
                invalidates: ["list"],
            });
        } catch {
            notify?.({
                type: 'error',
                message: 'Failed to unenroll student',
            });
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
            }}
        >
            <DialogTrigger asChild>
                <Button variant="destructive">Unenroll</Button>
            </DialogTrigger>

            <DialogContent className="max-w-md [&>button]:cursor-pointer">
                <DialogHeader>
                    <DialogTitle>
                        {sectionId ? 'Unenroll Student' : 'No Course Provided'}
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    {sectionId
                        ? 'Are you sure you want to unenroll this student from the course? This action cannot be undone.'
                        : 'A course ID was not provided, so the student cannot be unenrolled.'}
                </p>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isUnenrolling}
                    >
                        Cancel
                    </Button>

                    {sectionId && (
                        <Button
                            variant="destructive"
                            onClick={handleUnenroll}
                            disabled={isUnenrolling}
                        >
                            {isUnenrolling ? 'Unenrolling...' : 'Confirm'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UnenrollStudent;