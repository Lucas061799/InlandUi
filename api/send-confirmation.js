import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const BASE_URL = 'https://commercial-auto-app.vercel.app'

function emailHtml({ firstName, namedInsured, submissionId, effectiveDate, submittedDate }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Submission Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header card -->
          <tr>
            <td style="background:white;border-radius:16px 16px 0 0;overflow:hidden;">
              <!-- Gradient bar -->
              <div style="height:4px;background:linear-gradient(88deg,#5C2ED4 0%,#A614C3 100%);"></div>

              <!-- Logo row -->
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 32px 16px;">
                <tr>
                  <td>
                    <img src="${BASE_URL}/norbielink-logo.png" alt="NorbieLink" height="28" style="display:block;" />
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-size:10px;color:#9CA3AF;letter-spacing:0.08em;font-weight:600;margin-right:8px;">POWERED BY</span>
                    <img src="${BASE_URL}/btislogo.png" alt="btis" height="22" style="display:inline-block;vertical-align:middle;" />
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="height:1px;background:#F3F4F6;margin:0 32px;"></div>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background:white;padding:28px 32px 32px;">

              <!-- Greeting -->
              <p style="font-size:16px;color:#111827;margin:0 0 16px;">Hello ${firstName || namedInsured || 'there'},</p>

              <!-- Intro text -->
              <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 24px;">
                Thank you for completing your Commercial Auto submission. We've successfully received your information, and our team is now reviewing the details provided. A copy of your application is attached.
              </p>

              <!-- Info box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:10px;border-bottom:1px solid #E5E7EB;">
                          <span style="font-size:11px;color:#9CA3AF;">Submission Number</span><br/>
                          <span style="font-size:14px;font-weight:700;color:#111827;">${submissionId}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:10px;padding-bottom:10px;border-bottom:1px solid #E5E7EB;">
                          <span style="font-size:11px;color:#9CA3AF;">Applicant Name</span><br/>
                          <span style="font-size:14px;font-weight:700;color:#111827;">${namedInsured || '—'}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:10px;padding-bottom:10px;border-bottom:1px solid #E5E7EB;">
                          <span style="font-size:11px;color:#9CA3AF;">Effective Date</span><br/>
                          <span style="font-size:14px;font-weight:700;color:#111827;">${effectiveDate || '—'}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:10px;">
                          <span style="font-size:11px;color:#9CA3AF;">Date Submitted</span><br/>
                          <span style="font-size:14px;font-weight:700;color:#111827;">${submittedDate}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Status badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:rgba(251,191,36,0.12);border-radius:999px;padding:6px 14px;">
                    <span style="font-size:11px;font-weight:700;color:#D97706;">● Under Review</span>
                  </td>
                </tr>
              </table>

              <!-- Body text -->
              <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 24px;">
                Your submission will be reviewed as soon as possible. If any additional information is needed, a member of our team will reach out to you directly. We appreciate the opportunity to work with you and will be in touch soon.
              </p>

              <!-- Signature -->
              <p style="font-size:14px;color:#374151;margin:0 0 4px;font-weight:600;">The Commercial Auto Team</p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9FAFB;border-radius:0 0 16px 16px;padding:20px 32px;border-top:1px solid #E5E7EB;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="font-size:11px;color:#6B7280;margin:0 0 4px;">6610 Sierra College Blvd. | Rocklin, CA 95677 | License #0D10271</p>
                    <p style="font-size:11px;color:#6B7280;margin:0 0 12px;">877.649.6682 Phone | 916.772.9292 Fax | <a href="https://www.btisinc.com" style="color:#5C2ED4;">www.btisinc.com</a></p>
                    <p style="font-size:10px;color:#9CA3AF;margin:0;line-height:1.6;">
                      The information contained in this email message is intended only for the personal and confidential use of the recipient(s) named above. This message may be an attorney-client communication and/or work product, and as such is privileged and confidential.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, firstName, namedInsured, submissionId, effectiveDate } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  const submittedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  try {
    const { data, error } = await resend.emails.send({
      from: 'NorbieLink <onboarding@resend.dev>',
      to: [email],
      subject: `Submission Confirmed – ${submissionId}`,
      html: emailHtml({ firstName, namedInsured, submissionId, effectiveDate, submittedDate }),
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ error })
    }

    return res.status(200).json({ success: true, id: data?.id })
  } catch (err) {
    console.error('Send error:', err)
    return res.status(500).json({ error: err.message })
  }
}
