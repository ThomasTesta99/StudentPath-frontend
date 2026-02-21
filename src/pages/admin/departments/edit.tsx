import { EditView, EditViewHeader } from '@/components/refine-ui/views/edit-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { departmentSchema } from '@/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@refinedev/react-hook-form';
import React, { useEffect } from 'react'
import { useParams } from 'react-router'
import z from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNotification } from '@refinedev/core';

const EditDepartments = () => {
  const {id} = useParams();
  const {open} = useNotification();

  // When more fields are added to department, this will need an edit department schema
  const form = useForm({
    resolver: zodResolver(departmentSchema),
    refineCoreProps: {
      resource: "departments", 
      action: "edit", 
      id: id, 
      meta: {path: "admin/departments"}, 
    }, 
    defaultValues: {
      name: "", 
    }
  });

  const {
    refineCore: {onFinish, query}, 
    handleSubmit, 
    formState: {isSubmitting}, 
    control, 
    reset
  } = form;

  useEffect(() => {
    const department = query?.data?.data;
    if(!department) return;
    reset({
      name: department.name ?? "", 
    })
  }, [query?.data?.data, reset]);

  const onSubmit = async (values: z.infer<typeof departmentSchema>) => {
    try {
      await onFinish(values);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as {message?:string})?.message ?? String(error)
      open?.({
        type: "error", 
        message: "There was an error editing the department: " + message , 
      })
    }
  }

  return (
    <EditView>
      <EditViewHeader resource='departments' title="Edit Department"/>
      <Separator />

      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Card>
          <CardHeader className='flex flex-row items-center justify-between gap-4'>
            <div className="space-y-1">
              <CardTitle className='text-xl'>Department Info</CardTitle>
              <div className="text-sm text-muted-foreground">
                Update the Departments information
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                <FormField 
                  control={control}
                  name = "name"
                  render = {({field}) => (
                    <FormItem>
                      <FormLabel>Department Name</FormLabel>
                      <FormControl>
                        <Input {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Saving Changes" : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </EditView>
  )
}

export default EditDepartments
