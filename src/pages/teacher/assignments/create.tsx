import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb'
import { CreateView } from '@/components/refine-ui/views/create-view'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { assignmentSchema } from '@/lib/schema'
import { cn, formatDate, toDateOnlyString } from '@/lib/utils'
import { ASSIGNMENT_TYPE, Section, TeacherCourseRow } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { HttpError, useList, useNotification } from '@refinedev/core'
import { useForm } from '@refinedev/react-hook-form'
import { BookOpen, CalendarIcon, Layers3, Users } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import z from 'zod'

type AssignmentFormValues = z.infer<typeof assignmentSchema>

const selectionCardClass = (checked: boolean) =>
  cn(
    'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all',
    checked
      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
      : 'hover:border-primary/40 hover:bg-muted/40'
  )

const CreateAssignment = () => {
  const [searchParams] = useSearchParams()
  const prefilledCourseId = searchParams.get('courseId') ?? ''
  const prefilledSectionId = searchParams.get('sectionId') ?? ''

  const [selectedCourseId, setSelectedCourseId] = useState(prefilledCourseId)

  const { open } = useNotification()

  const hasPrefilledCourse = prefilledCourseId !== ''
  const shouldShowCoursePicker = !hasPrefilledCourse
  const shouldFetchCourses = !hasPrefilledCourse
  const shouldFetchSections = selectedCourseId !== ''

  const form = useForm({
      resolver: zodResolver(assignmentSchema),
      refineCoreProps: {
          resource: 'assignments',
          action: 'create',
          meta: { path: 'teacher/assignments' },
      },
      defaultValues: {
          title: '',
          description: '',
          dueDate: '',
          pointsPossible: 10,
          type: ASSIGNMENT_TYPE[0],
          sectionIds: prefilledSectionId ? [prefilledSectionId] : [],
      },
  })

  const {
      refineCore: { onFinish },
      control,
      watch,
      setValue,
      getValues,
      formState: { isSubmitting },
      handleSubmit,
  } = form

  const selectedSectionIds = watch('sectionIds')
  const dueDate = watch('dueDate')
  const assignmentType = watch('type')
  const pointsPossible = watch('pointsPossible')

  const { query: coursesQuery } = useList<TeacherCourseRow>({
      resource: 'courses',
      meta: { path: 'teacher/courses' },
      pagination: { mode: 'off' },
      queryOptions: {
          enabled: shouldFetchCourses,
      },
  })

  const courses = useMemo(() => coursesQuery.data?.data ?? [], [coursesQuery.data?.data])

  const { query: sectionsQuery } = useList<Section>({
      resource: 'classes',
      meta: { path: `teacher/courses/${selectedCourseId}/sections` },
      pagination: { mode: 'off' },
      queryOptions: {
          enabled: shouldFetchSections,
      },
  })

  const sections = useMemo(() => sectionsQuery.data?.data ?? [], [sectionsQuery.data?.data])

  const selectedCourse = useMemo(() => {
      if (hasPrefilledCourse && sections.length > 0) {
          return sections[0]?.course
      }

      return courses.find((course) => course.id === selectedCourseId) ?? null
  }, [courses, selectedCourseId, hasPrefilledCourse, sections])

  useEffect(() => {
      if (!selectedCourseId) {
          setValue('sectionIds', [])
          return
      }

      const currentSectionIds = getValues('sectionIds')
      const validSectionIds = currentSectionIds.filter((id) =>
          sections.some((section) => section.id === id)
      )

      if (validSectionIds.length !== currentSectionIds.length) {
          setValue('sectionIds', validSectionIds)
      }
  }, [selectedCourseId, sections, getValues, setValue])

  const onSubmit = async (values: AssignmentFormValues) => {
      try {
          await onFinish(values)
      } catch (error) {
          const err = error as HttpError
          open?.({
              type: 'error',
              message: err?.message
                  ? `There was an error creating the assignment: ${err.message}`
                  : 'There was an error creating the assignment',
          })
      }
  }

  return (
    <CreateView>
        <div className="space-y-3">
            <Breadcrumb />

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Create Assignment</h1>
                    <p className="text-sm text-muted-foreground">
                        Create an assignment for one or more sections within the same course.
                    </p>
                </div>
            </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="overflow-hidden rounded-2xl border shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="text-2xl font-semibold">Assignment Details</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Fill out the information below and choose which sections should receive it.
                    </p>
                </CardHeader>

                <CardContent className="p-6">
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <h2 className="text-lg font-semibold">Basic Information</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Set the title, description, type, due date, and points possible.
                                    </p>
                                </div>

                                <FormField
                                    control={control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Title <span className="text-red-400">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="h-11 rounded-xl"
                                                    placeholder="Homework #1"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Description <span className="text-red-400">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="min-h-32 rounded-xl"
                                                    placeholder="Write your assignment description here..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <FormField
                                        control={control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Assignment Type <span className="text-red-400">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger className="h-11 w-full items-center rounded-xl cursor-pointer [&>span]:truncate [&>span]:leading-none">
                                                            <SelectValue placeholder="Select assignment type" />
                                                        </SelectTrigger>

                                                        <SelectContent>
                                                            {ASSIGNMENT_TYPE.map((type) => (
                                                                <SelectItem
                                                                    key={type}
                                                                    value={type}
                                                                    className="cursor-pointer"
                                                                >
                                                                    {type}
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
                                        name="dueDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Due Date <span className="text-red-400">*</span>
                                                </FormLabel>

                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className={cn(
                                                                    'w-full justify-start items-center rounded-xl text-left font-normal',
                                                                    !field.value && 'text-muted-foreground'
                                                                )}
                                                            >
                                                                {field.value
                                                                    ? formatDate(field.value)
                                                                    : 'Pick a date'}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>

                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                field.value
                                                                    ? new Date(`${field.value}T00:00:00`)
                                                                    : undefined
                                                            }
                                                            onSelect={(date) => {
                                                                if (!date) return
                                                                field.onChange(toDateOnlyString(date))
                                                            }}
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
                                        name="pointsPossible"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Points Possible <span className="text-red-400">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="rounded-xl"
                                                        type="number"
                                                        min={1}
                                                        step={1}
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <h2 className="text-lg font-semibold">Course and Sections</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Choose a course first, then select one or more sections.
                                    </p>
                                </div>

                                {shouldShowCoursePicker && (
                                    <div className="space-y-3">
                                        <FormLabel>
                                            Courses <span className="text-red-400">*</span>
                                        </FormLabel>

                                        <div className="rounded-2xl border bg-background p-4">
                                            {coursesQuery.isLoading ? (
                                                <p className="text-sm text-muted-foreground">
                                                    Loading courses...
                                                </p>
                                            ) : coursesQuery.isError ? (
                                                <p className="text-sm text-muted-foreground">
                                                    Failed to load courses.
                                                </p>
                                            ) : courses.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">
                                                    No courses available.
                                                </p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {courses.map((course) => {
                                                        const checked = selectedCourseId === course.id

                                                        return (
                                                            <label
                                                                key={course.id}
                                                                className={selectionCardClass(checked)}
                                                            >
                                                                <Checkbox
                                                                    checked={checked}
                                                                    onCheckedChange={(isChecked) => {
                                                                        if (isChecked) {
                                                                            setSelectedCourseId(course.id)
                                                                            setValue('sectionIds', [])
                                                                        } else {
                                                                            setSelectedCourseId('')
                                                                            setValue('sectionIds', [])
                                                                        }
                                                                    }}
                                                                    className="mt-0.5"
                                                                />

                                                                <div className="min-w-0 space-y-1">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <p className="font-medium">
                                                                            {course.name}
                                                                        </p>
                                                                        {course.code && (
                                                                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                                                {course.code}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                                        <p>
                                                                            Grade level:{' '}
                                                                            {course.gradeLevel ?? '—'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <FormField
                                    control={control}
                                    name="sectionIds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Sections <span className="text-red-400">*</span>
                                            </FormLabel>

                                            <div className="rounded-2xl border bg-background p-4">
                                                {!selectedCourseId ? (
                                                    <p className="text-sm text-muted-foreground">
                                                        Select a course first.
                                                    </p>
                                                ) : sectionsQuery.isLoading ? (
                                                    <p className="text-sm text-muted-foreground">
                                                        Loading sections...
                                                    </p>
                                                ) : sectionsQuery.isError ? (
                                                    <p className="text-sm text-muted-foreground">
                                                        Failed to load sections for this course.
                                                    </p>
                                                ) : sections.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">
                                                        No sections available for this course.
                                                    </p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {sections.map((section) => {
                                                          const checked = field.value.includes(section.id)

                                                          return (
                                                            <label
                                                              key={section.id}
                                                              className={selectionCardClass(checked)}
                                                            >
                                                              <Checkbox
                                                                checked={checked}
                                                                onCheckedChange={(isChecked) => {
                                                                  if (isChecked) {
                                                                    field.onChange([
                                                                      ...field.value,
                                                                      section.id,
                                                                    ])
                                                                  } else {
                                                                    field.onChange(
                                                                      field.value.filter((id) => id !== section.id)
                                                                    )
                                                                  }
                                                                }}
                                                                className="mt-1"
                                                              />

                                                              <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                                                                <div className="min-w-0 space-y-3">
                                                                  <div className="space-y-1">
                                                                    <p className="text-base font-semibold">
                                                                      {section.sectionLabel || 'Section'}
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                      {section.course?.name ?? '—'}
                                                                    </p>
                                                                  </div>

                                                                  <div className="grid grid-cols-1 gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                                                                    <p>
                                                                      <span className="font-medium text-foreground">Room:</span>{' '}
                                                                      {section.roomNumber ?? '—'}
                                                                    </p>
                                                                    <p>
                                                                      <span className="font-medium text-foreground">Students:</span>{' '}
                                                                      {section.enrolledCount ?? 0}
                                                                    </p>
                                                                    <p>
                                                                      <span className="font-medium text-foreground">Term:</span>{' '}
                                                                      {section.term?.termName ?? '—'}
                                                                    </p>
                                                                    <p>
                                                                      <span className="font-medium text-foreground">Course:</span>{' '}
                                                                      {section.course?.name ?? '—'}
                                                                    </p>
                                                                  </div>
                                                                </div>

                                                                <div className="shrink-0">
                                                                  {section.period?.number != null ? (
                                                                    <div
                                                                      className={cn(
                                                                        'flex min-w-[84px] flex-col items-center rounded-2xl border px-4 py-3 text-center shadow-sm',
                                                                        checked
                                                                          ? 'border-primary/30 bg-primary/10'
                                                                          : 'border-border bg-muted/50'
                                                                      )}
                                                                    >
                                                                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                                        Period
                                                                      </span>
                                                                      <span className="text-2xl font-bold leading-none text-foreground">
                                                                        {section.period.number}
                                                                      </span>
                                                                    </div>
                                                                  ) : (
                                                                    <div className="rounded-2xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                                                                      No period
                                                                    </div>
                                                                  )}
                                                                </div>
                                                              </div>
                                                            </label>
                                                          )
                                                      })}
                                                    </div>
                                                )}
                                            </div>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Review the assignment details before creating it.
                                </p>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="min-w-[180px] rounded-xl"
                                    disabled={
                                        isSubmitting ||
                                        !selectedCourseId ||
                                        selectedSectionIds.length === 0
                                    }
                                >
                                    {isSubmitting ? 'Creating Assignment...' : 'Create Assignment'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="rounded-2xl border shadow-sm lg:sticky lg:top-6">
                    <CardHeader className="border-b">
                        <CardTitle className="text-base">Assignment Summary</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-5 p-5 text-sm">
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-muted p-2">
                                <BookOpen className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Selected course</p>
                                <p className="font-medium">
                                    {selectedCourse?.name ?? 'None selected'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-muted p-2">
                                <Layers3 className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Assignment type</p>
                                <p className="font-medium">{assignmentType || '—'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-muted p-2">
                                <CalendarIcon className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Due date</p>
                                <p className="font-medium">
                                    {dueDate ? formatDate(dueDate) : 'Not set'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-muted p-2">
                                <Users className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Selected sections</p>
                                <p className="font-medium">{selectedSectionIds.length}</p>
                            </div>
                        </div>

                        <div className="space-y-1 border-t pt-4">
                            <p className="text-muted-foreground">Points possible</p>
                            <p className="font-medium">{pointsPossible || 0}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </CreateView>
  )
}

export default CreateAssignment