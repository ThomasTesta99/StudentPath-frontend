import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { ShowView } from '@/components/refine-ui/views/show-view';
import Tabs from '@/components/Tabs';
import AssignmentsList from '@/components/teacher/AssignmentsList';
import Attendance from '@/components/teacher/Attendance';
import ClassOverview from '@/components/teacher/ClassOverview';
import Gradebook from '@/components/teacher/Gradebook';
import { TeacherSectionDetail } from '@/types';
import { useShow } from '@refinedev/core';
import React, { useState } from 'react'
import { useParams } from 'react-router'

type TeacherTab = "overview" | "assignments" | "attendance" | "gradebook";

const teacherTabs: {key: TeacherTab; label: string}[] = [
    {key: "overview", label: "Overview"},
    {key: "gradebook", label: "Gradebook"}, 
    {key: "assignments", label: "Assignments"},
    {key: "attendance", label: "Attendance"}, 
]

const ShowCourseSection = () => {
    const {id} = useParams();
    const [activeTab, setactiveTab] = useState<TeacherTab>("overview");

    const {query: sectionQuery} = useShow<TeacherSectionDetail>({
        resource: "classes", 
        id: id, 
        meta: {path: "teacher/sections"}
    })

    const section = sectionQuery.data?.data;

    if(sectionQuery.isLoading || sectionQuery.isError || !section){
        return (
            <ShowView>
                <Breadcrumb />
                <p className="text-sm text-muted-foreground">
                {sectionQuery.isLoading
                    ? "Loading class details..."
                    : sectionQuery.isError
                    ? "Failed to load class details."
                    : "Class details not found."}
                </p>
            </ShowView>
        )
    }
    
    return (
        <ShowView className='class-view'>
            <Breadcrumb />
            <h1 className="page-title">Class Overview</h1>

            <div className="w-full flex justify-center">
                <Tabs tabs={teacherTabs} activeTab={activeTab} onChange={setactiveTab} />
            </div>

            {activeTab === "overview" ? (
                <ClassOverview section={section}/>
            ) : activeTab === "gradebook" ? (
                <Gradebook />
            ) : activeTab === "assignments" ? (
                <AssignmentsList />
            ) : activeTab === "attendance" ? (
                <Attendance />
            ) : <></>} 
        </ShowView>
    )
}

export default ShowCourseSection
