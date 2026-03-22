import * as z from "zod";
import { isStrictIsoDate } from "./utils";
import { ASSIGNMENT_TYPE } from "@/types";

export const termSchema = z.object({
    termName: z.string().min(1, "Name is required"),
    startDate: z.date(), 
    endDate: z.date(),
}).refine((d) => d.startDate < d.endDate, {
  message: "Start date must be before end date",
  path: ["startDate"],
});

export const editTermSchema = z.object({
  termName: z.string().optional(), 
  startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
}).refine(
    (d) => {
      if (!d.startDate || !d.endDate) return true;
      return d.startDate < d.endDate;
    },
    {
      message: "Start date must be before (or the same as) end date",
      path: ["startDate"],
    }
  );

export const departmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  code: z.string().trim()
    .toUpperCase()
    .length(3, "Department code must be exactly 3 characters")
    .regex(/^[A-Z]{3}$/, "Department code must contain only 3 letters")
});

export const editDepartmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters").optional(),
  code: z.string().trim()
    .toUpperCase()
    .length(3, "Department code must be exactly 3 characters")
    .regex(/^[A-Z]{3}$/, "Department code must contain only 3 letters")
    .optional(),
});

export const teacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export const editTeacherSchema = z.object({
  name: z.string().optional(), 
  email: z.string().email().optional(), 
});

const dobSchema = z
  .string()
  .min(1, "Date of birth is required")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format")
  .refine((value) => isStrictIsoDate(value), {
    message: "Date of birth must be a valid date",
  });

export const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  osis: z.string().regex(/^\d{9}$/, "OSIS must be exactly 9 digits"),
  gradeLevel: z.string().min(1, "Grade level is required").max(2, "Must be a valid grade level"),
  dob: dobSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});;

export const editStudentSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email").optional(),
  osis: z.string().regex(/^\d{9}$/, "OSIS must be exactly 9 digits").optional(),
  gradeLevel: z.string().min(1, "Grade level is required").max(2, "Must be a valid grade level").optional(),
  dob: dobSchema.optional(),
});

export const parentsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export const editParentSchema = z.object({
  name: z.string().optional(), 
  email: z.string().email().optional(), 
});

export const courseSchema = z.object({
  name: z.string().min(2, "Course name must be at least 2 characters"),
  gradeLevel: z.string().min(1, "Grade level is required"), 
  departmentId: z.string().min(1, "Department is required"), 
  courseNumber: z.string().trim().min(1, "Course number is required"),
  code: z.string().optional(),
  description: z.string().trim().min(1, "Description is required"), 
})

export const editCourseSchema = z.object({
  name: z.string().min(2, "Course name must be at least 2 characters").optional(),
  gradeLevel: z.string().min(1, "Grade level is required").optional(), 
  departmentId: z.string().min(1, "Department is required").optional(), 
  courseNumber: z.string().trim().min(1, "Course number is required").optional(),
  code: z.string().optional(),
  description: z.string().trim().min(1, "Description is required").optional(), 
})

export const bellScheduleSchema = z.object({
  name: z.string().trim().min(1, "Schedule name is required").max(100, "Schedule name must be 100 characters or less"),
  type: z.string().trim().optional(),
  dayStartTime: z.string().trim().min(1, "Day start time is required"),
  dayEndTime: z.string().trim().min(1, "Day end time is required"),
})
.refine(
  (data) => data.dayEndTime > data.dayStartTime,
  {
    message: "Day end time must be after day start time",
    path: ["dayEndTime"],
  }
);

export const periodSchema = z.object({
    number: z.coerce
      .number({
        required_error: "Period number is required",
        invalid_type_error: "Period number must be a number",
      })
      .int("Period number must be a whole number")
      .positive("Period number must be greater than 0"),

    startTime: z
      .string({
        required_error: "Start time is required",
      })
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
        "Start time must be in HH:MM or HH:MM:SS format"
      ),

    endTime: z
      .string({
        required_error: "End time is required",
      })
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
        "End time must be in HH:MM or HH:MM:SS format"
      ),
  })
  .refine(
    (data) => data.startTime < data.endTime,
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );


export const sectionSchema = z.object({
  termId: z.string().min(1, "Term is required"), 
  courseId: z.string().min(1, "Course is required"), 
  periodId: z.string().min(1, "Period is required"), 
  teacherId: z.string().min(1, "Teacher is required"), 
  sectionLabel: z.string().min(3, "Section label must be at least 3 characters"), 
  capacity: z.coerce.number({required_error: "Capacity is required", invalid_type_error: "Capacity must be a number"}).int("Capacity must be a whole number").positive("Capacity must be greater than 0"),
  roomNumber: z.string().optional(),
});

export const editSectionSchema = z.object({
  termId: z.string().min(1, "Term is required").optional(), 
  courseId: z.string().min(1, "Course is required").optional(), 
  periodId: z.string().min(1, "Period is requried").optional(), 
  teacherId: z.string().min(1, "Teacher is required").optional(), 
  sectionLabel: z.string().min(3, "Section label must be at least 3 characters").optional(), 
  capacity: z.coerce.number({required_error: "Capacity is required", invalid_type_error: "Capacity must be a number"}).int("Capacity must be a whole number").positive("Capacity must be greater than 0").optional(),
  roomNumber: z.string().optional(),
})

export const assignmentSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Due date must be in YYYY-MM-DD format",
    })
    .refine((value) => {
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    }, {
      message: "Due date must be a valid date",
    }),
  pointsPossible: z.coerce
    .number({
      required_error: "Points possible required",
      invalid_type_error: "Points possible must be a number",
    })
    .int("Points possible must be a whole number")
    .positive("Points possible must be greater than 0"),
  type: z.enum(ASSIGNMENT_TYPE, {
    errorMap: () => ({ message: "Assignment type is required" }),
  }),
  sectionIds: z
    .array(z.string().min(1, "Section id is required"))
    .min(1, "At least one section must be selected"),
});

export const editAssignmentSchema = assignmentSchema
  .omit({
    sectionIds: true,
  })
  .extend({
    allSections: z.boolean(),
  });