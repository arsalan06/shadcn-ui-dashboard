import "server-only";

/**
 * Read-only client for the forms library.
 *
 * Backed by `get_updated_form_list` on the WCF service — the call behind the
 * old app's Manager Forms screen. It returns forms already grouped, which is
 * how that screen presents them; the flat `getformlist` carries neither the
 * grouping nor the attached files.
 *
 * READ-ONLY by policy. The service also exposes saveform, save_group_form,
 * save_updated_form, save_form_group, remove_form, remove_uploaded_form_file
 * and quick_upload_form_files. None of them belong in this file.
 */

const BASE = process.env.CITADEL_WCF_URL;

if (!BASE) {
  throw new Error(
    "CITADEL_WCF_URL is not set. Copy .env.example to .env.local and fill it in.",
  );
}

/** `f` is an uploaded file, `l` a link to somewhere else. */
export type FormFileType = "file" | "link";

export type FormFile = {
  id: string;
  name: string;
  /** Lowercased extension, e.g. `pdf`. Empty for links. */
  ext: string;
  type: FormFileType;
  url: string | null;
};

export type CitadelForm = {
  id: string;
  title: string;
  description: string | null;
  /** ISO timestamp, or null when the service sent no date. */
  edited: string | null;
  files: FormFile[];
};

export type FormGroup = {
  id: string;
  title: string;
  forms: CitadelForm[];
};

type RawFile = {
  File_Name: string | null;
  File_Ext: string | null;
  File_Type: string | null;
  File_Url: string | null;
};

type RawForm = {
  title: string | null;
  description: string | null;
  last_edited: string | null;
  upload_file_name: string | null;
  Form_Files: RawFile[] | null;
};

type RawPane = {
  id: string | number | null;
  /**
   * The service sends `Title`. The old Angular screen copies it onto `header`
   * before rendering, so `header` only ever exists client-side — reading it
   * here silently discarded every group.
   */
  Title: string | null;
  header?: string | null;
  PublicKey?: string | null;
  FormObj: RawForm[] | null;
};

/**
 * The service mixes formats: `/Date(…)/` on some endpoints and
 * `13 Jun, 2019 12:00 AM` on others. Both are handled, and anything
 * unparseable becomes null rather than an Invalid Date.
 */
function parseServiceDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const wcf = /\/Date\((-?\d+)([+-]\d{4})?\)\//.exec(value);
  if (wcf) {
    const ms = Number(wcf[1]);
    return Number.isFinite(ms) ? new Date(ms) : null;
  }
  const direct = new Date(value);
  return Number.isNaN(direct.getTime()) ? null : direct;
}

export async function getFormGroups(userId: string): Promise<FormGroup[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(
      `${BASE}get_updated_form_list?userid=${encodeURIComponent(userId)}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!res.ok) throw new Error(`get_updated_form_list responded ${res.status}`);

    const text = await res.text();
    let panes: RawPane[];
    try {
      panes = JSON.parse(text);
    } catch {
      throw new Error("get_updated_form_list returned a non-JSON body");
    }

    return (Array.isArray(panes) ? panes : []).flatMap((pane, pi) => {
      const title = (pane?.Title ?? pane?.header)?.trim();
      if (!title) return [];

      const forms = (pane.FormObj ?? []).flatMap((form, fi) => {
        const formTitle = form?.title?.trim();
        if (!formTitle) return [];

        const edited = parseServiceDate(form.last_edited);

        return [
          {
            id: `${pane.id ?? pi}-${fi}`,
            title: formTitle,
            description: form.description?.trim() || null,
            edited: edited ? edited.toISOString() : null,
            files: (form.Form_Files ?? []).flatMap((file, xi) => {
              const name = file?.File_Name?.trim();
              if (!name) return [];
              return [
                {
                  id: `${pane.id ?? pi}-${fi}-${xi}`,
                  name,
                  ext: file.File_Ext?.trim().toLowerCase() ?? "",
                  type: file.File_Type === "l" ? "link" : "file",
                  url: file.File_Url?.trim() || null,
                } satisfies FormFile,
              ];
            }),
          } satisfies CitadelForm,
        ];
      });

      return [
        {
          id: String(pane.id ?? pane.PublicKey ?? pi),
          title,
          forms,
        } satisfies FormGroup,
      ];
    });
  } finally {
    clearTimeout(timeout);
  }
}

/* -------------------------------------------------------------------------
 * Fallback: the flat library
 * ---------------------------------------------------------------------- */

type RawFlatForm = {
  form_id: string | null;
  title: string | null;
  description: string | null;
  created: string | null;
  last_edited: string | null;
};

/**
 * Every published form, ungrouped.
 *
 * `get_updated_form_list` is scoped to the signed-in user and returns nothing
 * when their roles match no group. This call is not scoped, so it is used as a
 * fallback to keep the library visible rather than showing an empty page. It
 * carries no grouping and no attached files — those exist only on the scoped
 * endpoint.
 */
export async function getAllForms(): Promise<CitadelForm[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(`${BASE}getformlist?formid=`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`getformlist responded ${res.status}`);

    const rows = JSON.parse(await res.text()) as RawFlatForm[];

    return (Array.isArray(rows) ? rows : []).flatMap((row, i) => {
      const title = row?.title?.trim();
      if (!title) return [];
      const edited = parseServiceDate(row.last_edited ?? row.created);
      return [
        {
          id: row.form_id ?? `flat-${i}`,
          title,
          description: row.description?.trim() || null,
          edited: edited ? edited.toISOString() : null,
          files: [],
        } satisfies CitadelForm,
      ];
    });
  } finally {
    clearTimeout(timeout);
  }
}
