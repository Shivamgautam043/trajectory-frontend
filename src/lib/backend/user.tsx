import { z } from "zod";
import { getPostgresDatabaseManager } from "../../../submodules/submodule-database-manager-postgres/postgresDatabaseManager.server";
import { Result, okResult, errResult } from "../../../submodules/submodule-database-manager-postgres/utilities/errorHandling";
import { User } from "@/utilities/types";

const UserSchema = z.object({
    id: z.string(),
    full_name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    password_hash: z.string(),
});

export async function getUser(): Promise<Result<z.infer<typeof UserSchema>>> {
    const postgresManagerResult = await getPostgresDatabaseManager(null);
    if (!postgresManagerResult.success) {
        return postgresManagerResult;
    }
    const query = `SELECT * FROM public.users`;
    const queryResult = await postgresManagerResult.data.execute(query);
    if (!queryResult.success) {
        return queryResult;
    }
    const rows = (queryResult.data.rows ?? []) as unknown[];
    if (rows.length === 0) {
        return errResult(new Error("No users found"));
    }
    const firstUser = rows[0];
    const parsed = UserSchema.safeParse(firstUser);
    if (!parsed.success) {
        return errResult(new Error("User schema validation failed: " + JSON.stringify(parsed.error.format())));
    }
    return okResult(parsed.data);
}

// ---------by gemini--------------------------------------------------------
// Schema for the Kanban Card (Joined Data)
const KanbanCardSchema = z.object({
    application_id: z.string(),
    company_name: z.string(),
    company_location: z.string().nullable(),
    role_title: z.string(),
    status: z.enum(['APPLIED', 'SHORTLISTED', 'INTERVIEWING', 'OFFER', 'REJECTED', 'WITHDRAWN']),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).nullable(),
    applied_date: z.date(),
    updated_at: z.date(),
});

export const KanbanBoardResponseSchema = z.array(KanbanCardSchema);

export async function getKanbanBoardData(userId: string): Promise<Result<z.infer<typeof KanbanBoardResponseSchema>>> {
    const postgresManagerResult = await getPostgresDatabaseManager(null);
    if (!postgresManagerResult.success) {
        return postgresManagerResult;
    }

    const query = `
    SELECT 
      a.id as application_id,
      c.name as company_name,
      c.location as company_location,
      a.role_title,
      a.status,
      a.priority,
      a.applied_date,
      a.updated_at
    FROM applications a
    JOIN companies c ON a.company_id = c.id
    WHERE a.user_id = $1
    ORDER BY a.updated_at DESC
  `;

    const queryResult = await postgresManagerResult.data.execute(query, [userId]);

    if (!queryResult.success) {
        return queryResult;
    }

    const rows = (queryResult.data.rows ?? []) as unknown[];
    const parsed = KanbanBoardResponseSchema.safeParse(rows);
    if (!parsed.success) {
        return errResult(new Error("Kanban schema validation failed: " + JSON.stringify(parsed.error.format())));
    }

    return okResult(parsed.data);
}

// Schema for Rounds
const RoundSchema = z.object({
    round_number: z.number(),
    round_type: z.string(),
    interview_date: z.date().nullable(),
    result: z.string(), // 'PASSED', 'FAILED', etc.
    feedback_received: z.string().nullable(),
    questions_asked: z.string().nullable()
});

// Schema for Full Details
const ApplicationDetailSchema = z.object({
    application_id: z.string(),
    role_title: z.string(),
    job_link: z.string().nullable(),
    general_notes: z.string().nullable(),
    company_name: z.string(),
    career_page_url: z.string().nullable(),
    rounds: z.array(RoundSchema) // Nested Array of rounds
});

export async function getApplicationDetailsWithRounds(applicationId: string): Promise<Result<z.infer<typeof ApplicationDetailSchema>>> {
    const postgresManagerResult = await getPostgresDatabaseManager(null);
    if (!postgresManagerResult.success) return postgresManagerResult;

    // 1. Fetch Application & Company Metadata
    const appQuery = `
    SELECT 
      a.id as application_id, a.role_title, a.job_link, a.general_notes,
      c.name as company_name, c.career_page_url
    FROM applications a
    JOIN companies c ON a.company_id = c.id
    WHERE a.id = $1
  `;

    // 2. Fetch Rounds
    const roundsQuery = `
    SELECT round_number, round_type, interview_date, result, feedback_received, questions_asked
    FROM interview_rounds
    WHERE job_application_id = $1
    ORDER BY round_number ASC
  `;

    // Parallel Execution
    const [appResult, roundsResult] = await Promise.all([
        postgresManagerResult.data.execute(appQuery, [applicationId]),
        postgresManagerResult.data.execute(roundsQuery, [applicationId])
    ]);

    if (!appResult.success) return appResult;
    if (!roundsResult.success) return roundsResult;

    const appRows = (appResult.data.rows ?? []) as any[];
    const roundRows = (roundsResult.data.rows ?? []) as any[];

    if (appRows.length === 0) return errResult(new Error("Application not found"));

    // Combine Data
    const combinedData = {
        ...appRows[0],
        rounds: roundRows
    };

    const parsed = ApplicationDetailSchema.safeParse(combinedData);
    if (!parsed.success) {
        return errResult(new Error("Detail schema validation failed"));
    }

    return okResult(parsed.data);
}

const StatsSchema = z.object({
    total_applications: z.string(), // SQL Count returns string/bigint usually
    active_interviews: z.string(),
    offers: z.string(),
    rejections: z.string()
});

export async function getDashboardStats(userId: string): Promise<Result<z.infer<typeof StatsSchema>>> {
    const postgresManagerResult = await getPostgresDatabaseManager(null);
    if (!postgresManagerResult.success) return postgresManagerResult;

    // Optimized Aggregation Query
    const query = `
    SELECT
      COUNT(*) as total_applications,
      COUNT(*) FILTER (WHERE status = 'INTERVIEWING') as active_interviews,
      COUNT(*) FILTER (WHERE status = 'OFFER') as offers,
      COUNT(*) FILTER (WHERE status = 'REJECTED') as rejections
    FROM applications
    WHERE user_id = $1
  `;

    const queryResult = await postgresManagerResult.data.execute(query, [userId]);

    if (!queryResult.success) return queryResult;

    const rows = (queryResult.data.rows ?? []) as unknown[];
    const parsed = StatsSchema.safeParse(rows[0]);

    if (!parsed.success) {
        return errResult(new Error("Stats schema validation failed"));
    }

    return okResult(parsed.data);
}

const UpdateRoundInput = z.object({
    round_id: z.string(),
    result: z.enum(['PASSED', 'FAILED', 'PENDING', 'SKIPPED']),
    questions_asked: z.string().optional(),
    feedback_received: z.string().optional()
});

export async function updateRoundResult(input: z.infer<typeof UpdateRoundInput>): Promise<Result<{ success: boolean }>> {
    const postgresManagerResult = await getPostgresDatabaseManager(null);
    if (!postgresManagerResult.success) return postgresManagerResult;

    const query = `
    UPDATE interview_rounds
    SET 
      result = $2,
      questions_asked = COALESCE($3, questions_asked),
      feedback_received = COALESCE($4, feedback_received),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `;

    const queryResult = await postgresManagerResult.data.execute(query, [
        input.round_id,
        input.result,
        input.questions_asked || null,
        input.feedback_received || null
    ]);

    if (!queryResult.success) return queryResult;

    return okResult({ success: true });
}

// ---------by chatgpt----------------

export const CompanySchema = z.object({
    id: z.string(),
    user_id: z.string(),
    name: z.string(),
    career_page_url: z.string().nullable(),
    location: z.string().nullable(),
    notes: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const ApplicationSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    company_id: z.string(),
    role_title: z.string(),
    job_link: z.string().nullable(),
    source: z.string().nullable(),
    status: z.enum([
        "APPLIED",
        "SHORTLISTED",
        "INTERVIEWING",
        "OFFER",
        "REJECTED",
        "WITHDRAWN"
    ]),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
    applied_date: z.string(),
    general_notes: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const InterviewRoundSchema = z.object({
    id: z.string(),
    job_application_id: z.string(),
    round_number: z.number(),
    round_type: z.string(),
    interview_date: z.string().nullable(),
    interviewer_name: z.string().nullable(),
    meeting_link: z.string().nullable(),
    result: z.enum(["PASSED", "FAILED", "PENDING", "SKIPPED"]),
    questions_asked: z.string().nullable(),
    feedback_received: z.string().nullable(),
    personal_notes: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const ApplicationHistorySchema = z.object({
    id: z.string(),
    job_application_id: z.string(),
    previous_status: z.string().nullable(),
    new_status: z.string(),
    changed_at: z.string(),
    notes: z.string().nullable(),
});

export async function getUserById(userId: string): Promise<Result<User>> {
    const db = await getPostgresDatabaseManager(null);
    if (!db.success) return db;

    const query = `SELECT * FROM users WHERE id = $1 LIMIT 1`;
    const result = await db.data.execute(query, [userId]);
    if (!result.success) return result;

    const rows = result.data.rows as unknown[];
    if (rows.length === 0) return errResult(new Error("User not found"));

    const parsed = UserSchema.safeParse(rows[0]);
    if (!parsed.success) {
        return errResult(new Error("Invalid user schema"));
    }

    return okResult(parsed.data);
}

export async function getCompaniesForUser(userId: string): Promise<Result<z.infer<typeof CompanySchema>[]>> {
    const db = await getPostgresDatabaseManager(null);
    if (!db.success) return db;

    const query = `SELECT * FROM companies WHERE user_id = $1 ORDER BY created_at DESC`;
    const result = await db.data.execute(query, [userId]);
    if (!result.success) return result;

    const parsed = z.array(CompanySchema).safeParse(result.data.rows);
    if (!parsed.success) {
        return errResult(new Error("Company schema invalid"));
    }

    return okResult(parsed.data);
}

export async function getApplicationsForUser(userId: string): Promise<Result<z.infer<typeof ApplicationSchema>[]>> {
    const db = await getPostgresDatabaseManager(null);
    if (!db.success) return db;

    const query = `
    SELECT * FROM applications
    WHERE user_id = $1
    ORDER BY updated_at DESC
  `;

    const result = await db.data.execute(query, [userId]);
    if (!result.success) return result;

    const parsed = z.array(ApplicationSchema).safeParse(result.data.rows);
    if (!parsed.success) {
        return errResult(new Error("Application schema invalid"));
    }

    return okResult(parsed.data);
}


export async function getApplicationById(id: string): Promise<Result<z.infer<typeof ApplicationSchema>>> {
    const db = await getPostgresDatabaseManager(null);
    if (!db.success) return db;

    const result = await db.data.execute(`SELECT * FROM applications WHERE id = $1`, [id]);
    if (!result.success) return result;

    const rows = result.data.rows as unknown[];
    if (rows.length === 0) return errResult(new Error("Application not found"));

    const parsed = ApplicationSchema.safeParse(rows[0]);
    if (!parsed.success) return errResult(new Error("Invalid application schema"));

    return okResult(parsed.data);
}

export async function getLatestUpdatedApplicationsForUser(userId: string): Promise<Result<z.infer<typeof ApplicationSchema>[]>> {
    const db = await getPostgresDatabaseManager(null);
    if (!db.success) return db;

    const query = `
    SELECT * FROM applications
    WHERE user_id = $1
    ORDER BY updated_at DESC
  `;

    const result = await db.data.execute(query, [userId]);
    if (!result.success) return result;

    const parsed = z.array(ApplicationSchema).safeParse(result.data.rows);
    if (!parsed.success) return errResult(new Error("Invalid schema"));

    return okResult(parsed.data);
}


export async function getInterviewRoundsForApplication(applicationId: string): Promise<Result<z.infer<typeof InterviewRoundSchema>[]>> {
    const db = await getPostgresDatabaseManager(null);
    if (!db.success) return db;

    const query = `
    SELECT * FROM interview_rounds
    WHERE job_application_id = $1
    ORDER BY interview_date ASC
  `;

    const result = await db.data.execute(query, [applicationId]);
    if (!result.success) return result;

    const parsed = z.array(InterviewRoundSchema).safeParse(result.data.rows);
    if (!parsed.success) return errResult(new Error("Invalid interview round schema"));

    return okResult(parsed.data);
}
export async function getApplicationHistory(applicationId: string): Promise<Result<z.infer<typeof ApplicationHistorySchema>[]>> {
    const db = await getPostgresDatabaseManager(null);
    if (!db.success) return db;

    const query = `
    SELECT * FROM application_history
    WHERE job_application_id = $1
    ORDER BY changed_at DESC
  `;

    const result = await db.data.execute(query, [applicationId]);
    if (!result.success) return result;

    const parsed = z.array(ApplicationHistorySchema).safeParse(result.data.rows);
    if (!parsed.success) return errResult(new Error("Invalid application history schema"));

    return okResult(parsed.data);
}
