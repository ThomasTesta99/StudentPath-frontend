import { EditView, EditViewHeader } from '@/components/refine-ui/views/edit-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { editStudentSchema } from '@/lib/schema';
import { StudentProfile } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { HttpError, useNotification } from '@refinedev/core';
import { useForm } from '@refinedev/react-hook-form';
import React, { useEffect } from 'react'
import { useParams } from 'react-router'
import z from 'zod';

const EditStudent = () => {
  const {id} = useParams();
  const {open} = useNotification();

  const form = useForm<StudentProfile>({
    resolver: zodResolver(editStudentSchema),
    refineCoreProps:{
      resource: "students", 
      action: "edit", 
      id: id, 
      meta: {path: "admin/students"}
    }
  });

  const {
    refineCore: {onFinish, query},
    control, 
    formState: {isSubmitting, dirtyFields}, 
    handleSubmit, 
    reset
  } = form;

  useEffect(() => {
    const student = query?.data?.data;
    if(!student) return;
    reset({
      name: student.user.name ?? "",
      email: student.user.email ?? "", 
      dob: student.dob ?? "", 
      osis: student.osis ?? "", 
      gradeLevel: student.gradeLevel ?? ""
    })
  }, [query?.data?.data, reset]);

  const onSubmit = async (values: z.infer<typeof editStudentSchema>) => {
    const changedValues: Partial<z.infer<typeof editStudentSchema>> = {};

    if(dirtyFields.name) changedValues.name = values.name;
    if(dirtyFields.email) changedValues.email = values.email;
    if(dirtyFields.dob) changedValues.dob = values.dob;
    if(dirtyFields.osis) changedValues.osis = values.osis;
    if(dirtyFields.gradeLevel) changedValues.gradeLevel = values.gradeLevel;

    try {
      await onFinish(changedValues);
    } catch (error) {
        const err = error as HttpError;
        open?.({
          type:"error", 
          message: "There was an error editing the students information: " + err.message
        });
    }
  }


  return (
    <EditView>
      <EditViewHeader resource='students' title='Edit Students' />
      <Separator />

      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Card>
          <CardHeader className='flex flex-row items-center justify-between gap-4'>
            <div className="space-y-1">
              <CardTitle className='text-2xl'>Student Info</CardTitle>
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
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field}/>
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field}/>
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
                      <FormLabel>Osis</FormLabel>
                      <FormControl>
                        <Input {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <FormField 
                    control={control}
                    name='dob'
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input {...field}/>
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
                        <FormLabel>Grade Level</FormLabel>
                        <FormControl>
                          <Input {...field}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>




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

export default EditStudent
