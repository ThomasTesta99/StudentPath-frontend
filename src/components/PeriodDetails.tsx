import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Clock3, Plus } from 'lucide-react'
import { useCustom, useNotification } from '@refinedev/core'
import { Period } from '@/types'
import { BACKEND_BASE_URL } from '@/constants'
import { useForm } from '@refinedev/react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { periodSchema } from '@/lib/schema'
import z from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { DeleteButton } from './refine-ui/buttons/delete'
import { formatTime } from '@/lib/utils'

const PeriodDetails = () => {
    const [createPeriodOpen, setCreatePeriodOpen] = useState(false);
    const {open} = useNotification();
    const {query: periodsQuery} = useCustom<{data: Period[]}>({
        url: `${BACKEND_BASE_URL}/admin/bell-schedule/periods`,
        method: "get", 
    });

    const form = useForm({
        resolver: zodResolver(periodSchema),
        refineCoreProps: {
            resource: "bell-schedule", 
            action: "create", 
            meta: {path: "admin/bell-schedule/period"}
        },
        defaultValues: {
            number: 1, 
            startTime: "", 
            endTime: "", 
        }
    });

    const {
        refineCore: {onFinish},
        control,
        formState: {isSubmitting}, 
        handleSubmit, 
    } = form;

    const periods = periodsQuery.data?.data.data;

    const onSubmit = async (values: z.infer<typeof periodSchema>) => {
        try {
            await onFinish(values);
            setCreatePeriodOpen(false);
            periodsQuery.refetch();
        } catch {
            open?.({
                type: "error", 
                message: "There was an error creating the period"
            })
        }
    }

    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock3 className="h-5 w-5" />
                    Periods
                </CardTitle>
                <CardDescription>
                    Manage instructional periods for the current bell schedule.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {periodsQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading periods...</p>
                ) : periods?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No periods have been added yet.
                    </p>
                ) : (
                    <div className="space-y-3 max-h-[34rem] overflow-y-auto pr-2">
                        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                            <p className="text-sm font-medium">
                                {periods?.length ?? 0} period{periods?.length === 1 ? "" : "s"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Current bell schedule
                            </p>
                        </div>

                        {periods?.map((period) => (
                            <div
                                key={period.id}
                                className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-muted/40 overflow-y-auto"
                            >
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                    {period.number}
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">Period {period.number}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatTime(period.startTime)} - {formatTime(period.endTime)}
                                    </p>
                                </div>
                            </div>

                            <DeleteButton
                                resource="admin/bell-schedule/period"
                                recordItemId={period.id}
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer text-muted-foreground hover:text-destructive"
                                onSuccess={() => {
                                    periodsQuery.refetch();
                                }}
                            />
                            </div>
                        ))}
                    </div>
                )}
                <Dialog open={createPeriodOpen} onOpenChange={setCreatePeriodOpen}>
                    <DialogTrigger asChild>
                        <Button className='w-full' variant="outline">
                            <Plus className='mr-2 h-4 w-4' />
                            Add Period
                        </Button>
                    </DialogTrigger>
                    <DialogContent className='[&>button]:cursor-pointer'>
                        <DialogHeader>
                            <DialogTitle>Create Period</DialogTitle>
                            <DialogDescription>
                                Add a new period to the current bell schedule.
                            </DialogDescription>
                        </DialogHeader>
                        <Separator />

                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                                <FormField
                                    control={control}
                                    name="number"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Period Number <span className="text-red-400">*</span></FormLabel>
                                            <FormControl>
                                                <Input type='number' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="startTime"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Start Time <span className="text-red-400">*</span></FormLabel>
                                            <FormControl>
                                                <Input type='time' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="endTime"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel> End Time <span className="text-red-400">*</span></FormLabel>
                                            <FormControl>
                                                <Input type='time' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type='submit' disabled={isSubmitting} className='w-full'>
                                    {isSubmitting ? "Creating Period..." : "Create Period"}
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}

export default PeriodDetails
