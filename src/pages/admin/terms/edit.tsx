import { EditView, EditViewHeader } from '@/components/refine-ui/views/edit-view'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { editTermSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from '@refinedev/react-hook-form'
import React, { useEffect } from 'react'
import { useParams } from 'react-router'
import z from 'zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn, formatDate } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'

const EditTerm = () => {

  const {id} = useParams();
  
  const form = useForm({
    resolver: zodResolver(editTermSchema), 
    refineCoreProps: {
      resource: "terms", 
      action: "edit",
      id: id,
      meta: { path: "admin/terms" },
    },
    defaultValues: {
      termName: "", 
      startDate: new Date(), 
      endDate: new Date(), 
    }
  })

  const {
    refineCore: {onFinish, query}, 
    handleSubmit, 
    formState: {isSubmitting}, 
    control, 
    reset, 
  } = form;

  useEffect(() => {
    const term = query?.data?.data;
    if(!term) return;
    reset({
      termName: term.termName ?? "", 
      startDate: term.startDate ? new Date(term.startDate) : new Date(), 
      endDate: term.endDate ? new Date(term.endDate) : new Date(), 
    })
  }, [query?.data?.data, reset]);

  const onSubmit = async (values: z.infer<typeof editTermSchema>) => {
    await onFinish(values);
  }

  const term = query?.data?.data;
  const isActive = Boolean(term?.isActive);
  
  return (
    <EditView>
        <EditViewHeader resource='terms' title='Edit Term' />
        <Separator />

        <div className="mx-auto w-full max-w-3xl space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className='text-xl'>Term Info</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Update the term's name and dates. Status is changed from the Term Details page.
                </div>

              </div>
                <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? "Active" : "Inactive"}
                </Badge>
            </CardHeader>
            
            <Separator />

            <CardContent>
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                  <FormField 
                    control={control}
                    name = "termName"
                    render = {({field}) => (
                      <FormItem>
                        <FormLabel>Term Name</FormLabel>
                        <FormControl>
                          <Input {...field}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                    
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField 
                      control={control}
                      name="startDate"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? formatDate(field.value) : "Pick a date"}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => date && field.onChange(date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField 
                      control={control}
                      name="endDate"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? formatDate(field.value) : "Pick a date"}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => date && field.onChange(date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </div>
                  <Button type='submit' disabled={isSubmitting} size="lg" className="w-full">
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

export default EditTerm
