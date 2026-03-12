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
import React, { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router';
import z from 'zod';

const EditCourse = () => {
    const { id } = useParams();
    const { open } = useNotification();
    const initializedRef = useRef(false);

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
        formState: { isSubmitting },
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

    const gradeLevels = gradeLevelsQuery?.data?.data?.data ?? [];
    const currentValues = watch();

    const originalValues = useMemo(() => {
        const course = query?.data?.data;

        if (!course) {
            return {
                name: '',
                courseNumber: '',
                gradeLevel: '',
                departmentId: '',
                description: '',
                code: '',
            };
        }

        return {
            name: course.name ?? '',
            courseNumber: course.code?.split(' ')?.slice(1).join(' ') ?? '',
            gradeLevel: String(course.gradeLevel ?? ''),
            departmentId: String(course.departmentId ?? ''),
            description: course.description ?? '',
            code: course.code ?? '',
        };
    }, [query?.data?.data]);

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

    const courseRecord = query?.data?.data;
    const isEditRecordLoading = query?.isLoading;
    const areBaseOptionsLoading = departmentsQuery.isLoading || gradeLevelsQuery.isLoading;

    const isFormReady =
        !!courseRecord &&
        !isEditRecordLoading &&
        !areBaseOptionsLoading &&
        initializedRef.current;

    const hasActualChanges = useMemo(() => {
        if (!isFormReady) return false;

        return (
            String(currentValues.name ?? '') !== originalValues.name ||
            String(currentValues.courseNumber ?? '') !== originalValues.courseNumber ||
            String(currentValues.gradeLevel ?? '') !== originalValues.gradeLevel ||
            String(currentValues.departmentId ?? '') !== originalValues.departmentId ||
            String(currentValues.description ?? '') !== originalValues.description
        );
    }, [currentValues, originalValues, isFormReady]);

    useEffect(() => {
        const course = query?.data?.data;

        if (!course || initializedRef.current) return;
        if (departmentsQuery.isLoading || gradeLevelsQuery.isLoading) return;

        reset(
            {
                name: course.name ?? '',
                courseNumber: course.code?.split(' ')?.slice(1).join(' ') ?? '',
                gradeLevel: String(course.gradeLevel ?? ''),
                departmentId: String(course.departmentId ?? ''),
                description: course.description ?? '',
                code: course.code ?? '',
            },
            {
                keepDirty: false,
                keepTouched: false,
            }
        );

        initializedRef.current = true;
    }, [query?.data?.data, departmentsQuery.isLoading, gradeLevelsQuery.isLoading, reset]);

    const onSubmit = async (values: z.infer<typeof editCourseSchema>) => {
        if (!isFormReady) return;

        const changedValues: Partial<z.infer<typeof editCourseSchema>> = {};

        if (String(values.name ?? '') !== originalValues.name) {
            changedValues.name = values.name;
        }

        if (String(values.gradeLevel ?? '') !== originalValues.gradeLevel) {
            changedValues.gradeLevel = values.gradeLevel;
        }

        if (String(values.departmentId ?? '') !== originalValues.departmentId) {
            changedValues.departmentId = values.departmentId;
        }

        if (String(values.description ?? '') !== originalValues.description) {
            changedValues.description = values.description;
        }

        const courseNumberChanged =
            String(values.courseNumber ?? '') !== originalValues.courseNumber;

        if (courseNumberChanged) {
            changedValues.courseNumber = values.courseNumber;
        }

        if (
            String(values.departmentId ?? '') !== originalValues.departmentId ||
            courseNumberChanged
        ) {
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
                        <CardTitle className="pb-0 text-2xl font-bold">Update Course Info</CardTitle>
                    </CardHeader>

                    <Separator />

                    <CardContent className="mt-7">
                        {!courseRecord || isEditRecordLoading || areBaseOptionsLoading ? (
                            <div className="py-6 text-sm text-muted-foreground">Loading course form...</div>
                        ) : (
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
                                                    <Input
                                                        placeholder="Data Structures and Algorithms"
                                                        {...field}
                                                        value={field.value ?? ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <FormField
                                            control={control}
                                            name="departmentId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Department <span className="text-red-400">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            value={field.value ?? ''}
                                                            onValueChange={(value) => field.onChange(value)}
                                                        >
                                                            <SelectTrigger className="w-full cursor-pointer">
                                                                <SelectValue placeholder="Select Department" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {departmentsQuery.data?.data?.map((department) => (
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
                                                        <Input
                                                            placeholder="326"
                                                            {...field}
                                                            value={field.value ?? ''}
                                                        />
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
                                                        <Select
                                                            value={field.value ?? ''}
                                                            onValueChange={(value) => field.onChange(value)}
                                                        >
                                                            <SelectTrigger className="w-full cursor-pointer">
                                                                <SelectValue placeholder="Select Grade Level" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {gradeLevels.map((gradeLevel) => (
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
                                                        value={field.value ?? ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isSubmitting || !hasActualChanges}
                                        className="w-full"
                                    >
                                        {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </EditView>
    );
};

export default EditCourse;