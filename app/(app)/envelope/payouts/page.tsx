import type { Metadata } from "next";
import { PayoutsStep } from "@/components/close/envelope/payouts-step";

export const metadata: Metadata = { title: "Payouts & pay-ins" };

export default function Page() {
  return <PayoutsStep />;
}
