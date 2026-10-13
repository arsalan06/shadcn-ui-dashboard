import type { Metadata } from "next";
import { ChargesStep } from "@/components/close/envelope/charges-step";

export const metadata: Metadata = { title: "Credit card charges" };

export default function Page() {
  return <ChargesStep />;
}
