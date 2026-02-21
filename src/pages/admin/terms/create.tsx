import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { CreateView } from '@/components/refine-ui/views/create-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBack, useNotification } from '@refinedev/core';
import { zodResolver } from '@hookform/resolvers/zod';
import {useForm} from "@refinedev/react-hook-form"
import { termSchema } from '@/lib/schema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn, formatDate } from '@/lib/utils.ts';
import z from 'zod';

const TermsCreate = () => {
  const back = useBack();
  const {open} = useNotification();

  const form = useForm({
    resolver: zodResolver(termSchema), 
    refineCoreProps: {
      resource: "terms", 
      action: "create",
    },
    defaultValues: {
      termName: "",
      startDate: new Date(),
      endDate: new Date(),
    }
  });

  const {refineCore: {onFinish}, handleSubmit, formState: {isSubmitting}, control} = form;

  const onSubmit = async (values: z.infer<typeof termSchema>) => {
    try {
      await onFinish(values);
    } catch (error) {
      open?.({
        type: "error", 
        message: "There was an error creating the term: " + error , 
      })
    }
  }

  return (
    <CreateView className='class-view'>
      <Breadcrumb />
      
      <h1 className="page-title">Create a Term</h1>
      <div className="intro-row">
        <p>Provide the required information to create a term below.</p>
        <Button onClick={back}>Go Back</Button>
      </div>

      <Separator />

      <div className="my-4 flex items-center">
        <Card className='class-form-card'>
          <CardHeader className='relative z-10'>
            <CardTitle className='text-2xl pb-0 font-bold'>Fill out the form</CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className='mt-7'>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                <FormField 
                  control={control}
                  name="termName"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Term Name <span className='text-red-400'>*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Spring 2026" {...field}/>
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
                        <FormLabel>Start Date <span className='text-red-400'>*</span></FormLabel>
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
                        <FormLabel>End Date <span className='text-red-400'>*</span></FormLabel>
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
                 <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex gap-1">
                      <span>Creating Term...</span>
                      <Loader2 className="inline-block ml-2 animate-spin" />
                    </div>
                  ) : (
                    "Create Term"
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

export default TermsCreate;
