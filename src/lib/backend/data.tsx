import { z } from "zod";
import { getPostgresDatabaseManager } from "../../../submodules/submodule-database-manager-postgres/postgresDatabaseManager.server";
import {
    Result,
    errResult,
    okResult,
} from "../../../submodules/submodule-database-manager-postgres/utilities/errorHandling";
import { ApplicationWithRoundsSchema, StatsSchema } from "@/utilities/schemas";

export async function getDashboardStats(
  userId: string
): Promise<Result<z.infer<typeof StatsSchema>>> {
  const postgresManagerResult = await getPostgresDatabaseManager(null);
  if (!postgresManagerResult.success) return postgresManagerResult;

  const query = `
    SELECT
      CAST(COUNT(*) AS INT) AS total_applications,
      CAST(COUNT(*) FILTER (WHERE status = 'INTERVIEWING') AS INT) AS active_interviews,
      CAST(COUNT(*) FILTER (WHERE status = 'OFFER') AS INT) AS offers,
      CAST(COUNT(*) FILTER (WHERE status = 'REJECTED') AS INT) AS rejections
    FROM applications
    WHERE user_id = $1;
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


