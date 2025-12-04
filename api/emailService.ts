import { Resend } from 'resend';

interface EmailData {
	name: string;
	email: string;
	company?: string;
	pdfUrl?: string;
}

export async function sendROIReportEmail(
	emailData: EmailData,
	resendApiKey: string
): Promise<{ success: boolean; emailId?: string; error?: string }> {
	try {
		const resend = new Resend(resendApiKey);

		// Create email content
		const emailHtml = createEmailTemplate(emailData);

		// Send email (no attachment, just download link)
		const { data, error } = await resend.emails.send({
			from: 'ProofIQ <noreply@proofiqapp.com>',
			to: emailData.email,
			subject: `${emailData.name}, Your ProofIQ ROI Analysis is Ready`,
			html: emailHtml,
			tags: [
				{ name: 'type', value: 'roi_report' },
				{ name: 'source', value: 'lead_form' },
			],
		});

		if (error) {
			console.error('Resend error:', error);
			return { success: false, error: error.message };
		}

		return { success: true, emailId: data?.id };
	} catch (error) {
		console.error('Email service error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

function createEmailTemplate(data: EmailData): string {
	const { name, company, pdfUrl } = data;
	const firstName = name.split(' ')[0];
	const companyText = company
		? `We've prepared a personalized ROI analysis for ${company}.`
		: "We've prepared a personalized ROI analysis for your organization.";

	const pdfSection = pdfUrl
		? `
			<p style="margin: 0 0 24px; color: #3f3f46; font-size: 15px;">
				Your custom report is ready to download and includes detailed projections based on your specific requirements.
			</p>

			<table role="presentation" style="width: 100%; margin: 0 0 32px;">
				<tr>
					<td>
						<a href="${pdfUrl}" style="display: inline-block; padding: 12px 24px; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; border-radius: 4px;">
							Download Your ROI Report
						</a>
					</td>
				</tr>
			</table>
		`
		: '';

	return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Your ProofIQ ROI Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; line-height: 1.6;">
	<table role="presentation" style="width: 100%; border-collapse: collapse;">
		<tr>
			<td align="center" style="padding: 40px 20px;">
				<table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e4e4e7;">
					
					<tr>
						<td style="padding: 32px 40px; border-bottom: 1px solid #e4e4e7;">
							<h1 style="margin: 0; color: #18181b; font-size: 22px; font-weight: 600; letter-spacing: -0.3px;">
								ProofIQ
							</h1>
						</td>
					</tr>

					<tr>
						<td style="padding: 40px;">
							<p style="margin: 0 0 24px; color: #18181b; font-size: 16px;">
								Hi ${firstName},
							</p>
							
							<p style="margin: 0 0 20px; color: #3f3f46; font-size: 15px;">
								Thank you for your interest in ProofIQ. ${companyText}
							</p>

							${pdfSection}

							<p style="margin: 0 0 16px; color: #3f3f46; font-size: 15px;">
								ProofIQ helps Lifeline providers streamline compliance audits through:
							</p>

							<table role="presentation" style="width: 100%; margin-bottom: 32px;">
								<tr>
									<td style="padding: 0 0 12px 0;">
										<p style="margin: 0; color: #3f3f46; font-size: 15px;">
											<strong style="color: #18181b;">Automated audit processing</strong> &mdash; NLAD/RAD verification, duplicate detection, and eligibility checks
										</p>
									</td>
								</tr>
								<tr>
									<td style="padding: 0 0 12px 0;">
										<p style="margin: 0; color: #3f3f46; font-size: 15px;">
											<strong style="color: #18181b;">Improved accuracy</strong> &mdash; AI-powered validation against FCC and USAC requirements
										</p>
									</td>
								</tr>
								<tr>
									<td style="padding: 0 0 0 0;">
										<p style="margin: 0; color: #3f3f46; font-size: 15px;">
											<strong style="color: #18181b;">Reduced costs</strong> &mdash; Less manual review time and fewer compliance penalties
										</p>
									</td>
								</tr>
							</table>

							<p style="margin: 0 0 24px; color: #3f3f46; font-size: 15px;">
								We'd be happy to walk you through the report and answer any questions you have about implementing ProofIQ.
							</p>

							<table role="presentation" style="width: 100%; margin: 0 0 32px;">
								<tr>
									<td>
										<a href="https://proofiqapp.com/demo" style="display: inline-block; padding: 12px 24px; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; border-radius: 4px;">
											Schedule a Demo
										</a>
									</td>
								</tr>
							</table>

							<p style="margin: 0; color: #3f3f46; font-size: 15px;">
								Best regards,<br>
								The ProofIQ Team
							</p>
						</td>
					</tr>

					<tr>
						<td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
							<p style="margin: 0 0 8px; color: #71717a; font-size: 13px;">
								ProofIQ
							</p>
							<p style="margin: 0; color: #a1a1aa; font-size: 13px;">
								&copy; ${new Date().getFullYear()} ProofIQ. All rights reserved.
							</p>
						</td>
					</tr>

				</table>
			</td>
		</tr>
	</table>
</body>
</html>
	`.trim();
}
