import { EnvelopeShell } from "@/components/close/envelope/envelope-shell";

export default function EnvelopeLayout({
  children,
}: LayoutProps<"/envelope">) {
  return <EnvelopeShell>{children}</EnvelopeShell>;
}
