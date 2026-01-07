import { z } from "zod";
import { getPostgresDatabaseManager } from "../../../submodules/submodule-database-manager-postgres/postgresDatabaseManager.server";
import { Result, okResult, errResult } from "../../../submodules/submodule-database-manager-postgres/utilities/errorHandling";

// ---------------------------------------------------------
// ADD INTERVIEW ROUND
// ---------------------------------------------------------

const AddRoundSchema = z.object({
    job_application_id: z.string().uuid(),
    round_number: z.number().int().positive(),
    round_type: z.string().min(1, "Round type is required"), // e.g. "DSA", "System Design"
    interview_date: z.date().optional(), // Can be null if scheduling is pending
    interviewer_name: z.string().optional(),
    meeting_link: z.string().url().optional().or(z.literal('')),
});

export async function addInterviewRound(input: z.infer<typeof AddRoundSchema>): Promise<Result<{ round_id: string }>> {
    const postgresManagerResult = await getPostgresDatabaseManager(null);
    if (!postgresManagerResult.success) return postgresManagerResult;

    const parsed = AddRoundSchema.safeParse(input);
    if (!parsed.success) return errResult(new Error("Invalid input: " + JSON.stringify(parsed.error.format())));

    const data = parsed.data;

    const insertQuery = `
    INSERT INTO interview_rounds (
      id, job_application_id, round_number, round_type, interview_date, interviewer_name, meeting_link, result
    )
    VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'PENDING'
    )
    RETURNING id
  `;

    const result = await postgresManagerResult.data.execute(insertQuery, [
        data.job_application_id,
        data.round_number,
        data.round_type,
        data.interview_date || null,
        data.interviewer_name || null,
        data.meeting_link || null
    ]);

    if (!result.success) return result;

    const row = result.data.rows?.[0] as { id: string };
    return okResult({ round_id: row.id });
}

const DeleteRoundSchema = z.object({
    round_id: z.string().uuid(),
    user_id: z.string().uuid(), // Still needed for security
});

export async function deleteInterviewRound(input: z.infer<typeof DeleteRoundSchema>): Promise<Result<{ success: boolean }>> {
    const postgresManagerResult = await getPostgresDatabaseManager(null);
    if (!postgresManagerResult.success) return postgresManagerResult;

    const parsed = DeleteRoundSchema.safeParse(input);
    if (!parsed.success) return errResult(new Error("Invalid input"));

    const { round_id, user_id } = parsed.data;

    // Advanced Query: Delete round ONLY IF the parent application belongs to the user
    const query = `
    DELETE FROM interview_rounds r
    USING applications a
    WHERE r.job_application_id = a.id
      AND r.id = $1
      AND a.user_id = $2
  `;

    const result = await postgresManagerResult.data.execute(query, [round_id, user_id]);

    if (!result.success) return result;

    if ((result.data.rowCount ?? 0) === 0) {
        return errResult(new Error("Round not found or unauthorized."));
    }

    return okResult({ success: true });
}