import React, { useState } from "react";
import { ParentInviteResult } from "@/types";
import { useCreate, useNotification } from "@refinedev/core";
import { Card, CardContent } from "./ui/card";
import { formatDate } from "@/lib/utils";
import StudentSelectDialog from "./StudentDialog";

const ConnectStudent = ({ parentEmail }: { parentEmail: string }) => {
    const [inviteResults, setInviteResults] = useState<ParentInviteResult[]>([]);
    const { open: notify } = useNotification();

    const {
        mutateAsync: createInvite,
        mutation: { isPending: isInviting },
    } = useCreate<ParentInviteResult>();

    const handleSendInvites = async (selectedStudentIds: string[]) => {
        const createdInvites: ParentInviteResult[] = [];
        let failedCount = 0;

        for (const studentId of selectedStudentIds) {
            try {
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

                if (response.data) {
                    createdInvites.push(response.data);
                }
            } catch {
                failedCount += 1;
            }
        }

        setInviteResults(createdInvites);

        notify?.({
            type: failedCount > 0 ? "error" : "success",
            message:
                failedCount > 0
                    ? `${createdInvites.length} invite(s) created, ${failedCount} failed.`
                    : createdInvites.length === 1
                    ? "Invite created successfully"
                    : `${createdInvites.length} invites created successfully.`,
        });
    };

    return (
        <StudentSelectDialog
            triggerLabel="Connect Student"
            title="Connect Student"
            description={
                <>
                    Search for one or more students and send an invite to{" "}
                    <span className="font-medium">{parentEmail}</span>
                </>
            }
            submitLabel={(count) => `Send ${count === 1 ? "Invite" : "Invites"}`}
            submittingLabel="Sending..."
            isSubmitting={isInviting}
            onSubmit={handleSendInvites}
            afterContent={
                inviteResults.length > 0 && (
                    <div className="space-y-3">
                        <p className="font-medium">Dev Invite Tokens</p>

                        {inviteResults.map((invite) => (
                            <Card key={invite.inviteId}>
                                <CardContent className="pt-6 space-y-2 overflow-x-hidden">
                                    <p>
                                        <span className="font-medium">Student ID: </span>
                                        {invite.studentId}
                                    </p>
                                    <p>
                                        <span className="font-medium">Parent Email: </span>
                                        {invite.parentEmail}
                                    </p>
                                    <div className="space-y-1">
                                        <p className="font-medium">Token:</p>
                                        <div className="rounded-md border bg-muted px-3 py-2 font-mono text-xs break-all">
                                            {invite.token}
                                        </div>
                                    </div>
                                    <p>
                                        <span className="font-medium">Expires: </span>
                                        {formatDate(invite.expiresAt)}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )
            }
        />
    );
};

export default ConnectStudent;