import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SimpleForm } from "@/components/simple-form";
export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Ceylon Wall Decor for art and delivery questions.",
};
export default function Page() {
  return (
    <PageShell
      eyebrow="Talk to us"
      title="Questions, ideas, or a blank wall?"
      intro="Call or WhatsApp 078 251 8184, or leave us a message."
    >
      <SimpleForm />
    </PageShell>
  );
}
