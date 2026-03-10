import { BACKEND_BASE_URL } from '@/constants'
import { GetOneResponse, GRADE_LEVELS, GradeLevel, School } from '@/types'
import { useCustom, useNotification, useUpdate } from '@refinedev/core'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { School as SchoolIcon } from 'lucide-react'
import { Separator } from './ui/separator'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'

const SchoolInformation = () => {
    const { open } = useNotification();
    const [selectedGradeLevels, setSelectedGradeLevels] = useState<GradeLevel[]>([]);
    const {query: schoolQuery} = useCustom<GetOneResponse<School>>({
        url: `${BACKEND_BASE_URL}/admin/schools/me`, 
        method: "get", 
    });

    const school = schoolQuery.data?.data.data;
    const { mutate: updateSchool, mutation: updatingGradeLevels } = useUpdate();
    
    const handleSaveGradeLevels = async () => {
        updateSchool(
            {
                resource: "schools",
                id: "me",
                values: {
                    gradeLevels: selectedGradeLevels,
                },
                meta: {path: "admin/schools"}
            },
            {
                onSuccess: async () => {
                    await schoolQuery.refetch();
                    open?.({
                        type: "success",
                        message: "School updated",
                        description: "Grade levels were updated successfully.",
                    });
                },
                onError: (error) => {
                    open?.({
                        type: "error",
                        message: "Update failed",
                        description: error?.message || "Could not update grade levels.",
                    });
                },
            }
        );
    };

    const handleGradeLevelToggle = (grade: GradeLevel) => {
        setSelectedGradeLevels((prev) =>
            prev.includes(grade)
                ? prev.filter((g) => g !== grade)
                : [...prev, grade].sort((a, b) => Number(a) - Number(b))
        );
    };

    useEffect(() => {
        setSelectedGradeLevels(school?.gradeLevels ?? []);
    }, [school?.gradeLevels]);

    if(schoolQuery.isLoading || schoolQuery.isError || !school){
        return (
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SchoolIcon />
                        School Information
                    </CardTitle>
                    <CardDescription>
                        View your school details and manage supported grade levels.
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <p className="text-sm text-muted-foreground">
                        {schoolQuery.isLoading
                            ? 'Loading school details...'
                            : schoolQuery.isError
                            ? 'Failed to load school details.'
                            : 'School details not found.'}
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <SchoolIcon />
                    School Information
                </CardTitle>
                <CardDescription>
                    View your school details and manage supported grade levels.
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
                <div className="space-y-2">
                    <div>
                        <p className="font-semibold">School Name</p>
                        <p className="text-sm text-muted-foreground">{school.schoolName}</p>
                    </div>

                    <div>
                        <p className="font-semibold">Grade Levels</p>
                        <p className="text-sm text-muted-foreground">
                            {school.gradeLevels?.length
                                ? school.gradeLevels.join(", ")
                                : "No grade levels assigned"}
                        </p>
                    </div>
                </div>
                <Separator />

                <div className="space-y-3">
                    <p className="text-sm font-medium">Manage Grade Levels</p>

                    <div className="grid grid-cols-2 gap-3">
                        {GRADE_LEVELS.map((grade) => (
                            <label
                                key={grade}
                                className="flex items-center gap-2 rounded-md border p-3 cursor-pointer"
                            >
                                <Checkbox
                                    checked={selectedGradeLevels.includes(grade)}
                                    onCheckedChange={() => handleGradeLevelToggle(grade)}
                                    className='cursor-pointer'
                                />
                                <span className="text-sm">Grade {grade}</span>
                            </label>
                        ))}
                    </div>

                    <Button
                        onClick={handleSaveGradeLevels}
                        disabled={updatingGradeLevels.isPending}
                        className="w-full"
                    >
                        Save Grade Levels
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default SchoolInformation
