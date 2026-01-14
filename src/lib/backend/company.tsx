import { z } from "zod";
import { getPostgresDatabaseManager } from "../../../submodules/submodule-database-manager-postgres/postgresDatabaseManager.server";
import {
  Result,
  okResult,
  errResult,
} from "../../../submodules/submodule-database-manager-postgres/utilities/errorHandling";
import { AddCompanySchema, UpdateCompanySchema } from "@/utilities/schemas";

export async function addCompany(
  input: z.infer<typeof AddCompanySchema>
): Promise<Result<{ company_id: string }>> {
  const postgresManagerResult = await getPostgresDatabaseManager(null);
  if (!postgresManagerResult.success) return postgresManagerResult;

  const parsed = AddCompanySchema.safeParse(input);
  if (!parsed.success) {
    return errResult(
      new Error("Invalid input: " + JSON.stringify(parsed.error.format()))
    );
  }
  const data = parsed.data;

  const checkQuery = `SELECT id FROM companies WHERE user_id = $1 AND name = $2`;
  const checkResult = await postgresManagerResult.data.execute(checkQuery, [
    data.user_id,
    data.name,
  ]);

  if (
    checkResult.success &&
    checkResult.data.rows &&
    checkResult.data.rows.length > 0
  ) {
    return errResult(
      new Error(`Company '${data.name}' already exists in your dashboard.`)
    );
  }

  const insertQuery = `
    INSERT INTO companies (id, user_id, name, career_page_url, location, notes)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
    RETURNING id
  `;

  const insertResult = await postgresManagerResult.data.execute(insertQuery, [
    data.user_id,
    data.name,
    data.career_page_url || null,
    data.location || null,
    data.notes || null,
  ]);

  if (!insertResult.success) return insertResult;

  const row = insertResult.data.rows?.[0] as { id: string };
  return okResult({ company_id: row.id });
}

export async function deleteCompany(input: {
  company_id: string;
  user_id: string;
}): Promise<Result<{ success: boolean }>> {
  const postgresManagerResult = await getPostgresDatabaseManager(null);
  if (!postgresManagerResult.success) return postgresManagerResult;

  const query = `
    DELETE FROM companies 
    WHERE id = $1 AND user_id = $2
  `;

  const result = await postgresManagerResult.data.execute(query, [
    input.company_id,
    input.user_id,
  ]);

  if (!result.success) return result;

  if ((result.data.rowCount ?? 0) === 0) {
    return errResult(
      new Error("Company not found or you don't have permission to delete it.")
    );
  }

  return okResult({ success: true });
}
export async function updateCompany(
  input: z.infer<typeof UpdateCompanySchema>
): Promise<Result<{ success: boolean }>> {
  const postgresManagerResult = await getPostgresDatabaseManager(null);
  if (!postgresManagerResult.success) return postgresManagerResult;

  const parsed = UpdateCompanySchema.safeParse(input);
  if (!parsed.success) return errResult(new Error("Invalid input"));

  const data = parsed.data;

  const query = `
    UPDATE companies
    SET 
      name = COALESCE($3, name),
      career_page_url = COALESCE($4, career_page_url),
      location = COALESCE($5, location),
      notes = COALESCE($6, notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2
  `;

  const result = await postgresManagerResult.data.execute(query, [
    data.company_id,
    data.user_id,
    data.name || null,
    data.career_page_url || null,
    data.location || null,
    data.notes || null,
  ]);

  if (!result.success) return result;

  if ((result.data.rowCount ?? 0) === 0) {
    return errResult(new Error("Company not found or unauthorized"));
  }

  return okResult({ success: true });
}
