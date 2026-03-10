import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { CreateView } from '@/components/refine-ui/views/create-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { BACKEND_BASE_URL } from '@/constants';
import { courseSchema } from '@/lib/schema';
import { Department, GradeLevel, ListResponse } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { HttpError, useBack, useCustom, useList, useNotification } from '@refinedev/core'
import { useForm } from '@refinedev/react-hook-form';
import z from 'zod';

const CourseCreate = () => {
    const back = useBack();
    const {open} = useNotification();

    const form = useForm({
        resolver: zodResolver(courseSchema), 
        refineCoreProps:{
            resource: "courses", 
            action: "create"
        }, 
        defaultValues: { 
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

    
    const {query: departmentsQuery} = useList<Department>({
        resource: "departments", 
        pagination: {
            mode: "off"
        }
    });

    const {query: gradeLevelsQuery} = useCustom<ListResponse<GradeLevel>>({
        url: `${BACKEND_BASE_URL}/admin/schools/me/grade-levels`, 
        method: "get", 
    });

    const gradeLevels = gradeLevelsQuery?.data?.data.data;

    
    const selectedDepartmentId = watch("departmentId");
    const selectedDepartment = departmentsQuery.data?.data.find(
        (department) => department.id === selectedDepartmentId
    );
    const selectedDepartmentCode = selectedDepartment?.code ?? "";


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
                                                                    <SelectItem
                                                                        key={department.id}
                                                                        value={department.id}
                                                                        className='cursor-pointer'
                                                                    >
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

                                    <FormField
                                        control={control}
                                        name="gradeLevel"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Grade Level <span className='text-red-400'>*</span></FormLabel>
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
                                        value={
                                            selectedDepartmentCode && watch("courseNumber")
                                                ? `${selectedDepartmentCode} ${watch("courseNumber")}`
                                                : selectedDepartmentCode
                                        }
                                        placeholder="Auto-generated from department and course number"
                                    />
                                </div>


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
