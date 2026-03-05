import { EditView, EditViewHeader } from '@/components/refine-ui/views/edit-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { editCourseSchema } from '@/lib/schema';
import { useDebouncedValue } from '@/lib/utilsTsx';
import { Department, TeacherProfile, TermDetails } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { HttpError, useList, useNotification } from '@refinedev/core';
import { useForm } from '@refinedev/react-hook-form';
import { Check } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import z from 'zod';

const EditCourse = () => {
    const { id } = useParams();
    const { open } = useNotification();

    const [teacherSearch, setTeacherSearch] = useState('');
    const [isTeacherDropdownOpen, setisTeacherDropdownOpen] = useState(false);

    const form = useForm({
        resolver: zodResolver(editCourseSchema),
        refineCoreProps: {
            resource: 'courses',
            action: 'edit',
            id,
            meta: { path: 'admin/courses' },
        },
        defaultValues: {
            termId: '',
            teacherId: '',
            name: '',
            courseNumber: '',
            gradeLevel: '',
            departmentId: '',
            description: '',
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

    const { query: termQuery } = useList<TermDetails>({
        resource: 'terms',
        pagination: { mode: 'off' },
    });

    const { query: departmentsQuery } = useList<Department>({
        resource: 'departments',
        pagination: { mode: 'off' },
    });

    const debouncedTeacherSearch = useDebouncedValue(teacherSearch, 300);
    const shouldFetchTeachers = isTeacherDropdownOpen && debouncedTeacherSearch.trim().length >= 2;

    const { query: teachersQuery } = useList<TeacherProfile>({
        resource: 'teachers',
        pagination: {
            currentPage: 1,
            pageSize: 10,
        },
        filters: [{ field: 'search', operator: 'contains', value: debouncedTeacherSearch.trim() }],
        queryOptions: { enabled: shouldFetchTeachers },
    });

    const teachers = teachersQuery.data?.data ?? [];


    const selectedDepartmentId = watch('departmentId');
    const selectedDepartment = useMemo(() => {
        return departmentsQuery.data?.data?.find((d) => d.id === selectedDepartmentId);
    }, [departmentsQuery.data?.data, selectedDepartmentId]);

    const selectedDepartmentCode = selectedDepartment?.code ?? '';

    useEffect(() => {
        const course = query?.data?.data;
        if (!course || isDirty) return;

        reset({
            termId: course.termId ?? '',
            teacherId: course.teacherId ?? '',
            name: course.name ?? '',
            courseNumber: (course.code?.split(' ')?.[1] ?? ''),
            gradeLevel: course.gradeLevel ?? '',
            departmentId: course.departmentId ?? '',
            description: course.description ?? '',
        });

        const existingTeacherName = course.teacher?.name;

        if (existingTeacherName) {
            setTeacherSearch(existingTeacherName);
        } else {
            setTeacherSearch('');
        }
    }, [query?.data?.data, reset, isDirty]);

    const teacherDropdownRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const handlePointerDown = (e: PointerEvent) => {
            const el = teacherDropdownRef.current;
            if (!el) return;
            if (!el.contains(e.target as Node)) {
            setisTeacherDropdownOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, []);

    const onSubmit = async (values: z.infer<typeof editCourseSchema>) => {
        const changedValues: Partial<z.infer<typeof editCourseSchema>> = {};

        if (dirtyFields.name) changedValues.name = values.name;
        if (dirtyFields.termId) changedValues.termId = values.termId;
        if (dirtyFields.gradeLevel) changedValues.gradeLevel = values.gradeLevel;
        if (dirtyFields.departmentId) changedValues.departmentId = values.departmentId;
        if (dirtyFields.courseNumber) changedValues.courseNumber = values.courseNumber;
        if (dirtyFields.teacherId) changedValues.teacherId = values.teacherId;
        if (dirtyFields.description) changedValues.description = values.description;

        if (dirtyFields.departmentId || dirtyFields.courseNumber) {
            const deptCode =
                departmentsQuery.data?.data?.find((d) => d.id === values.departmentId)?.code ?? '';
            changedValues.code = `${deptCode} ${values.courseNumber}`.trim();
        }

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
                                                Course Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Data Structures and Algorithms" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={control}
                                        name="termId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Term
                                                </FormLabel>
                                                <FormControl>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger className="cursor-pointer w-full">
                                                            <SelectValue placeholder="Select Term" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {termQuery.isLoading && (
                                                                <SelectItem value="loading" disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            )}

                                                            {termQuery.isError && (
                                                                <SelectItem value="error" disabled>
                                                                    Failed to load terms
                                                                </SelectItem>
                                                            )}

                                                            {!termQuery.isLoading &&
                                                                !termQuery.isError &&
                                                                termQuery.data?.data?.map((term) => (
                                                                    <SelectItem
                                                                        key={term.id}
                                                                        value={term.id}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        {term.termName}
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
                                        name="gradeLevel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Grade Level
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="9" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <FormField
                                        control={control}
                                        name="departmentId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Department
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

                                    <div className="w-full space-y-2">
                                        <FormLabel>Code</FormLabel>
                                        <Input disabled value={selectedDepartmentCode} />
                                    </div>

                                    <FormField
                                        control={control}
                                        name="courseNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Course Number
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="326" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={control}
                                    name="teacherId"
                                    render={({ field }) => {
                                        const selectedTeacher = teachers.find((t) => t.userId === field.value);

                                        return (
                                            <FormItem className="relative">
                                                <FormLabel>
                                                    Instructor 
                                                </FormLabel>

                                                <FormControl>
                                                    <div className="relative" ref={teacherDropdownRef}>
                                                        <Input
                                                            placeholder={
                                                                selectedTeacher
                                                                    ? `Selected: ${selectedTeacher.user.name}`
                                                                    : teachersQuery.isLoading
                                                                    ? 'Searching instructors...'
                                                                    : 'Search instructor by name'
                                                            }
                                                            value={teacherSearch}
                                                            onChange={(e) => {
                                                                setTeacherSearch(e.target.value);
                                                                setisTeacherDropdownOpen(true);
                                                                if (field.value) field.onChange('');
                                                            }}
                                                            onFocus={() => setisTeacherDropdownOpen(true)}
                                                            disabled={teachersQuery.isError}
                                                        />

                                                        {isTeacherDropdownOpen && teacherSearch.trim().length < 2 && (
                                                            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md px-3 py-2 text-sm text-muted-foreground">
                                                                Type 2+ characters to search
                                                            </div>
                                                        )}

                                                        {isTeacherDropdownOpen &&
                                                            teacherSearch.trim().length >= 2 &&
                                                            !teachersQuery.isError && (
                                                                <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-md border bg-popover shadow-md">
                                                                    {teachersQuery.isLoading ? (
                                                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                                                            Searching...
                                                                        </div>
                                                                    ) : teachers.length > 0 ? (
                                                                        teachers.map((teacher) => (
                                                                            <button
                                                                                type="button"
                                                                                key={teacher.userId}
                                                                                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                                                                onMouseDown={(e) => e.preventDefault()}
                                                                                onClick={() => {
                                                                                    field.onChange(teacher.userId);
                                                                                    setTeacherSearch(teacher.user.name);
                                                                                    setisTeacherDropdownOpen(false);
                                                                                }}
                                                                            >
                                                                                <span>{teacher.user.name}</span>
                                                                                {field.value === teacher.userId && (
                                                                                    <Check className="h-4 w-4" />
                                                                                )}
                                                                            </button>
                                                                        ))
                                                                    ) : (
                                                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                                                            No teachers found
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>
                                                </FormControl>

                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />

                                <FormField
                                    control={control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Description
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Type your description here..." {...field} />
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