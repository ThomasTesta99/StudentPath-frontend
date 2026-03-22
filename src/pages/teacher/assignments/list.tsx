import { CreateButton } from '@/components/refine-ui/buttons/create'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TeacherCourseRow } from '@/types'
import { useList } from '@refinedev/core'
import React, { useMemo } from 'react'

const AssignmentsList = () => {

    const {query: coursesQuery} = useList<TeacherCourseRow>({
        resource: "classes", 
        meta: {path: "teacher/courses"}, 
    })

    const courses = useMemo(() => {
        return coursesQuery?.data?.data ?? [];
    }, [coursesQuery?.data?.data])

    return (
        <div className='grid grid-cols-3 gap-4'>
            {courses.map((course) => (
                <Card>
                    <CardHeader>
                        <CardTitle>{course.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CreateButton resource='assignments' meta={{query: {courseId: course.id}}}/>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default AssignmentsList
