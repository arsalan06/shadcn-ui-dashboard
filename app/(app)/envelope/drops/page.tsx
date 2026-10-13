import type { Metadata } from "next";
import { DropsStep } from "@/components/close/envelope/drops-step";

export const metadata: Metadata = { title: "Cash drops" };

export default function Page() {
  return <DropsStep />;
}
