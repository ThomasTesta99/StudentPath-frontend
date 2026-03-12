import { EditView, EditViewHeader } from '@/components/refine-ui/views/edit-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { editSectionSchema } from '@/lib/schema';
import { formatTime } from '@/lib/utils';
import { useDebouncedValue } from '@/lib/utilsTsx';
import { Course, Period, TeacherProfile, TermDetails } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { HttpError, useList, useNotification } from '@refinedev/core';
import { useForm } from '@refinedev/react-hook-form';
import { Check } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import z from 'zod';

const EditSection = () => {
    const { id } = useParams();
    const { open } = useNotification();

    const [teacherSearch, setTeacherSearch] = useState('');
    const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);

    const [courseSearch, setCourseSearch] = useState('');
    const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

    const teacherDropdownRef = useRef<HTMLDivElement | null>(null);
    const courseDropdownRef = useRef<HTMLDivElement | null>(null);
    const initializedRef = useRef(false);

    const form = useForm({
        resolver: zodResolver(editSectionSchema),
        refineCoreProps: {
            resource: 'sections',
            action: 'edit',
            id,
            meta: { path: 'admin/sections' },
        },
        defaultValues: {
            termId: '',
            courseId: '',
            periodId: '',
            teacherId: '',
            sectionLabel: '',
            capacity: 1,
            roomNumber: '',
        },
    });

    const {
        refineCore: { onFinish, query },
        control,
        handleSubmit,
        watch,
        formState: { isSubmitting },
        reset,
    } = form;

    const { query: termsQuery } = useList<TermDetails>({
        resource: 'terms',
        pagination: { mode: 'off' },
    });

    const { query: periodsQuery } = useList<Period>({
        resource: 'bell-schedule/periods',
        pagination: { mode: 'off' },
        meta: { path: 'admin/bell-schedule/periods' },
    });

    const debouncedTeacherSearch = useDebouncedValue(teacherSearch, 300);
    const shouldFetchTeachers = isTeacherDropdownOpen && debouncedTeacherSearch.trim().length >= 2;

    const { query: teachersQuery } = useList<TeacherProfile>({
        resource: 'teachers',
        pagination: {
            currentPage: 1,
            pageSize: 10,
        },
        filters: [
            {
                field: 'search',
                operator: 'contains',
                value: debouncedTeacherSearch.trim(),
            },
        ],
        queryOptions: {
            enabled: shouldFetchTeachers,
        },
    });

    const debouncedCourseSearch = useDebouncedValue(courseSearch, 300);
    const shouldFetchCourses = isCourseDropdownOpen && debouncedCourseSearch.trim().length >= 2;

    const { query: coursesQuery } = useList<Course>({
        resource: 'courses',
        pagination: {
            currentPage: 1,
            pageSize: 10,
        },
        meta: { path: 'admin/courses' },
        filters: [
            {
                field: 'search',
                operator: 'contains',
                value: debouncedCourseSearch.trim(),
            },
        ],
        queryOptions: {
            enabled: shouldFetchCourses,
        },
    });

    const teachers = teachersQuery.data?.data ?? [];
    const courses = coursesQuery.data?.data ?? [];
    const currentValues = watch();

    const originalValues = useMemo(() => {
        const section = query?.data?.data;

        if (!section) {
            return {
                termId: '',
                courseId: '',
                periodId: '',
                teacherId: '',
                sectionLabel: '',
                capacity: 1,
                roomNumber: '',
            };
        }

        return {
            termId: String(section.termId ?? ''),
            courseId: String(section.courseId ?? ''),
            periodId: String(section.periodId ?? ''),
            teacherId: String(section.teacherId ?? ''),
            sectionLabel: section.sectionLabel ?? '',
            capacity: Number(section.capacity ?? 1),
            roomNumber: String(section.roomNumber ?? ''),
        };
    }, [query?.data?.data]);

    const sectionRecord = query?.data?.data;
    const isEditRecordLoading = query?.isLoading;
    const areBaseOptionsLoading = termsQuery.isLoading || periodsQuery.isLoading;

    const isFormReady =
        !!sectionRecord &&
        !isEditRecordLoading &&
        !areBaseOptionsLoading &&
        initializedRef.current;

    const hasActualChanges = useMemo(() => {
        if (!isFormReady) return false;

        return (
            String(currentValues.termId ?? '') !== originalValues.termId ||
            String(currentValues.courseId ?? '') !== originalValues.courseId ||
            String(currentValues.periodId ?? '') !== originalValues.periodId ||
            String(currentValues.teacherId ?? '') !== originalValues.teacherId ||
            String(currentValues.sectionLabel ?? '') !== originalValues.sectionLabel ||
            Number(currentValues.capacity ?? 1) !== originalValues.capacity ||
            String(currentValues.roomNumber ?? '') !== originalValues.roomNumber
        );
    }, [currentValues, originalValues, isFormReady]);

    useEffect(() => {
        const section = query?.data?.data;

        if (!section || initializedRef.current) return;
        if (termsQuery.isLoading || periodsQuery.isLoading) return;

        reset(
            {
                termId: String(section.termId ?? ''),
                courseId: String(section.courseId ?? ''),
                periodId: String(section.periodId ?? ''),
                teacherId: String(section.teacherId ?? ''),
                sectionLabel: section.sectionLabel ?? '',
                capacity: Number(section.capacity ?? 1),
                roomNumber: String(section.roomNumber ?? ''),
            },
            {
                keepDirty: false,
                keepTouched: false,
            }
        );

        setTeacherSearch(section.teacher?.name ?? '');
        setCourseSearch(section.course?.name ?? '');

        initializedRef.current = true;
    }, [query?.data?.data, termsQuery.isLoading, periodsQuery.isLoading, reset]);

    useEffect(() => {
        const handlePointerDown = (e: PointerEvent) => {
            const teacherEl = teacherDropdownRef.current;
            const courseEl = courseDropdownRef.current;

            if (teacherEl && !teacherEl.contains(e.target as Node)) {
                setIsTeacherDropdownOpen(false);
            }

            if (courseEl && !courseEl.contains(e.target as Node)) {
                setIsCourseDropdownOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
        };
    }, []);
    
    useEffect(() => {
        initializedRef.current = false;
        setTeacherSearch('');
        setCourseSearch('');
    }, [id]);

    const onSubmit = async (values: z.infer<typeof editSectionSchema>) => {
        if (!isFormReady) return;

        const changedValues: Partial<z.infer<typeof editSectionSchema>> = {};

        if (String(values.termId ?? '') !== originalValues.termId) {
            changedValues.termId = values.termId;
        }

        if (String(values.courseId ?? '') !== originalValues.courseId) {
            changedValues.courseId = values.courseId;
        }

        if (String(values.periodId ?? '') !== originalValues.periodId) {
            changedValues.periodId = values.periodId;
        }

        if (String(values.teacherId ?? '') !== originalValues.teacherId) {
            changedValues.teacherId = values.teacherId;
        }

        if (String(values.sectionLabel ?? '') !== originalValues.sectionLabel) {
            changedValues.sectionLabel = values.sectionLabel;
        }

        if (Number(values.capacity ?? 1) !== originalValues.capacity) {
            changedValues.capacity = values.capacity;
        }

        if (String(values.roomNumber ?? '') !== originalValues.roomNumber) {
            changedValues.roomNumber = values.roomNumber;
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
                message: 'There was an error editing the section: ' + err.message,
            });
        }
    };

    return (
        <EditView>
            <EditViewHeader resource="sections" title="Edit Section" />
            <Separator />

            <div className="my-4 flex items-center">
                <Card className="class-form-card">
                    <CardHeader className="relative z-10">
                        <CardTitle className="pb-0 text-2xl font-bold">Update Section Info</CardTitle>
                    </CardHeader>

                    <Separator />

                    <CardContent className="mt-7">
                        {!sectionRecord || isEditRecordLoading || areBaseOptionsLoading ? (
                            <div className="py-6 text-sm text-muted-foreground">Loading section form...</div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
                                    <FormField
                                        control={control}
                                        name="sectionLabel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Section Label <span className="text-red-400">*</span></FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Algebra II - Period 2"
                                                        {...field}
                                                        value={field.value ?? ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={control}
                                            name="termId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Term <span className="text-red-400">*</span></FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            value={field.value ?? ''}
                                                            onValueChange={(value) => field.onChange(value)}
                                                        >
                                                            <SelectTrigger className="w-full cursor-pointer">
                                                                <SelectValue placeholder="Select Term" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {termsQuery.data?.data?.map((term) => (
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
                                            name="periodId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Period <span className="text-red-400">*</span></FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            value={field.value ?? ''}
                                                            onValueChange={(value) => field.onChange(value)}
                                                        >
                                                            <SelectTrigger className="w-full cursor-pointer">
                                                                <SelectValue placeholder="Select Period" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {periodsQuery.data?.data?.map((period) => (
                                                                    <SelectItem
                                                                        key={period.id}
                                                                        value={period.id}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        Period {period.number} • {formatTime(period.startTime)} -{' '}
                                                                        {formatTime(period.endTime)}
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

                                    <FormField
                                        control={control}
                                        name="teacherId"
                                        render={({ field }) => (
                                            <FormItem className="relative">
                                                <FormLabel>Instructor <span className="text-red-400">*</span></FormLabel>

                                                <FormControl>
                                                    <div className="relative" ref={teacherDropdownRef}>
                                                        <Input
                                                            placeholder={
                                                                teachersQuery.isLoading
                                                                    ? 'Searching instructors...'
                                                                    : 'Search instructor by name'
                                                            }
                                                            value={teacherSearch}
                                                            onChange={(e) => {
                                                                setTeacherSearch(e.target.value);
                                                                setIsTeacherDropdownOpen(true);
                                                                if (field.value) field.onChange('');
                                                            }}
                                                            onFocus={() => setIsTeacherDropdownOpen(true)}
                                                            disabled={teachersQuery.isError}
                                                        />

                                                        {isTeacherDropdownOpen && teacherSearch.trim().length < 2 && (
                                                            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
                                                                Type 2+ characters to search
                                                            </div>
                                                        )}

                                                        {isTeacherDropdownOpen &&
                                                            teacherSearch.trim().length >= 2 &&
                                                            !teachersQuery.isError && (
                                                                <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                                                                    {teachersQuery.isLoading ? (
                                                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                                                            Searching...
                                                                        </div>
                                                                    ) : teachers.length > 0 ? (
                                                                        teachers.map((teacher) => (
                                                                            <button
                                                                                type="button"
                                                                                key={teacher.userId}
                                                                                className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                                                                onMouseDown={(e) => e.preventDefault()}
                                                                                onClick={() => {
                                                                                    field.onChange(teacher.userId);
                                                                                    setTeacherSearch(teacher.user.name);
                                                                                    setIsTeacherDropdownOpen(false);
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
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="courseId"
                                        render={({ field }) => (
                                            <FormItem className="relative">
                                                <FormLabel>Course <span className="text-red-400">*</span></FormLabel>

                                                <FormControl>
                                                    <div className="relative" ref={courseDropdownRef}>
                                                        <Input
                                                            placeholder={
                                                                coursesQuery.isLoading
                                                                    ? 'Searching courses...'
                                                                    : 'Search course by name'
                                                            }
                                                            value={courseSearch}
                                                            onChange={(e) => {
                                                                setCourseSearch(e.target.value);
                                                                setIsCourseDropdownOpen(true);
                                                                if (field.value) field.onChange('');
                                                            }}
                                                            onFocus={() => setIsCourseDropdownOpen(true)}
                                                            disabled={coursesQuery.isError}
                                                        />

                                                        {isCourseDropdownOpen && courseSearch.trim().length < 2 && (
                                                            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
                                                                Type 2+ characters to search
                                                            </div>
                                                        )}

                                                        {isCourseDropdownOpen &&
                                                            courseSearch.trim().length >= 2 &&
                                                            !coursesQuery.isError && (
                                                                <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                                                                    {coursesQuery.isLoading ? (
                                                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                                                            Searching...
                                                                        </div>
                                                                    ) : courses.length > 0 ? (
                                                                        courses.map((course) => (
                                                                            <button
                                                                                type="button"
                                                                                key={course.id}
                                                                                className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                                                                onMouseDown={(e) => e.preventDefault()}
                                                                                onClick={() => {
                                                                                    field.onChange(course.id);
                                                                                    setCourseSearch(course.name);
                                                                                    setIsCourseDropdownOpen(false);
                                                                                }}
                                                                            >
                                                                                <div className="flex flex-col">
                                                                                    <span>{course.name}</span>
                                                                                    {course.code && (
                                                                                        <span className="text-xs text-muted-foreground">
                                                                                            {course.code}
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                {field.value === course.id && (
                                                                                    <Check className="h-4 w-4" />
                                                                                )}
                                                                            </button>
                                                                        ))
                                                                    ) : (
                                                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                                                            No courses found
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>
                                                </FormControl>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={control}
                                            name="capacity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Capacity <span className="text-red-400">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="26"
                                                            value={field.value ?? ''}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                field.onChange(
                                                                    value === '' ? undefined : Number(value),
                                                                );
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={control}
                                            name="roomNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Room Number (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="C101"
                                                            {...field}
                                                            value={field.value ?? ''}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

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

export default EditSection;