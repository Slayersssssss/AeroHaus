import { Resend } from "resend";
import { env, isResendConfigured } from "@/lib/env";

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!isResendConfigured) {
    return { skipped: true };
  }

  const resend = new Resend(env.resendApiKey!);
  return resend.emails.send({
    from: 'AeroHaus <orders@aerohaus.example>',
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
}
