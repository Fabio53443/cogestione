import { isAdmin } from "$lib/isAdmin";
import { redirect } from "@sveltejs/kit";
import { getConfig } from "$lib/config";

export const load = async ({ locals, params }) => {
  if (!(await isAdmin(locals))) {
    throw redirect(302, "/login");
  }

  const config = await getConfig();

  return {
    studentId: params.id,
    siteConfig: config,
  };
};
