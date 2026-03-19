import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useList } from "@refinedev/core";
import React, { useMemo } from "react";
import {
  BookOpen,
  CalendarRange,
  GraduationCap,
  Users,
} from "lucide-react";
import { Class, TermDetails } from "@/types";
import ClassCard from "@/components/teacher/ClassCard";

const TeacherDashboard = () => {
  const { query: termsQuery } = useList<TermDetails>({
    resource: "terms",
    pagination: {
      mode: "off",
    },
    meta: {
      path: "teacher/terms",
    },
  });

  const terms = useMemo(() => {
    return termsQuery?.data?.data ?? [];
  }, [termsQuery?.data?.data]);

  const activeTerm = useMemo(() => {
    return terms.find((term) => term.isActive) ?? null;
  }, [terms]);

  const classFilters = useMemo(() => {
    if (!activeTerm) return [];
    return [
      {
        field: "termId",
        operator: "eq" as const,
        value: activeTerm.id,
      },
    ];
  }, [activeTerm]);

  const { query: classesQuery } = useList<Class>({
    resource: "classes",
    filters: classFilters,
    queryOptions: {
      enabled: !!activeTerm,
    },
    pagination: {
      mode: "off",
    },
    meta: {
      path: "teacher/sections",
    },
  });

  const classes = useMemo(() => {
    return classesQuery?.data?.data ?? [];
  }, [classesQuery?.data?.data]);

  const totalStudents = useMemo(() => {
    return classes.reduce((sum, item) => sum + (item.studentCount ?? 0), 0);
  }, [classes]);

  const isLoading = termsQuery.isLoading || (!!activeTerm && classesQuery.isLoading);
  const isError = termsQuery.isError || (!!activeTerm && classesQuery.isError);

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            View your classes, student rosters, and teaching workspace for the active term.
          </p>
        </div>

        <Card className="w-full max-w-sm border-border/70">
          <CardContent className="flex items-center gap-3 p-4">
            <CalendarRange className="h-5 w-5 text-primary" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Active Term</p>
              <p className="truncate text-sm text-muted-foreground">
                {termsQuery.isLoading
                  ? "Loading active term..."
                  : activeTerm
                    ? activeTerm.termName
                    : "No active term found"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Your Classes</CardDescription>
            <CardTitle className="text-3xl">{classes.length}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>
              {activeTerm
                ? `Assigned in ${activeTerm.termName}`
                : "No active term available"}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-3xl">{totalStudents}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Combined enrollment for the active term</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Term Status</CardDescription>
            <CardTitle className="text-3xl">
              {activeTerm ? "Active" : "Unavailable"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarRange className="h-4 w-4" />
            <span>
              {activeTerm
                ? "Only active term classes are shown"
                : "Set an active term to view classes"}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
          <CardDescription>
            {activeTerm
              ? `Classes assigned to you for ${activeTerm.termName}.`
              : "Classes will appear here once an active term is available."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-xl border p-4 animate-pulse"
                >
                  <div className="h-5 w-2/3 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-9 w-full rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
              <h3 className="font-semibold">Unable to load dashboard</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                There was a problem loading your active term or classes. Try refreshing the page.
              </p>
            </div>
          ) : !activeTerm ? (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <CalendarRange className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No active term found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your dashboard only shows classes for the active term. Ask an administrator to mark a term as active.
              </p>
            </div>
          ) : classes.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <GraduationCap className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No classes found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You do not have any assigned classes for {activeTerm.termName}.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {classes.map((item) => (
                <ClassCard key={item.id} classDetails={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;