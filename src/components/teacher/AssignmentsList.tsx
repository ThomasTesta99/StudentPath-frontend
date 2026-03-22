import React, { useMemo, useState } from "react";
import { useGo, useList } from "@refinedev/core";
import { ChevronRight, ClipboardList } from "lucide-react";

import { Assignment, Assignment_Type, ASSIGNMENT_TYPE } from "@/types";
import { CreateButton } from "../refine-ui/buttons/create";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useDebouncedValue } from "@/lib/utilsTsx";
import { formatAssignmentType, formatDate } from "@/lib/utils";

const AssignmentsList = ({ sectionId, courseId }: { sectionId: string, courseId: string }) => {
  const go = useGo();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const debouncedSearch = useDebouncedValue(search, 300);
  const isSearchPending = search.trim() !== debouncedSearch.trim();

  const { query: assignmentsQuery } = useList<Assignment>({
    resource: "assignments",
    meta: {
      path: `teacher/sections/${sectionId}/assignments`,
      query: {
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
        ...(status !== "all" ? { status } : {}),
        ...(selectedType !== "all" ? { type: selectedType } : {}),
      },
    },
    pagination: {
      mode: "off",
    },
  });

  const assignments = useMemo(() => {
    return assignmentsQuery?.data?.data ?? [];
  }, [assignmentsQuery?.data?.data]);

  const typesToRender = useMemo(() => {
    return selectedType === "all"
      ? ASSIGNMENT_TYPE
      : [selectedType as Assignment_Type];
  }, [selectedType]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    status !== "all" ||
    selectedType !== "all";

  const groupedAssignments = useMemo(() => {
    const groups = typesToRender.map((type) => ({
      type,
      items: assignments.filter((assignment) => assignment.type === type),
    }));

    return hasActiveFilters
      ? groups.filter((group) => group.items.length > 0)
      : groups;
  }, [typesToRender, assignments, hasActiveFilters]);

  if (assignmentsQuery.isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading assignments...</p>
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Assignments</h2>
          <p className="text-sm text-muted-foreground">
            Browse assignments by category or create a new one.
          </p>
        </div>

        <CreateButton resource="assignments" meta={{ query: { sectionId, courseId } }}>
          Create Assignment
        </CreateButton>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <Input
          placeholder="Search assignments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:max-w-xs"
        />

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="past">Past</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {ASSIGNMENT_TYPE.map((type) => (
              <SelectItem key={type} value={type}>
                {formatAssignmentType(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {isSearchPending || assignmentsQuery.isFetching ? (
        <Card className="border-dashed">
          <CardContent className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Updating results...</p>
              <p className="text-sm text-muted-foreground">
                Filtering assignments...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : groupedAssignments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">No assignments found</p>
              <p className="text-sm text-muted-foreground">
                Try changing your search or filters, or create a new assignment.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
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
                      {items.length}{" "}
                      {items.length === 1 ? "assignment" : "assignments"}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
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
                      className="w-full cursor-pointer rounded-lg border border-border/60 p-3 text-left transition-all hover:border-primary/30 hover:bg-muted/40 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium leading-none">
                            {assignment.title}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {assignment.pointsPossible != null && (
                              <span>{assignment.pointsPossible} pts</span>
                            )}

                            {assignment.dueDate && (
                              <span>
                                Due{" "}
                                {formatDate(assignment.dueDate)}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentsList;