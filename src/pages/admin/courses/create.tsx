import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { CreateView } from '@/components/refine-ui/views/create-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { courseSchema } from '@/lib/schema';
import { useDebouncedValue } from '@/lib/utilsTsx';
import { Department, TeacherProfile, TermDetails } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { HttpError, useBack, useList, useNotification } from '@refinedev/core'
import { useForm } from '@refinedev/react-hook-form';
import { Check } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import z from 'zod';

const CourseCreate = () => {
    const back = useBack();
    const {open} = useNotification();
    const [teacherSearch, setTeacherSearch] = useState("");
    const [isTeacherDropdownOpen, setisTeacherDropdownOpen] = useState(false);

    const form = useForm({
        resolver: zodResolver(courseSchema), 
        refineCoreProps:{
            resource: "courses", 
            action: "create"
        }, 
        defaultValues: {
            termId: "", 
            teacherId: "", 
            name: "", 
            courseNumber: "",
            gradeLevel: "",  
            departmentId: "", 
            description: ""
        }
    });

    const {
        refineCore: {onFinish}, 
        control, 
        watch,
        formState: {isSubmitting}, 
        handleSubmit, 
    } = form;

    
    const {query: termQuery} = useList<TermDetails>({
        resource: "terms",
        pagination: {
            mode: "off", 
        }
    });
    
    const {query: departmentsQuery} = useList<Department>({
        resource: "departments", 
        pagination: {
            mode: "off"
        }
    });

    // const {query: gradeLevelsQuery} = useCustom<GradeLevel[]>({
    //     url: `${BACKEND_BASE_URL}/admin/schools/me/grade-levels`, 
    //     method: "get", 
    
    // });

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

    const teachers = teachersQuery.data?.data ?? [];
    
    const selectedDepartmentId = watch("departmentId");
    const selectedDepartment = departmentsQuery.data?.data.find(
        (department) => department.id === selectedDepartmentId
    );
    const selectedDepartmentCode = selectedDepartment?.code ?? "";

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

    const onSubmit = async (values: z.infer<typeof courseSchema>) => {
        try {
            const code = `${selectedDepartment?.code} ${values.courseNumber}`
            await onFinish({
                ...values, 
                code,
            });
        } catch (error) {
            const err = error as HttpError
            open?.({
            type: "error", 
            message: "There was an error creating the course: " + err.message , 
            })
        }
    }

    return (
        <CreateView>
            <Breadcrumb/>
            <h1 className="page-title">Create a Course</h1>
            <div className="intro-row">
                <p>Provide the required information to create a course below.</p>
                <Button onClick={back}>Go Back</Button>
            </div>

            <Separator />

            <div className="my-4 flex items-center">
                <Card className='class-form-card'>
                    <CardHeader className='relative z-10'>
                        <CardTitle className='text-2xl pb-0 font-bold'>Fill out the Form</CardTitle>
                    </CardHeader>

                    <Separator />

                    <CardContent className='mt-7'>
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-7'>
                                <FormField 
                                    control={control}
                                    name="name"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Course Name <span className='text-red-400'>*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Data Structors and Algorithms" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                                            {termQuery.isLoading && (
                                                                <SelectItem value="loading" disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            )}

                                                            {termQuery.isError && (
                                                                <SelectItem value='error' disabled>
                                                                    Failed to load terms
                                                                </SelectItem>
                                                            )}

                                                            {!termQuery.isLoading && !termQuery.isError &&
                                                                termQuery.data?.data?.map((term) => (
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
                                        name="gradeLevel"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Grade Level <span className='text-red-400'>*</span></FormLabel>
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
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Department <span className='text-red-400'>*</span></FormLabel>
                                                <FormControl>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger className='cursor-pointer w-full'>
                                                            <SelectValue placeholder="Select Department"/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {departmentsQuery.isLoading && (
                                                                <SelectItem value="loading" disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            )}

                                                            {departmentsQuery.isError && (
                                                                <SelectItem value='error' disabled>
                                                                    Failed to load departments
                                                                </SelectItem>
                                                            )}

                                                            {!departmentsQuery.isLoading && !departmentsQuery.isError &&
                                                                departmentsQuery.data?.data?.map((department) => (
                                                                    <SelectItem key = {department.id} value={department.id} className='cursor-pointer'>
                                                                        {department.name}
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
                                    <div className="w-full space-y-2">
                                        <FormLabel>Code</FormLabel>
                                        <Input 
                                            disabled
                                            value={selectedDepartmentCode}
                                        />
                        
                                    </div>

                                    <FormField
                                        control={control}
                                        name="courseNumber"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Course Number <span className='text-red-400'>*</span></FormLabel>
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
                                    name="description"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Description <span className="text-red-400">*</span></FormLabel>
                                            <FormControl>
                                                <Textarea placeholder='Type your description here...' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type='submit' size="lg" disabled={isSubmitting} className='w-full'>
                                    {isSubmitting ? "Creating Course..." : "Create Course"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </CreateView>
    )
}

export default CourseCreate
