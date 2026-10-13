import type { Metadata } from "next";
import { MtdPage } from "@/components/close/mtd/mtd-page";

export const metadata: Metadata = {
  title: "MTD sales",
};

export default function Page() {
  return <MtdPage />;
}
