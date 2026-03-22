import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { editAssignmentSchema } from "@/lib/schema";
import { cn, formatDate, toDateOnlyString } from "@/lib/utils";
import { ASSIGNMENT_TYPE } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { HttpError, useGo, useNotification } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import {
  BookOpen,
  CalendarIcon,
  FileText,
  Layers3,
  Save,
} from "lucide-react";
import React from "react";
import { useParams } from "react-router";
import { z } from "zod";



const EditAssignment = () => {
  const { id } = useParams();
  const go = useGo();
  const { open } = useNotification();

  const form = useForm({
    resolver: zodResolver(editAssignmentSchema),
    refineCoreProps: {
      resource: "assignments",
      action: "edit",
      id,
      meta: {
        path: "teacher/assignments",
      },
      redirect: false,
    },
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      pointsPossible: 10,
      type: ASSIGNMENT_TYPE[0],
      allSections: false,
    },
  });

  const {
    refineCore: { onFinish, query },
    control,
    watch,
    handleSubmit,
    formState: { isSubmitting, isDirty},
  } = form;

  const assignment = query?.data?.data;
  const isLoading = query?.isLoading;
  const isError = query?.isError;

  const hasLinkedAssignments = Boolean(assignment?.assignmentGroupId);

  const title = watch("title");
  const type = watch("type");
  const dueDate = watch("dueDate");
  const pointsPossible = watch("pointsPossible");
  const allSections = watch("allSections");

  if(!id) return null;

  const onSubmit = async (values: z.infer<typeof editAssignmentSchema>) => {
    try {
      await onFinish({
        title: values.title,
        description: values.description,
        dueDate: values.dueDate,
        pointsPossible: values.pointsPossible,
        type: values.type,
        allSections: hasLinkedAssignments ? values.allSections : false,
      });

      open?.({
        type: "success",
        message:
          hasLinkedAssignments && values.allSections
            ? "Assignment updated across all linked sections"
            : "Assignment updated successfully",
      });

      go({
        to: {
          resource: "assignments",
          action: "show",
          id,
        },
        type: "replace",
      });
    } catch (error) {
      const err = error as HttpError;

      open?.({
        type: "error",
        message: err?.message ?? "There was an error updating the assignment",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Breadcrumb />

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Edit Assignment</h1>
            <p className="text-sm text-muted-foreground">
              Update the assignment details below. Assigned sections cannot be changed after creation.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Loading assignment...
          </CardContent>
        </Card>
      ) : isError ? (
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Failed to load assignment.
          </CardContent>
        </Card>
      ) : !assignment ? (
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Assignment not found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="overflow-hidden rounded-2xl border shadow-sm">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-2xl font-semibold">
                Assignment Details
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <div className="space-y-5">
                    <FormField
                      control={control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              className="h-11 rounded-xl"
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
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value ?? ""}
                              className="min-h-32 rounded-xl"
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
                            <FormLabel>Type</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl cursor-pointer w-full">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ASSIGNMENT_TYPE.map((assignmentType) => (
                                  <SelectItem
                                    key={assignmentType}
                                    value={assignmentType}
                                  >
                                    {assignmentType}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                      "h-11 w-full justify-start rounded-xl text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? formatDate(field.value) : "Pick a date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-60" />
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
                                    if (!date) return;
                                    field.onChange(toDateOnlyString(date));
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
                            <FormLabel>Points Possible</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                type="number"
                                min={1}
                                step={1}
                                className="h-11 rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {hasLinkedAssignments && (
                    <>
                      <Separator />

                      <FormField
                        control={control}
                        name="allSections"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-2xl border p-4">
                            <div className="space-y-1 pr-4">
                              <FormLabel className="text-sm font-medium">
                                Apply changes to all linked sections
                              </FormLabel>
                              <FormDescription>
                                This assignment belongs to a linked assignment group.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <Separator />

                  <div className="space-y-5">
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold">Assigned Sections</h2>
                      <p className="text-sm text-muted-foreground">
                        These sections are read-only and cannot be changed here.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      {hasLinkedAssignments && allSections
                        ? "Saving will update all linked assignments."
                        : "Saving will update only this assignment."}
                    </p>

                    <Button
                      type="submit"
                      size="lg"
                      className="min-w-[190px] rounded-xl"
                      disabled={isSubmitting || !isDirty}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Saving Changes..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-2xl border shadow-sm xl:sticky xl:top-6">
              <CardHeader className="border-b">
                <CardTitle className="text-base">Assignment Summary</CardTitle>
              </CardHeader>

              <CardContent className="space-y-5 p-5 text-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-muted p-2">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Title</p>
                    <p className="font-medium">{title || "Untitled assignment"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-muted p-2">
                    <Layers3 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">{type || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-muted p-2">
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">
                      {dueDate ? formatDate(dueDate) : "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-muted p-2">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Points</p>
                    <p className="font-medium">{pointsPossible || 0}</p>
                  </div>
                </div>

                {hasLinkedAssignments && (
                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <p className="text-sm font-medium">
                      {allSections
                        ? "This edit will apply to all linked sections."
                        : "This edit will apply only to this assignment."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditAssignment;