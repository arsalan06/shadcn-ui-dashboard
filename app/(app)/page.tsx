import type { Metadata } from "next";
import { CorporateDashboard } from "@/components/close/dashboard/corporate-dashboard";

export const metadata: Metadata = {
  title: "Daily close",
};

export default function Page() {
  return <CorporateDashboard />;
}
