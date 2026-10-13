import type { Metadata } from "next";
import { CheckoutStep } from "@/components/close/envelope/checkout-step";

export const metadata: Metadata = { title: "Check out" };

export default function Page() {
  return <CheckoutStep />;
}
