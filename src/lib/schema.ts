import * as z from "zod";

export const termSchema = z.object({
    termName: z.string().min(1, "Name is required"),
    startDate: z.date(), 
    endDate: z.date(),
}).refine((d) => d.startDate <= d.endDate, {
  message: "Start date must be before end date",
  path: ["startDate"],
});