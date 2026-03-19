import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'
import { BookOpen, ChevronRight, Clock3, DoorOpen, Users } from 'lucide-react'
import { ShowButton } from '../refine-ui/buttons/show'
import { Class } from '@/types'

const ClassCard = ({classDetails} : {classDetails : Class}) => {
    const formatPeriodTime = (startTime?: string, endTime?: string) => {
        if (!startTime || !endTime) return "Time unavailable";
        return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
    };
    return (
        <Card
            className="flex h-full flex-col justify-between border-border/70"
        >
            <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle className="text-xl">{classDetails.course.name}</CardTitle>
                        <CardDescription>
                            {classDetails.sectionLabel || "Section"} • {classDetails.term.termName}
                        </CardDescription>
                    </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>
                            {classDetails.course.gradeLevel
                            ? `Grade ${classDetails.course.gradeLevel}`
                            : "Grade not set"}
                    </span>
                    </div>

                    <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4" />
                    <span>
                        Period {classDetails.period.number} •{" "}
                        {formatPeriodTime(classDetails.period.startTime, classDetails.period.endTime)}
                    </span>
                    </div>

                    <div className="flex items-center gap-2">
                    <DoorOpen className="h-4 w-4" />
                    <span>
                        {classDetails.roomNumber ? `Room ${classDetails.roomNumber}` : "Room not assigned"}
                    </span>
                    </div>

                    <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{classDetails.studentCount ?? 0} students enrolled</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <ShowButton
                    className="w-full"
                    resource="classes"
                    recordItemId={classDetails.id}
                >
                    Open Class
                    <ChevronRight className="ml-2 h-4 w-4" />
                </ShowButton>
            </CardContent>
        </Card>
    )
}

export default ClassCard
