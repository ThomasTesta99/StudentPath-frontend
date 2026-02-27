import * as z from "zod";

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
  name: z.string().min(2, "Department name must be at least 2 characters").optional(), 
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
})