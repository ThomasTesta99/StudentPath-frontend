import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb'
import { CreateView } from '@/components/refine-ui/views/create-view'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { sectionSchema } from '@/lib/schema';
import { formatTime } from '@/lib/utils';
import { useDebouncedValue } from '@/lib/utilsTsx';
import { Course, Period, TeacherProfile, TermDetails } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBack, useList } from '@refinedev/core';
import { useForm } from '@refinedev/react-hook-form';
import { Check } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import z from 'zod';

const SectionCreate = () => {
    const back = useBack();
    const [teacherSearch, setTeacherSearch] = useState("");
    const [isTeacherDropdownOpen, setisTeacherDropdownOpen] = useState(false);

    const [courseSearch, setCourseSearch] = useState("");
    const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

    const form = useForm({
        resolver: zodResolver(sectionSchema), 
        refineCoreProps: {
            resource: "sections",
            action: "create", 
            meta: {path: "admin/sections"}, 
        },
        defaultValues: {
            termId: "",
            courseId: "",
            periodId: "",
            teacherId: "",
            sectionLabel: "",
            capacity: 1,
            roomNumber: "",
        }
    });

    const {
        refineCore: {onFinish}, 
        control, 
        formState: {isSubmitting}, 
        handleSubmit, 
    } = form;

    const {query: periodsQuery} = useList<Period>({
        resource: "bell-schedule/periods", 
        pagination: {
            mode: "off", 
        }, 
        meta: {path: "admin/bell-schedule/periods"}
    })

    const debouncedTeacherSearch = useDebouncedValue(teacherSearch, 300);
    const shouldFetchTeachers = isTeacherDropdownOpen && debouncedTeacherSearch.trim().length >= 2;

    const {query: teachersQuery} = useList<TeacherProfile>({
        resource: "teachers", 
        pagination: {
            currentPage: 1, 
            pageSize: 10, 
        },
        filters: [
            {field: "search", operator: "contains", value: debouncedTeacherSearch.trim()}
        ],
        queryOptions: {
            enabled: shouldFetchTeachers,
        }
    });
    const debouncedCourseSearch = useDebouncedValue(courseSearch, 300);
    const shouldFetchCourses = isCourseDropdownOpen && debouncedCourseSearch.trim().length >= 2;

    const { query: coursesQuery } = useList<Course>({
        resource: "courses",
        pagination: {
            currentPage: 1,
            pageSize: 10,
        },
        meta: {path: "admin/courses"},
        filters: [
            { field: "search", operator: "contains", value: debouncedCourseSearch.trim() }
        ],
        queryOptions: {
            enabled: shouldFetchCourses,
        }
    });

    const courses = coursesQuery.data?.data ?? [];
    const courseDropdownRef = useRef<HTMLDivElement | null>(null);
    const teachers = teachersQuery.data?.data ?? [];
    const teacherDropdownRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const handlePointerDown = (e: PointerEvent) => {
            const teacherEl = teacherDropdownRef.current;
            const courseEl = courseDropdownRef.current;

            if (teacherEl && !teacherEl.contains(e.target as Node)) {
                setisTeacherDropdownOpen(false);
            }

            if (courseEl && !courseEl.contains(e.target as Node)) {
                setIsCourseDropdownOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, []);


    const {query: termsQuery} = useList<TermDetails>({
        resource: "terms", 
        pagination: {
            mode: "off", 
        }
    })

    const onSubmit = async (values: z.infer<typeof sectionSchema>) => {
        try {
            await onFinish(values);
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <CreateView>
            <Breadcrumb />
            <h1 className="page-title">Create a Section</h1>
            <div className="intro-row">
                <p>Provide the required information to create a section below.</p>
                <Button onClick={back}>Go Back</Button>
            </div>
            <Separator />

            <div className="my-4 flex items-center">
                <Card className='class-form-card'>
                    <CardHeader className='relative z-10'>
                        <CardTitle className='text-2xl pb-0 font-bold'>Fill out the Form</CardTitle>
                    </CardHeader>

                    <Separator />

                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-7'>
                                <FormField
                                    control={control}
                                    name="sectionLabel"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Section Label <span className="text-red-400">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder='Algebra II - Period 2'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="teacherId"
                                    render={({ field }) => {
                                        const selectedTeacher = teachers.find((t) => t.userId === field.value);

                                        return (
                                            <FormItem className="relative">
                                                <FormLabel>
                                                    Instructor <span className="text-red-400">*</span>
                                                </FormLabel>

                                                <FormControl>
                                                    <div className="relative" ref={teacherDropdownRef}>
                                                        <Input
                                                            placeholder={
                                                                selectedTeacher
                                                                ? `Selected: ${selectedTeacher.user.name}`
                                                                : teachersQuery.isLoading
                                                                ? "Searching instructors..."
                                                                : "Search instructor by name"
                                                            }
                                                            value={teacherSearch}
                                                            onChange={(e) => {
                                                                setTeacherSearch(e.target.value);
                                                                setisTeacherDropdownOpen(true);
                                                                if (field.value) field.onChange("");
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
                                    name="courseId"
                                    render={({ field }) => {
                                        const selectedCourse = courses.find((c) => c.id === field.value);

                                        return (
                                            <FormItem className="relative">
                                                <FormLabel>
                                                    Course <span className="text-red-400">*</span>
                                                </FormLabel>

                                                <FormControl>
                                                    <div className="relative" ref={courseDropdownRef}>
                                                        <Input
                                                            placeholder={
                                                                selectedCourse
                                                                    ? `Selected: ${selectedCourse.name}`
                                                                    : coursesQuery.isLoading
                                                                    ? "Searching courses..."
                                                                    : "Search course by name"
                                                            }
                                                            value={courseSearch}
                                                            onChange={(e) => {
                                                                setCourseSearch(e.target.value);
                                                                setIsCourseDropdownOpen(true);
                                                                if (field.value) field.onChange("");
                                                            }}
                                                            onFocus={() => setIsCourseDropdownOpen(true)}
                                                            disabled={coursesQuery.isError}
                                                        />

                                                        {isCourseDropdownOpen && courseSearch.trim().length < 2 && (
                                                            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md px-3 py-2 text-sm text-muted-foreground">
                                                                Type 2+ characters to search
                                                            </div>
                                                        )}

                                                        {isCourseDropdownOpen &&
                                                            courseSearch.trim().length >= 2 &&
                                                            !coursesQuery.isError && (
                                                                <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-md border bg-popover shadow-md">
                                                                    {coursesQuery.isLoading ? (
                                                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                                                            Searching...
                                                                        </div>
                                                                    ) : courses.length > 0 ? (
                                                                        courses.map((course) => (
                                                                            <button
                                                                                type="button"
                                                                                key={course.id}
                                                                                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                                                                onMouseDown={(e) => e.preventDefault()}
                                                                                onClick={() => {
                                                                                    field.onChange(course.id);
                                                                                    setCourseSearch(course.name);
                                                                                    setIsCourseDropdownOpen(false);
                                                                                }}
                                                                            >
                                                                                <div className="flex flex-col">
                                                                                    <span>{course.name}</span>
                                                                                    {"code" in course && course.code && (
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
                                        );
                                    }}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField 
                                        control={control}
                                        name="termId"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Term <span className='text-red-400'>*</span></FormLabel>
                                                <FormControl>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger className='cursor-pointer w-full'>
                                                            <SelectValue placeholder="Select Term"/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {termsQuery.isLoading && (
                                                                <SelectItem value="loading" disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            )}

                                                            {termsQuery.isError && (
                                                                <SelectItem value='error' disabled>
                                                                    Failed to load terms
                                                                </SelectItem>
                                                            )}

                                                            {!termsQuery.isLoading && !termsQuery.isError &&
                                                                termsQuery.data?.data?.map((term) => (
                                                                    <SelectItem key = {term.id} value={term.id} className='cursor-pointer'>
                                                                        {term.termName}
                                                                    </SelectItem>
                                                                ))
                                                            }
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
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Period Number <span className='text-red-400'>*</span></FormLabel>
                                                <FormControl>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger className='cursor-pointer w-full'>
                                                            <SelectValue placeholder="Select Period"/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {periodsQuery.isLoading && (
                                                                <SelectItem value="loading" disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            )}

                                                            {periodsQuery.isError && (
                                                                <SelectItem value='error' disabled>
                                                                    Failed to load periods
                                                                </SelectItem>
                                                            )}

                                                            {!periodsQuery.isLoading && !periodsQuery.isError &&
                                                                periodsQuery.data?.data?.map((period) => (
                                                                    <SelectItem key = {period.id} value={period.id} className='cursor-pointer'>
                                                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                                                            {period.number}
                                                                        </div>
                                                                        <p className="text-sm">{formatTime(period.startTime)} - {formatTime(period.endTime)}</p>
                                                                    </SelectItem>
                                                                ))
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={control}
                                        name="capacity"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Class Capacity <span className="text-red-400">*</span></FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder='26' {...field}/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="roomNumber"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Room Number (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder='C101' {...field}/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button type="submit" size="lg" className='w-full'>
                                    {isSubmitting ? "Creating Section..." : "Create Section"}
                                </Button>
                            </form>
                        </Form>

                    </CardContent>
                </Card>
            </div>

        </CreateView>
    )
}

export default SectionCreate
