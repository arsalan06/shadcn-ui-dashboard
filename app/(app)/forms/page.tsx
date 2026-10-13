import type { Metadata } from "next";
import { cookies } from "next/headers";
import { PageHeader } from "@/components/close/page-header";
import { FormsGroups } from "@/components/close/forms/forms-groups";
import { openSession, SESSION_COOKIE } from "@/lib/session";
import {
  getAllForms,
  getFormGroups,
  type FormGroup,
} from "@/lib/citadel-forms";

export const metadata: Metadata = {
  title: "Forms",
};

export default async function Page() {
  // The list is scoped to the signed-in user, so it carries only the forms
  // their role and stores are entitled to.
  const session = await openSession((await cookies()).get(SESSION_COOKIE)?.value);

  let groups: FormGroup[] = [];
  let error: string | null = null;

  if (session?.userid) {
    try {
      groups = await getFormGroups(session.userid);
    } catch (cause) {
      console.error("[forms] grouped list failed:", cause);
    }
  }

  // The grouped list is scoped to the user's roles and comes back empty when
  // none match. Fall back to the full library so the page still shows the
  // documents, ungrouped and without their attachments.
  if (groups.length === 0) {
    try {
      const forms = await getAllForms();
      if (forms.length) groups = [{ id: "all", title: "All forms", forms }];
    } catch (cause) {
      console.error("[forms] flat list failed:", cause);
      error = "Could not load the forms library.";
    }
  }

  return (
    <>
      <PageHeader eyebrow="Family Thrift Center" title="Manager forms" />

      <div className="flex min-w-0 flex-col gap-3 p-3">
        {error ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </p>
        ) : (
          <FormsGroups groups={groups} />
        )}
      </div>
    </>
  );
}
