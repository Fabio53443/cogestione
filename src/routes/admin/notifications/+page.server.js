import { isAdmin } from "$lib/isAdmin";
import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  if (!(await isAdmin(locals))) {
    throw redirect(302, "/login");
  }

  return {
    pageName: "Gestione Notifiche",
  };
};
