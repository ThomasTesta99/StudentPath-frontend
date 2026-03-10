import { EditView, EditViewHeader } from '@/components/refine-ui/views/edit-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { BACKEND_BASE_URL } from '@/constants';
import { editCourseSchema } from '@/lib/schema';
import { Department, GradeLevel } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { HttpError, useCustom, useList, useNotification } from '@refinedev/core';
import { useForm } from '@refinedev/react-hook-form';
import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import z from 'zod';

const EditCourse = () => {
    const { id } = useParams();
    const { open } = useNotification();

    const form = useForm({
        resolver: zodResolver(editCourseSchema),
        refineCoreProps: {
            resource: 'courses',
            action: 'edit',
            id,
            meta: { path: 'admin/courses' },
        },
        defaultValues: {
            name: '',
            courseNumber: '',
            gradeLevel: '',
            departmentId: '',
            description: '',
            code: '',
        },
    });

    const {
        refineCore: { onFinish, query },
        control,
        watch,
        handleSubmit,
        formState: { isSubmitting, dirtyFields, isDirty },
        reset,
    } = form;

    const { query: departmentsQuery } = useList<Department>({
        resource: 'departments',
        pagination: { mode: 'off' },
    });

    const { query: gradeLevelsQuery } = useCustom<{ data: GradeLevel[] }>({
        url: `${BACKEND_BASE_URL}/admin/schools/me/grade-levels`,
        method: 'get',
    });

    const gradeLevels = gradeLevelsQuery?.data?.data?.data;

    const selectedDepartmentId = watch('departmentId');
    const courseNumber = watch('courseNumber');

    const selectedDepartment = useMemo(() => {
        return departmentsQuery.data?.data?.find((d) => d.id === selectedDepartmentId);
    }, [departmentsQuery.data?.data, selectedDepartmentId]);

    const selectedDepartmentCode = selectedDepartment?.code ?? '';

    const generatedCode =
        selectedDepartmentCode && courseNumber
            ? `${selectedDepartmentCode} ${courseNumber}`
            : selectedDepartmentCode || '';

    useEffect(() => {
        const course = query?.data?.data;
        if (!course || isDirty) return;

        reset({
            name: course.name ?? '',
            courseNumber: course.code?.split(' ')?.slice(1).join(' ') ?? '',
            gradeLevel: course.gradeLevel ?? '',
            departmentId: course.departmentId ?? '',
            description: course.description ?? '',
            code: course.code ?? '',
        });
    }, [query?.data?.data, reset, isDirty]);

    const onSubmit = async (values: z.infer<typeof editCourseSchema>) => {
        const changedValues: Partial<z.infer<typeof editCourseSchema>> = {};

        if (dirtyFields.name) changedValues.name = values.name;
        if (dirtyFields.gradeLevel) changedValues.gradeLevel = values.gradeLevel;
        if (dirtyFields.departmentId) changedValues.departmentId = values.departmentId;
        if (dirtyFields.description) changedValues.description = values.description;
        if (dirtyFields.courseNumber) changedValues.courseNumber = values.courseNumber;

        if (dirtyFields.departmentId || dirtyFields.courseNumber) {
            const deptCode = departmentsQuery.data?.data
                ?.find((d) => d.id === values.departmentId)
                ?.code?.trim();

            if (!deptCode) {
                open?.({
                    type: 'error',
                    message: 'Selected department is missing a valid code.',
                });
                return;
            }

            changedValues.code = `${deptCode} ${values.courseNumber}`;
        }

        delete changedValues.courseNumber;

        if (Object.keys(changedValues).length === 0) {
            open?.({
                type: 'error',
                message: 'No changes to save',
            });
            return;
        }

        try {
            await onFinish(changedValues);
        } catch (error) {
            const err = error as HttpError;
            open?.({
                type: 'error',
                message: 'There was an error editing the course: ' + err.message,
            });
        }
    };

    return (
        <EditView>
            <EditViewHeader resource="courses" title="Edit Course" />
            <Separator />

            <div className="my-4 flex items-center">
                <Card className="class-form-card">
                    <CardHeader className="relative z-10">
                        <CardTitle className="text-2xl pb-0 font-bold">Update Course Info</CardTitle>
                    </CardHeader>

                    <Separator />

                    <CardContent className="mt-7">
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
                                <FormField
                                    control={control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Course Name <span className="text-red-400">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Data Structures and Algorithms" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <FormField
                                        control={control}
                                        name="departmentId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Department <span className="text-red-400">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger className="cursor-pointer w-full">
                                                            <SelectValue placeholder="Select Department" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {departmentsQuery.isLoading && (
                                                                <SelectItem value="loading" disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            )}

                                                            {departmentsQuery.isError && (
                                                                <SelectItem value="error" disabled>
                                                                    Failed to load departments
                                                                </SelectItem>
                                                            )}

                                                            {!departmentsQuery.isLoading &&
                                                                !departmentsQuery.isError &&
                                                                departmentsQuery.data?.data?.map((department) => (
                                                                    <SelectItem
                                                                        key={department.id}
                                                                        value={department.id}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        {department.name}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="courseNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Course Number <span className="text-red-400">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="326" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="gradeLevel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Grade Level <span className="text-red-400">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger className="cursor-pointer w-full">
                                                            <SelectValue placeholder="Select Grade Level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {gradeLevelsQuery.isLoading && (
                                                                <SelectItem value="loading" disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            )}

                                                            {gradeLevelsQuery.isError && (
                                                                <SelectItem value="error" disabled>
                                                                    Failed to load grade levels
                                                                </SelectItem>
                                                            )}

                                                            {!gradeLevelsQuery.isLoading &&
                                                                !gradeLevelsQuery.isError &&
                                                                gradeLevels?.map((gradeLevel) => (
                                                                    <SelectItem
                                                                        key={gradeLevel}
                                                                        value={gradeLevel}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        {gradeLevel}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="w-full space-y-2">
                                    <FormLabel>Course Code</FormLabel>
                                    <Input
                                        disabled
                                        value={generatedCode}
                                        placeholder="Auto-generated from department and course number"
                                    />
                                </div>

                                <FormField
                                    control={control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Description <span className="text-red-400">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Type your description here..."
                                                    className="min-h-[140px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </EditView>
    );
};

export default EditCourse;