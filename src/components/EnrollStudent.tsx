import React from "react";
import { useCreate, useInvalidate, useNotification } from "@refinedev/core";
import { CreateEnrollment, StudentEnrollmentResult } from "@/types";
import StudentSelectDialog from "./StudentDialog";

const EnrollStudent = ({ sectionId }: { sectionId: string}) => {
    const { open: notify } = useNotification();
    const invalidate = useInvalidate();
    
    const {
        mutateAsync: enrollStudent,
        mutation: { isPending: isEnrolling },
    } = useCreate<CreateEnrollment>();

    const handleEnrollStudents = async (selectedStudentIds: string[]) => {
        const createdEnrollments: StudentEnrollmentResult[] = [];
        let failedCount = 0;

        for (const studentId of selectedStudentIds) {
            try {
                const response = await enrollStudent({
                    resource: "enrollments",
                    meta: {
                        path: "admin/enrollments", 
                    }, 
                    values: {
                        sectionId,
                        studentId,
                    },
                    successNotification: false,
                    errorNotification: false,
                });

                if (response.data) {
                    createdEnrollments.push(response.data);
                }
            } catch {
                failedCount += 1;
            }
        }

        notify?.({
            type: failedCount > 0 ? "error" : "success",
            message:
                failedCount > 0
                    ? `${createdEnrollments.length} students enrolled, ${failedCount} failed.`
                    : createdEnrollments.length === 1
                    ? "Student successfully enrolled"
                    : `${createdEnrollments.length} students enrolled successfully.`,
        });
        await invalidate({
            resource: `admin/enrollments/${sectionId}/roster`,
            invalidates: ["list"],
        });
    };

    return (
        <StudentSelectDialog
            triggerLabel="Enroll Students"
            title="Enroll Students"
            description="Search for one or more students to enroll them in this course."
            submitLabel={(count) => `Enroll ${count === 1 ? "Student" : "Students"}`}
            submittingLabel="Enrolling..."
            isSubmitting={isEnrolling}
            onSubmit={handleEnrollStudents}
        />
    );
};

export default EnrollStudent;