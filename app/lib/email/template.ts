import "server-only";

export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

type ApplicationEmailData = {
  candidateName: string;
  jobTitle: string;
  companyName?: string;
  adminNote?: string | null;
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(inner: string): string {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#0f172a">
      <div style="margin-bottom:24px">
        <div style="display:inline-block;width:36px;height:36px;border-radius:8px;background:#4f46e5;color:#fff;text-align:center;line-height:36px;font-weight:700">B</div>
        <span style="margin-left:8px;font-weight:600;font-size:15px">BrightCore</span>
      </div>
      ${inner}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 16px" />
      <p style="color:#94a3b8;font-size:12px;margin:0">
        BrightCore · Recruitment Team
      </p>
    </div>
  `;
}

export function applicationReceivedEmail(data: ApplicationEmailData) {
  return {
    subject: `We received your application for ${data.jobTitle}`,
    html: layout(`
      <h2 style="color:#0f172a;margin:0 0 16px">Application received</h2>
      <p style="color:#475569;line-height:1.6">
        Hi ${escapeHtml(data.candidateName)},
      </p>
      <p style="color:#475569;line-height:1.6">
        Thank you for applying for the <strong>${escapeHtml(data.jobTitle)}</strong>
        role at BrightCore. We've received your application and our team will
        review it shortly.
      </p>
      <p style="color:#475569;line-height:1.6">
        We'll be in touch as soon as there's an update. No action needed from
        your side for now.
      </p>
    `),
  };
}

export function applicationAcceptedEmail(data: ApplicationEmailData) {
  const note = data.adminNote
    ? `<div style="margin:16px 0;padding:12px 16px;background:#ecfdf5;border-left:3px solid #10b981;border-radius:6px">
         <p style="color:#065f46;margin:0;font-size:14px;line-height:1.6">
           <strong>Note from our team:</strong><br/>
           ${escapeHtml(data.adminNote)}
         </p>
       </div>`
    : "";

  return {
    subject: `Good news — your application for ${data.jobTitle}`,
    html: layout(`
      <h2 style="color:#059669;margin:0 0 16px">You've been accepted 🎉</h2>
      <p style="color:#475569;line-height:1.6">
        Hi ${escapeHtml(data.candidateName)},
      </p>
      <p style="color:#475569;line-height:1.6">
        We're delighted to let you know that your application for
        <strong>${escapeHtml(data.jobTitle)}</strong> at BrightCore has been
        <strong>accepted</strong>.
      </p>
      ${note}
      <p style="color:#475569;line-height:1.6">
        Our team will reach out shortly with the next steps. Congratulations!
      </p>
    `),
  };
}

export function applicationRejectedEmail(data: ApplicationEmailData) {
  const note = data.adminNote
    ? `<div style="margin:16px 0;padding:12px 16px;background:#fef2f2;border-left:3px solid #ef4444;border-radius:6px">
         <p style="color:#7f1d1d;margin:0;font-size:14px;line-height:1.6">
           <strong>Message from our team:</strong><br/>
           ${escapeHtml(data.adminNote)}
         </p>
       </div>`
    : "";

  return {
    subject: `Update on your application for ${data.jobTitle}`,
    html: layout(`
      <h2 style="color:#0f172a;margin:0 0 16px">Application update</h2>
      <p style="color:#475569;line-height:1.6">
        Hi ${escapeHtml(data.candidateName)},
      </p>
      <p style="color:#475569;line-height:1.6">
        Thank you for your interest in the
        <strong>${escapeHtml(data.jobTitle)}</strong> role at BrightCore.
      </p>
      <p style="color:#475569;line-height:1.6">
        After careful review, we've decided not to move forward with your
        application at this time.
      </p>
      ${note}
      <p style="color:#475569;line-height:1.6">
        We truly appreciate the time you took to apply and encourage you to
        check back for future openings.
      </p>
    `),
  };
}

export function applicationStatusEmail(
  status: ApplicationStatus,
  data: ApplicationEmailData
) {
  switch (status) {
    case "ACCEPTED":
      return applicationAcceptedEmail(data);
    case "REJECTED":
      return applicationRejectedEmail(data);
    case "PENDING":
    default:
      return applicationReceivedEmail(data);
  }
}