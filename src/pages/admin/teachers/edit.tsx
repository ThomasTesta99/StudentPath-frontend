import { EditView, EditViewHeader } from '@/components/refine-ui/views/edit-view'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { editTeacherSchema } from '@/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { HttpError, useNotification } from '@refinedev/core';
import { useForm } from '@refinedev/react-hook-form';
import React, { useEffect } from 'react'
import { useParams } from 'react-router'
import z from 'zod';

const EditTeacher = () => {
    const {id} = useParams();
    const {open} = useNotification();

    const form = useForm({
        resolver: zodResolver(editTeacherSchema), 
        refineCoreProps: {
            resource: "teachers", 
            action: "edit", 
            id: id,
            meta: {path: "admin/teachers"}
        }, 
        defaultValues: {
            name: "", 
            email: ""
        }
    })

    const {
        refineCore: {onFinish, query},
        control, 
        handleSubmit, 
        formState: {isSubmitting, dirtyFields},
        reset, 
    } = form;

    useEffect(() => {
        const teacher = query?.data?.data
        if(!teacher) return;
        reset({
            name: teacher.user.name ?? "-", 
            email: teacher.user.email ?? "",
        })
    }, [query?.data?.data, reset]);

    const onSubmit = async (values: z.infer<typeof editTeacherSchema>) => {
        const changedValues: Partial<z.infer<typeof editTeacherSchema>> = {};

        if(dirtyFields.name){
            changedValues.name = values.name;
        }
        if(dirtyFields.email){
            changedValues.email = values.email;
        }
        if (Object.keys(changedValues).length === 0) {
            open?.({
                type: "error",
                message: "No changes to save",
            });
            return;
        }
        try {
            await onFinish(values);
        } catch (error) {
            const err = error as HttpError;
            open?.({
                type:"error", 
                message: "There was an error editing the instructors information: " + err.message
            })
        }
    }

    return (
        <EditView>
            <EditViewHeader resource='teachers' title='Edit Instructor' />
            <Separator />

            <div className="mx-auto w-full max-w-3xl space-y-6">
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between gap-4'>
                        <div className="space-y-1">
                            <CardTitle className='text-2xl'>Instructor Info</CardTitle>
                            <div className="text-sm text-muted-foreground">
                                Update the Instructor's information
                            </div>
                        </div>
                    </CardHeader>

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

                                <Button type='submit' size="lg" variant="default" disabled={isSubmitting} className='w-full'>
                                    {isSubmitting ? "Saving Changes..." : "Save Changes"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </EditView>
    )
}

export default EditTeacher 
