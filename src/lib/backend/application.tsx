"use server";
import { z } from "zod";
import { getPostgresDatabaseManager } from "../../../submodules/submodule-database-manager-postgres/postgresDatabaseManager.server";
import { Result, okResult, errResult } from "../../../submodules/submodule-database-manager-postgres/utilities/errorHandling";

// ---------------------------------------------------------
// ADD APPLICATION
// ---------------------------------------------------------

const AddApplicationSchema = z.object({
    user_id: z.string(),
    company_id: z.string(),
    role_title: z.string().min(1, "Role title is required"),
    job_link: z.string().url().optional().or(z.literal('')),
    source: z.string().optional(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
    status: z.enum(['APPLIED', 'SHORTLISTED', 'INTERVIEWING', 'OFFER', 'REJECTED', 'WITHDRAWN']).default('APPLIED'),
    general_notes: z.string().optional()
});

export async function addApplication(input: z.infer<typeof AddApplicationSchema>): Promise<Result<{ application_id: string }>> {
    const postgresManagerResult = await getPostgresDatabaseManager(null);
    if (!postgresManagerResult.success) return postgresManagerResult;

    const parsed = AddApplicationSchema.safeParse(input);
    if (!parsed.success) return errResult(new Error("Invalid input: " + JSON.stringify(parsed.error.format())));

    const data = parsed.data;

    // 1. Insert Application
    const insertAppQuery = `
    INSERT INTO applications (
      id, user_id, company_id, role_title, job_link, source, priority, status, general_notes, applied_date
    )
    VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE
    )
    RETURNING id
  `;

    const appResult = await postgresManagerResult.data.execute(insertAppQuery, [
        data.user_id,
        data.company_id,
        data.role_title,
        data.job_link || null,
        data.source || null,
        data.priority,
        data.status,
        data.general_notes || null
    ]);

    if (!appResult.success) return appResult;

    const appId = (appResult.data.rows?.[0] as { id: string }).id;

    // 2. Automatically Add History Log (So timeline isn't empty)
    const historyQuery = `
    INSERT INTO application_history (id, job_application_id, previous_status, new_status, notes)
    VALUES (gen_random_uuid(), $1, NULL, $2, 'Initial application created')
  `;

    // We await this but don't fail the whole function if history logging fails (non-critical)
    await postgresManagerResult.data.execute(historyQuery, [appId, data.status]);

    return okResult({ application_id: appId });
}

const DeleteAppSchema = z.object({
    application_id: z.string().uuid(),
    user_id: z.string().uuid(),
});

export async function deleteApplication(input: z.infer<typeof DeleteAppSchema>): Promise<Result<{ success: boolean }>> {
    const postgresManagerResult = await getPostgresDatabaseManager(null);
    if (!postgresManagerResult.success) return postgresManagerResult;

    const parsed = DeleteAppSchema.safeParse(input);
    if (!parsed.success) return errResult(new Error("Invalid input"));

    const { application_id, user_id } = parsed.data;

    const query = `
    DELETE FROM applications 
    WHERE id = $1 AND user_id = $2
  `;

    const result = await postgresManagerResult.data.execute(query, [application_id, user_id]);

    if (!result.success) return result;

    if ((result.data.rowCount ?? 0) === 0) {
        return errResult(new Error("Application not found or unauthorized."));
    }

    return okResult({ success: true });
}

const UpdateAppSchema = z.object({
    user_id: z.string().uuid(),
    application_id: z.string().uuid(),
    role_title: z.string().optional(),
    job_link: z.string().optional(),
    status: z.enum(['APPLIED', 'SHORTLISTED', 'INTERVIEWING', 'OFFER', 'REJECTED', 'WITHDRAWN']).optional(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
    general_notes: z.string().optional(),
});

export async function updateApplication(input: z.infer<typeof UpdateAppSchema>): Promise<Result<{ success: boolean }>> {
    const postgresManagerResult = await getPostgresDatabaseManager(null);
    if (!postgresManagerResult.success) return postgresManagerResult;

    const parsed = UpdateAppSchema.safeParse(input);
    if (!parsed.success) return errResult(new Error("Invalid input"));
    const data = parsed.data;

    // 1. If Status is changing, we need to log history FIRST
    if (data.status) {
        // Get current status
        const currentStatusQuery = `SELECT status FROM applications WHERE id = $1 AND user_id = $2`;
        const statusResult = await postgresManagerResult.data.execute(currentStatusQuery, [data.application_id, data.user_id]);

        if (statusResult.success && statusResult.data.rows && statusResult.data.rows.length > 0) {
            const currentStatus = statusResult.data.rows[0].status;

            // Only insert history if status is actually different
            if (currentStatus !== data.status) {
                const historyQuery = `
          INSERT INTO application_history (id, job_application_id, previous_status, new_status, notes)
          VALUES (gen_random_uuid(), $1, $2, $3, 'Status updated via dashboard')
        `;
                // We await this but continue even if it fails (non-blocking)
                await postgresManagerResult.data.execute(historyQuery, [data.application_id, currentStatus, data.status]);
            }
        }
    }

    // 2. Update the Application Record
    const updateQuery = `
    UPDATE applications
    SET 
      role_title = COALESCE($3, role_title),
      job_link = COALESCE($4, job_link),
      status = COALESCE($5, status),
      priority = COALESCE($6, priority),
      general_notes = COALESCE($7, general_notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2
  `;

    const result = await postgresManagerResult.data.execute(updateQuery, [
        data.application_id,
        data.user_id,
        data.role_title || null,
        data.job_link || null,
        data.status || null,
        data.priority || null,
        data.general_notes || null
    ]);

    if (!result.success) return result;
    if ((result.data.rowCount ?? 0) === 0) return errResult(new Error("Application not found"));

    return okResult({ success: true });
}