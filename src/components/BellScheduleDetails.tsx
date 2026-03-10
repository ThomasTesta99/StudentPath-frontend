import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { CalendarDays, Plus } from 'lucide-react'
import { useCustom, useNotification } from '@refinedev/core'
import { BELL_SCHEDULE_TYPE_OPTIONS, BellSchedule } from '@/types'
import { BACKEND_BASE_URL } from '@/constants'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { useForm } from '@refinedev/react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bellScheduleSchema } from '@/lib/schema'
import z from 'zod'
import { Separator } from './ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { formatTime } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { DeleteButton } from './refine-ui/buttons/delete'

const getBellScheduleTypeLabel = (type?: string) => {
    return BELL_SCHEDULE_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
}

const BellScheduleDetails = () => {
    const [createScheduleOpen, setCreateScheduleOpen] = useState(false);
    const {open} = useNotification();

    const { query: bellScheduleQuery } = useCustom<{ data: BellSchedule }>({
        url: `${BACKEND_BASE_URL}/admin/bell-schedule`,
        method: 'get',
    })

    const bellSchedule = bellScheduleQuery.data?.data.data
    const isLoading = bellScheduleQuery.isLoading
    const isError = bellScheduleQuery.isError
    const hasSchedule = !!bellSchedule

    let message = ''
    if (isLoading) {
        message = 'Loading bell schedule...'
    } else if (isError) {
        message = 'Failed to get bell schedule.'
    } else if (!hasSchedule) {
        message = 'No bell schedule has been created yet.'
    }

    const form = useForm({
        resolver: zodResolver(bellScheduleSchema),
        refineCoreProps: {
            resource: "bell-schedule", 
            action: "create",
            meta: {path: "admin/bell-schedule"}
        },
        defaultValues: {
            name: "", 
            type: "", 
            dayStartTime: "",
            dayEndTime: "", 
        }
    })

    const {
        refineCore: {onFinish}, 
        control, 
        formState: {isSubmitting}, 
        handleSubmit, 
    } = form;

    const onSubmit = async (values: z.infer<typeof bellScheduleSchema>) => {
        try {
            await onFinish(values);
            setCreateScheduleOpen(false);
            bellScheduleQuery.refetch();
        } catch {
            open?.({
                type: "error", 
                message: "There was an error creating the bell schedule"
            })
        }
    }

    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarDays />
                    <h1>Bell Schedule</h1>
                </CardTitle>
                <CardDescription>
                    View the current bell schedule or create a new one
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {!hasSchedule && (
                    <p className="text-sm text-muted-foreground">{message}</p>
                )}

                {hasSchedule && (
                    <div className="grid grid-cols-2 rounded-lg border p-4">
                        <div className="space-y-3">
                        <div>
                            <p className="text-medium font-semibold">Name</p>
                            <p className="text-sm text-muted-foreground">{bellSchedule.name}</p>
                        </div>
                        <div>
                            <p className="text-medium font-semibold">Type</p>
                            <p className="text-sm text-muted-foreground">
                            {getBellScheduleTypeLabel(bellSchedule.type)}
                            </p>
                        </div>
                        <div>
                            <p className="text-medium font-semibold">Day Start</p>
                            <p className="text-sm text-muted-foreground">
                            {formatTime(bellSchedule.dayStartTime)}
                            </p>
                        </div>
                        <div>
                            <p className="text-medium font-semibold">Day End</p>
                            <p className="text-sm text-muted-foreground">
                            {formatTime(bellSchedule.dayEndTime)}
                            </p>
                        </div>
                        </div>

                        <div className="flex justify-end items-start">
                            <DeleteButton 
                                resource='admin/bell-schedule'
                                recordItemId={bellSchedule.id}
                                onSuccess={() => {
                                    window.location.reload();
                                }}
                            />
                        </div>
                    </div>
                )}
                {!isLoading && !isError && !hasSchedule && (
                    <Dialog open={createScheduleOpen} onOpenChange={setCreateScheduleOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                {hasSchedule ? 'Create Bell Schedule' : 'Add Bell Schedule'}
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="[&>button]:cursor-pointer">
                            <DialogHeader>
                                <DialogTitle>Create Bell Schedule</DialogTitle>
                                <DialogDescription>
                                    Add a bell schedule for this school.
                                </DialogDescription>
                            </DialogHeader>

                            <Separator />

                            <Form {...form}>
                                <form onSubmit={handleSubmit(onSubmit)} className='space-y-3'>
                                    <FormField
                                        control={control}
                                        name="name"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Name <span className="text-red-400">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder='Regular-Day' {...field}/>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="type"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Type (Optional)</FormLabel>
                                                <FormControl>
                                                    <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a schedule type" />
                                                        </SelectTrigger>
                                                    </FormControl>

                                                    <SelectContent>
                                                        {BELL_SCHEDULE_TYPE_OPTIONS.map((option) => (
                                                            <SelectItem
                                                                key={option.value}
                                                                value={option.value}
                                                                className='cursor-pointer'
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="dayStartTime"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Day Start Time <span className="text-red-400">*</span></FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field}/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="dayEndTime"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Day End Time <span className="text-red-400">*</span></FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field}/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type='submit'
                                        disabled={isSubmitting}
                                        className="w-full"
                                    >
                                        {isSubmitting ? "Creating bell schedule..." : "Create Bell Schedule"}
                                    </Button>
                                </form>
                            </Form>

                        </DialogContent>
                    </Dialog>
                )}
            </CardContent>
        </Card>
    )
}

export default BellScheduleDetails