import { z } from "zod";

export const ApplicationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  company_id: z.string(),
  company_name: z.string(),
  company_location: z.string().nullable(),
  role_title: z.string(),
  job_link: z.string().nullable(),
  source: z.string().nullable(),
  status: z.enum([
    "APPLIED",
    "SHORTLISTED",
    "INTERVIEWING",
    "OFFER",
    "REJECTED",
    "WITHDRAWN",
  ]),
  general_notes: z.string().optional().nullable(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).nullable(),
  applied_date: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const AddApplicationSchema = z.object({
  user_id: z.string(),
  company_name: z.string().min(1, "Company name is required"),
  role_title: z.string().min(1, "Role title is required"),
  job_link: z.string().url().optional().or(z.literal("")),
  source: z.string().optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  status: z
    .enum([
      "APPLIED",
      "SHORTLISTED",
      "INTERVIEWING",
      "OFFER",
      "REJECTED",
      "WITHDRAWN",
    ])
    .default("APPLIED"),
  general_notes: z.string().optional(),
});

export const UpdateApplicationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  role_title: z.string(),
  job_link: z.string().nullable(),
  status: z.enum([
    "APPLIED",
    "SHORTLISTED",
    "INTERVIEWING",
    "OFFER",
    "REJECTED",
    "WITHDRAWN",
  ]),
  general_notes: z.string().optional().nullable(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).nullable(),
});

export const ApplicationRoundSchema = z.object({
  id: z.string(),
  application_id: z.string(),
  round_number: z.number(),
  round_type: z.string(),
  interview_date: z.date().nullable(),
  interviewer_name: z.string().nullable(),
  meeting_link: z.string().nullable(),
  result: z.enum(["PASSED", "FAILED", "PENDING", "SKIPPED"]),
  feedback_received: z.string().nullable(),
  questions_asked: z.string().nullable(),
  personal_notes: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const ApplicationHistoryItem = z.object({
  id: z.string(),
  job_application_id: z.string(),
  previous_status: z.string().nullable(),
  new_status: z.string().nullable(),
  notes: z.string().nullable(),
  changed_at: z.date(),
});

export const ApplicationWithRoundsSchema = z.object({
  application: ApplicationSchema,
  history: z.array(ApplicationHistoryItem),
  rounds: z.array(ApplicationRoundSchema),
});

export const ApplicationsPaginatedSchema = z.object({
  items: z.array(ApplicationSchema),
  total: z.number(),
});

export const AnalyticsDataSchema = z.object({
  dailyTrend: z.array(
    z.object({
      date: z.string(),
      count: z.number(),
    })
  ),
  statusDistribution: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
      color: z.string(),
    })
  ),
});

export const StatsSchema = z.object({
  total_applications: z.number(),
  active_interviews: z.number(),
  offers: z.number(),
  rejections: z.number(),
});

export const UpdateInterviewRoundSchema = ApplicationRoundSchema.pick({
  id: true,
  result: true,
  interview_date: true,
  interviewer_name: true,
  meeting_link: true,
  feedback_received: true,
  questions_asked: true,
  personal_notes: true,
});

export const AddCompanySchema = z.object({
  user_id: z.string(),
  name: z.string().min(1, "Company name is required"),
  career_page_url: z.string().url().optional().or(z.literal("")),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateCompanySchema = z.object({
  user_id: z.string(),
  company_id: z.string(),
  name: z.string().optional(),
  career_page_url: z.string().url().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});
