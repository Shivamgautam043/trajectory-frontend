"use server";
import { z } from "zod";
import { getPostgresDatabaseManager } from "../../../submodules/submodule-database-manager-postgres/postgresDatabaseManager.server";
import {
  Result,
  okResult,
  errResult,
} from "../../../submodules/submodule-database-manager-postgres/utilities/errorHandling";
import { revalidatePath } from "next/cache";
import {
  AddApplicationSchema,
  AnalyticsDataSchema,
  ApplicationSchema,
  ApplicationsPaginatedSchema,
  ApplicationWithRoundsSchema,
  UpdateApplicationSchema,
} from "@/utilities/schemas";

export async function getApplicationsForUser(
  userId: string,
  options: {
    search?: string;
    page: number;
    limit: number;
  }
): Promise<Result<z.infer<typeof ApplicationsPaginatedSchema>>> {
  const postgresManagerResult = await getPostgresDatabaseManager(null);
  if (!postgresManagerResult.success) return postgresManagerResult;

  const { search = "", page, limit } = options;
  const offset = (page - 1) * limit;

  const params: any[] = [userId];
  let whereClause = `a.user_id = $1`;

  if (search) {
    params.push(`%${search}%`);
    whereClause += ` AND (
    c.name ILIKE $${params.length}
    OR a.role_title ILIKE $${params.length}
  )`;
  }

  params.push(limit, offset);

  const dataQuery = `
                SELECT DISTINCT
                  a.id as id,
                  a.user_id,
                  c.id as company_id,
                  c.name as company_name,
                  c.location as company_location,
                  a.role_title,
                  a.job_link,
                  a.source,
                  a.status,
                  a.general_notes,
                  a.priority,
                  a.applied_date,
                  a.created_at,
                  a.updated_at
                FROM applications a
                JOIN companies c ON a.company_id = c.id
                WHERE ${whereClause}
                ORDER BY a.updated_at DESC
                LIMIT $${params.length - 1}
                OFFSET $${params.length}
              `;

  const countQuery = `
                SELECT COUNT(*)::int AS total
                FROM applications a
                JOIN companies c ON a.company_id = c.id
                WHERE ${whereClause}
              `;

  const [dataResult, countResult] = await Promise.all([
    postgresManagerResult.data.execute(dataQuery, params),
    postgresManagerResult.data.execute(countQuery, params.slice(0, -2)),
  ]);

  if (!dataResult.success) return dataResult;
  if (!countResult.success) return countResult;

  const parsedItems = z
    .array(ApplicationSchema)
    .safeParse(dataResult.data.rows ?? []);

  if (!parsedItems.success) {
    return errResult(new Error("Schema validation failed"));
  }

  return okResult({
    items: parsedItems.data,
    total: countResult.data.rows[0].total,
  });
}

export async function addApplication(
  input: z.infer<typeof AddApplicationSchema> & { revalidatePath?: string }
): Promise<Result<{ application_id: string }>> {
  const postgresManagerResult = await getPostgresDatabaseManager(null);
  if (!postgresManagerResult.success) return postgresManagerResult;

  const parsed = AddApplicationSchema.safeParse(input);
  if (!parsed.success)
    return errResult(
      new Error("Invalid input: " + JSON.stringify(parsed.error.format()))
    );

  const data = parsed.data;
  let companyId = "";
  const findCompanyQuery = `SELECT id FROM companies WHERE user_id = $1 AND name = $2`;
  const findRes = await postgresManagerResult.data.execute(findCompanyQuery, [
    data.user_id,
    data.company_name,
  ]);

  if (!findRes.success) return findRes;

  if (findRes.data.rows.length > 0) {
    companyId = findRes.data.rows[0].id;
  } else {
    const createCompanyQuery = `
            INSERT INTO companies (id, user_id, name, created_at, updated_at)
            VALUES (gen_random_uuid(), $1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id
        `;
    const createRes = await postgresManagerResult.data.execute(
      createCompanyQuery,
      [data.user_id, data.company_name]
    );
    if (!createRes.success) return createRes;
    companyId = createRes.data.rows[0].id;
  }

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
    companyId,
    data.role_title,
    data.job_link || null,
    data.source || null,
    data.priority,
    data.status,
    data.general_notes || null,
  ]);

  if (!appResult.success) return appResult;

  const appId = (appResult.data.rows?.[0] as { id: string }).id;

  const historyQuery = `
    INSERT INTO application_history (id, job_application_id, previous_status, new_status, notes)
    VALUES (gen_random_uuid(), $1, NULL, $2, 'Initial application created')
  `;

  await postgresManagerResult.data.execute(historyQuery, [appId, data.status]);

  if (input.revalidatePath) {
    revalidatePath(input.revalidatePath);
  }

  return okResult({ application_id: appId });
}

export async function deleteApplication(input: {
  application_id: string;
  user_id: string;
}): Promise<Result<{ success: boolean }>> {
  const postgresManagerResult = await getPostgresDatabaseManager(null);
  if (!postgresManagerResult.success) return postgresManagerResult;
  const query = `
    DELETE FROM applications 
    WHERE id = $1 AND user_id = $2
  `;
  const result = await postgresManagerResult.data.execute(query, [
    input.application_id,
    input.user_id,
  ]);

  if (!result.success) return result;

  if ((result.data.rowCount ?? 0) === 0) {
    return errResult(new Error("Application not found or unauthorized."));
  }

  return okResult({ success: true });
}

export async function updateApplication(
  input: z.infer<typeof UpdateApplicationSchema> & { revalidatePath?: string }
): Promise<Result<{ success: boolean }>> {
  const postgresManagerResult = await getPostgresDatabaseManager(null);
  if (!postgresManagerResult.success) return postgresManagerResult;

  const parsed = UpdateApplicationSchema.safeParse(input);
  if (!parsed.success) return errResult(new Error(parsed.error.message));
  const data = parsed.data;

  if (data.status) {
    const currentStatusQuery = `SELECT status FROM applications WHERE id = $1 AND user_id = $2`;
    const statusResult = await postgresManagerResult.data.execute(
      currentStatusQuery,
      [data.id, data.user_id]
    );

    if (
      statusResult.success &&
      statusResult.data.rows &&
      statusResult.data.rows.length > 0
    ) {
      const currentStatus = statusResult.data.rows[0].status;
      if (currentStatus !== data.status) {
        const historyQuery = `
          INSERT INTO application_history (id, job_application_id, previous_status, new_status, notes)
          VALUES (gen_random_uuid(), $1, $2, $3, 'Status updated via dashboard')
        `;
        await postgresManagerResult.data.execute(historyQuery, [
          data.id,
          currentStatus,
          data.status,
        ]);
      }
    }
  }

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
    data.id,
    data.user_id,
    data.role_title ?? null,
    data.job_link ?? null,
    data.status ?? null,
    data.priority ?? null,
    data.general_notes ?? null,
  ]);

  if (!result.success) return result;
  if ((result.data.rowCount ?? 0) === 0)
    return errResult(new Error("Application not found"));
  if (input.revalidatePath) {
    revalidatePath(input.revalidatePath);
  }
  return okResult({ success: true });
}

export async function getApplicationWithRoundsById(
  userId: string,
  applicationId: string
): Promise<Result<z.infer<typeof ApplicationWithRoundsSchema>>> {
  const dbResult = await getPostgresDatabaseManager(null);
  if (!dbResult.success) return dbResult;
  const appQuery = `
    SELECT 
      a.id,
      a.user_id,
      c.id AS company_id,
      c.name AS company_name,
      c.location AS company_location,
      a.role_title,
      a.job_link,
      a.source,
      a.status,
      a.priority,
      a.general_notes,
      a.applied_date,
      a.created_at,
      a.updated_at
    FROM applications a
    JOIN companies c ON a.company_id = c.id
    WHERE a.id = $1 AND a.user_id = $2
    LIMIT 1;
  `;
  const appRes = await dbResult.data.execute(appQuery, [applicationId, userId]);
  if (!appRes.success) return appRes;
  if (appRes.data.rows.length === 0)
    return errResult(new Error("Application not found"));

  const historyQuery = `
    SELECT 
      id,
      job_application_id,
      previous_status,
      new_status,
      notes,
      changed_at
    FROM application_history
    WHERE job_application_id = $1
    ORDER BY changed_at ASC;
  `;
  const histRes = await dbResult.data.execute(historyQuery, [applicationId]);
  if (!histRes.success) return histRes;

  const roundsQuery = `
    SELECT
      id,
      job_application_id AS application_id,
      round_number,
      round_type,
      interview_date,
      interviewer_name,
      meeting_link,
      result,
      questions_asked,
      feedback_received,
      personal_notes,
      created_at,
      updated_at
    FROM interview_rounds
    WHERE job_application_id = $1
    ORDER BY created_at ASC;
  `;
  const roundsRes = await dbResult.data.execute(roundsQuery, [applicationId]);
  if (!roundsRes.success) return roundsRes;

  const rawData = {
    application: appRes.data.rows[0],
    history: histRes.data.rows || [],
    rounds: roundsRes.data.rows || [],
  };

  const parsed = ApplicationWithRoundsSchema.safeParse(rawData);
  if (!parsed.success) {
    console.log(parsed.error);
    return errResult(new Error("Detail schema validation failed"));
  }

  return okResult(parsed.data);
}

export async function getAnalyticsData(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Result<z.infer<typeof AnalyticsDataSchema>>> {
  const dbResult = await getPostgresDatabaseManager(null);
  if (!dbResult.success) return dbResult;
  const trendQuery = `
        SELECT 
          applied_date::text as date, 
          COUNT(*)::int as count 
        FROM applications 
        WHERE user_id = $1 
          AND applied_date >= $2 
          AND applied_date <= $3
        GROUP BY applied_date
        ORDER BY applied_date ASC
      `;

  const statusQuery = `
        SELECT status, COUNT(*)::int as count 
        FROM applications 
        WHERE user_id = $1
        GROUP BY status
      `;

  const [trendRes, statusRes] = await Promise.all([
    dbResult.data.execute(trendQuery, [userId, startDate, endDate]),
    dbResult.data.execute(statusQuery, [userId]),
  ]);

  if (!trendRes.success) return trendRes;
  if (!statusRes.success) return statusRes;

  const rawTrend = trendRes.data.rows as { date: string; count: number }[];
  const filledTrend = [];


  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const found = rawTrend.find((r) => r.date === dateStr);
    filledTrend.push({
      date: dateStr,
      count: found ? Number(found.count) : 0,
    });
  }
  const statusColors: Record<string, string> = {
    APPLIED: "gray.5",
    SHORTLISTED: "violet.5",
    INTERVIEWING: "blue.5",
    OFFER: "green.5",
    REJECTED: "red.5",
    WITHDRAWN: "dark.3",
  };

  const formattedStatus = (
    statusRes.data.rows as { status: string; count: number }[]
  ).map((row) => ({
    name: row.status.charAt(0) + row.status.slice(1).toLowerCase(),
    value: Number(row.count),
    color: statusColors[row.status] || "gray.5",
  }));

  console.log(formattedStatus)

  return okResult({
    dailyTrend: filledTrend,
    statusDistribution: formattedStatus,
  });
}
