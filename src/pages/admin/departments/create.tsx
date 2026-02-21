import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb'
import { CreateView } from '@/components/refine-ui/views/create-view'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useBack, useNotification } from '@refinedev/core'
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import z from 'zod'
import { useForm } from '@refinedev/react-hook-form'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { departmentSchema } from '@/lib/schema'

const DepartmentsCreate = () => {
  const back = useBack();
  const {open} = useNotification();

  const form = useForm({
    resolver: zodResolver(departmentSchema), 
    refineCoreProps: {
      resource: "departments", 
      action: "create", 
    }, 
    defaultValues: {
      name: "", 
    }
  });

  const {
    refineCore: {onFinish}, 
    handleSubmit, 
    formState: {isSubmitting},
    control, 
  } = form;

  const onSubmit = async (values: z.infer<typeof departmentSchema>) => {
    try {
      await onFinish(values);
    } catch (error) {
      open?.({
        type: "error", 
        message: "There was an error creating the department: " + error , 
      })
    }
  }
  return (
    <CreateView>
      <Breadcrumb />

      <h1 className="page-title">Create a Department</h1>
      <div className="intro-row">
        <p>Provide the required information to create a departmnet below.</p>
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
                      <FormLabel>Department Name <span className='text-red-400'>*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Mathematics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                
                />
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="flex gap-1">
                        <span>Creating Department...</span>
                        <Loader2 className="inline-block ml-2 animate-spin" />
                      </div>
                    ) : (
                      "Create Department"
                    )}
                  </Button>
              </form>

            </Form>
          </CardContent>
        </Card>
        

      </div>

    </CreateView>
  )
}

export default DepartmentsCreate
