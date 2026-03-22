import React, { useMemo } from "react";
import { CreateButton } from "../refine-ui/buttons/create";
import { useGo, useList } from "@refinedev/core";
import { Assignment, ASSIGNMENT_TYPE } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { ClipboardList, ChevronRight } from "lucide-react";
import { formatAssignmentType } from "@/lib/utils";

const AssignmentsList = ({ sectionId }: { sectionId: string }) => {
  const go = useGo();

  const { query: assignmentsQuery } = useList<Assignment>({
    resource: "assignments",
    meta: { path: `teacher/sections/${sectionId}/assignments` },
    pagination: {
      mode: "off",
    },
  });

  const assignments = useMemo(() => {
    return assignmentsQuery?.data?.data ?? [];
  }, [assignmentsQuery?.data?.data]);

  const groupedAssignments = useMemo(() => {
    return ASSIGNMENT_TYPE.map((type) => ({
      type,
      items: assignments.filter((assignment) => assignment.type === type),
    }));
  }, [assignments]);

  if (assignmentsQuery.isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading assignments...
      </p>
    );
  }

  if (assignmentsQuery.isError) {
    return (
      <p className="text-sm text-muted-foreground">
        Failed to load assignments.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Assignments</h2>
          <p className="text-sm text-muted-foreground">
            Browse assignments by category or create a new one.
          </p>
        </div>

        <CreateButton
          resource="assignments"
          meta={{ query: { sectionId } }}
        >
          Create Assignment
        </CreateButton>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4">
        {groupedAssignments.map(({ type, items }) => (
          <Card key={type} className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <ClipboardList className="h-5 w-5" />
                </div>

                <div>
                  <CardTitle className="text-base">
                    {formatAssignmentType(type)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {items.length} {items.length === 1 ? "assignment" : "assignments"}
                  </p>
                </div>
              </div>

            </CardHeader>

            <CardContent>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No {formatAssignmentType(type).toLowerCase()} assignments yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map((assignment) => (
                    <button
                      key={assignment.id}
                      type="button"
                      onClick={() =>
                        go({
                          to: {
                            resource: "assignments",
                            action: "show",
                            id: assignment.id,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-border/60 p-3 text-left transition-all hover:bg-muted/40 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium leading-none">
                            {assignment.title}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {assignment.pointsPossible !== undefined &&
                              assignment.pointsPossible !== null && (
                                <span>{assignment.pointsPossible} pts</span>
                              )}

                            {assignment.dueDate && (
                              <span>
                                Due{" "}
                                {new Date(assignment.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {assignment.description && (
                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                              {assignment.description}
                            </p>
                          )}
                        </div>

                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssignmentsList;