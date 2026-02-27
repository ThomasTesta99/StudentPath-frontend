import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb'
import { CreateView } from '@/components/refine-ui/views/create-view'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { studentSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { HttpError, useBack, useNotification } from '@refinedev/core'
import { useForm } from '@refinedev/react-hook-form'
import React from 'react'
import z from 'zod'

const StudentCreate = () => {
    const back = useBack();
    const {open} = useNotification();

    const form = useForm({
        resolver: zodResolver(studentSchema), 
        refineCoreProps: {
            resource: "students", 
            action: "create"
        },
        defaultValues: {
            name: "", 
            email: "", 
            password: "",
            confirmPassword: "", 
            gradeLevel: "", 
            osis: "", 
            dob: "", 
        }
    })

    const {
        refineCore: {onFinish},
        control, 
        handleSubmit, 
        formState: {isSubmitting},
    } = form;

    const onSubmit = async (values: z.infer<typeof studentSchema>) => {
        try {
            await onFinish(values);
        } catch (error) {
            const err = error as HttpError;
            open?.({
                type: "error", 
                message: "There was an error creating the student: " + err.message
            })
        }
    }

    return (
        <CreateView>
            <Breadcrumb />
            <h1 className="page-title">Create a Student</h1>
            <div className="intro-row">
                <p>Provide the required information to create a new teacher below.</p>
                <Button onClick={back}>Go Back</Button>
            </div>

            <Separator />

            <div className="my-4 flex items-center">
                <Card className='class-form-card'>

                    <CardHeader className='relative z-10'>
                        <CardTitle className='text-2xl pb-0 font-bold'>Fill out the form</CardTitle>
                    </CardHeader>
                    <Separator/>

                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                               <FormField
                                    control={control}
                                    name='name'
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Name<span className="text-red-400">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder='John Doe' {...field}/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name='email'
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Email<span className="text-red-400">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder='johndoe@email.com' {...field}/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name='osis'
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>OSIS (9-digits)<span className="text-red-400">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder='215849712' {...field}/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <FormField
                                        control={control}
                                        name='dob'
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Date of Birth<span className="text-red-400">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder='YYYY-MM-DD' {...field}/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    /> 

                                    <FormField
                                        control={control}
                                        name='gradeLevel'
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Grade Level<span className="text-red-400">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder='9' {...field}/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>


                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <FormField
                                        control={control}
                                        name='password'
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Temporary Password<span className="text-red-400">*</span></FormLabel>
                                                <FormControl>
                                                    <Input type='password' {...field}/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    /> 

                                    <FormField
                                        control={control}
                                        name='confirmPassword'
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password<span className="text-red-400">*</span></FormLabel>
                                                <FormControl>
                                                    <Input type='password' {...field}/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                

                                <Button type='submit' size="lg" className='w-full' disabled={isSubmitting}>
                                    {isSubmitting ? "Creating Student..." : "Create Student"}
                                </Button>
                            </form>
                        </Form>
                        
                    </CardContent>
                    
                </Card>
                
            </div>
        </CreateView>
    )
}

export default StudentCreate
