import { z } from "zod";
import { getPostgresDatabaseManager } from "../../../submodules/submodule-database-manager-postgres/postgresDatabaseManager.server";
import { Result, okResult, errResult } from "../../../submodules/submodule-database-manager-postgres/utilities/errorHandling";

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
