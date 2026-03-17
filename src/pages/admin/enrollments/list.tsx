import CourseEnrollmentManager from '@/components/CourseEnrollmentManager';
import EnrollmentTabs, { EnrollmentTab } from '@/components/EnrollmentTabs';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { ListView } from '@/components/refine-ui/views/list-view';
import StudentEnrollmentManager from '@/components/StudentEnrollmentManager';
import { Separator } from '@/components/ui/separator';
import React, { useState } from 'react'


const EnrollmentsList = () => {
    const [activeTab, setActiveTab] = useState<EnrollmentTab>("course");
    
    return (
        <ListView>
            <Breadcrumb />
            <h1 className='page-title'>Enrollment Management</h1>
            <div className="intro-row">
                <p>Manage enrollments for students and courses.</p>
            </div>

            <Separator />

            
            <div className="space-y-6 p-6 w-full flex items-center gap-6 justify-center">
                <EnrollmentTabs activeTab={activeTab} onChange={setActiveTab} />
            </div>

            {activeTab === "course" ? (
                <CourseEnrollmentManager />
            ): (
                <StudentEnrollmentManager />
            )}
        </ListView>
    )
}

export default EnrollmentsList;
