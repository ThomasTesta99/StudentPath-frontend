import { TeacherSectionDetail } from "@/types";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  BookOpen,
  CalendarRange,
  Clock3,
  DoorOpen,
  GraduationCap,
  UserRound,
  Users,
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import { DetailRow } from "@/lib/utilsTsx";
import Roster from "./Roster";

const ClassOverview = ({ section }: { section: TeacherSectionDetail }) => {
  const { course, teacher, term, period, roomNumber, studentCount, sectionLabel, capacity } = section;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="px-3 py-1 text-sm">{course.code}</Badge>
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  {sectionLabel}
                </Badge>
              </div>

              <div>
                <CardTitle className="text-3xl">{course.name}</CardTitle>
                <CardDescription className="mt-2 text-sm">
                  {course.description || "No course description available."}
                </CardDescription>
              </div>
            </div>

            <Card className="min-w-[160px]">
              <CardContent className="flex items-center gap-3 p-4">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-2xl font-bold">{studentCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DetailRow
          icon={<BookOpen className="h-4 w-4" />}
          label="Course Code"
          value={course.code}
        />

        <DetailRow
          icon={<GraduationCap className="h-4 w-4" />}
          label="Grade Level"
          value={course.gradeLevel || "Not set"}
        />

        <DetailRow
          icon={<CalendarRange className="h-4 w-4" />}
          label="Term"
          value={term.termName}
        />

        <DetailRow
          icon={<Clock3 className="h-4 w-4" />}
          label="Period"
          value={
            <>
              Period {period.number}
              <span className="block text-xs font-normal text-muted-foreground">
                {formatTime(period.startTime)} - {formatTime(period.endTime)}
              </span>
            </>
          }
        />

        <DetailRow
          icon={<DoorOpen className="h-4 w-4" />}
          label="Room"
          value={roomNumber || "Not assigned"}
        />

        <DetailRow
          icon={<UserRound className="h-4 w-4" />}
          label="Teacher"
          value={teacher.user.name}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section Summary</CardTitle>
          <CardDescription>
            Key information about this class section.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Section</p>
            <p className="mt-1 text-lg font-semibold">{sectionLabel}</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Enrollment</p>
            <p className="mt-1 text-lg font-semibold">
              {studentCount} / {capacity}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Available Seats</p>
            <p className="mt-1 text-lg font-semibold">
              {Math.max(capacity - studentCount, 0)}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Roster section={section} />
    </div>
  );
};

export default ClassOverview;