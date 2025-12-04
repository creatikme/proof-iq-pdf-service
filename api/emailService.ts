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
					<td align="center">
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
							<svg xmlns="http://www.w3.org/2000/svg" width="134" height="34" fill="none"><path fill="url(#a)" d="M3.95 4.992c1.455-1.771 3.707-2.868 6.005-2.867 4.75.003 9.5.011 14.251.013 2.258-.002 4.517.024 6.775-.01-.652.599-1.255 1.25-1.888 1.868-2.882 2.839-6.823 4.582-10.87 4.758-4.068.143-8.1-.843-11.843-2.385 1.12 2.718 1.951 5.57 2.262 8.498.16 1.545.22 3.112.017 4.657-.408 3.334-1.873 6.52-4.107 9.023-.78.844-1.6 1.65-2.425 2.45-.004-6.96 0-13.921-.002-20.882A7.917 7.917 0 0 1 3.95 4.992Z"/><path fill="url(#b)" d="M28.677 6.512c.928-1.263 2.083-2.333 3.197-3.427.003 6.917-.003 13.836-.003 20.753a7.868 7.868 0 0 1-1.854 5.198c-1.433 1.741-3.649 2.792-5.9 2.832-2.61.01-5.219.001-7.828 0-.792-.015-1.588.037-2.377-.04-1.114.12-2.23-.033-3.345-.002-2.466.003-4.932-.018-7.398 0 .69-.655 1.343-1.35 2.028-2.01 2.723-2.539 6.32-4.13 10.037-4.395 4.23-.266 8.477.611 12.39 2.2-1.468-3.594-2.31-7.463-2.266-11.354a16.807 16.807 0 0 1 3.319-9.755Z"/><path fill="#1A1A1A" d="M48.336 6.788c4.813 0 7.242 2.26 7.242 6.722v.062c0 4.43-2.43 6.677-7.242 6.677H45.05v7.93h-4.676V6.788h7.96Zm-.459 9.855c2.109 0 3.132-1.009 3.132-3.071v-.062c0-2.093-1.023-3.117-3.132-3.117H45.05v6.25h2.827ZM57.03 28.179V12.135h4.553c.046 1.146-.122 1.956-.855 3.881l.29.153c1.589-3.285 2.934-4.293 5.623-4.584l.55 4.14-1.513.139c-2.872.244-4.049 1.451-4.049 5.607v6.708H57.03ZM74.709 28.591c-4.66 0-7.258-3.025-7.258-8.373v-.061c0-5.378 2.598-8.434 7.258-8.434 4.675 0 7.288 3.056 7.288 8.434v.061c0 5.348-2.613 8.373-7.288 8.373Zm0-3.163c1.711 0 2.551-1.42 2.551-4.37v-1.787c0-2.964-.84-4.385-2.551-4.385-1.696 0-2.521 1.42-2.521 4.385v1.787c0 2.95.825 4.37 2.52 4.37ZM90.493 28.591c-4.66 0-7.258-3.025-7.258-8.373v-.061c0-5.378 2.598-8.434 7.258-8.434 4.675 0 7.288 3.056 7.288 8.434v.061c0 5.348-2.613 8.373-7.288 8.373Zm0-3.163c1.711 0 2.552-1.42 2.552-4.37v-1.787c0-2.964-.84-4.385-2.552-4.385-1.696 0-2.521 1.42-2.521 4.385v1.787c0 2.95.825 4.37 2.521 4.37ZM100.364 28.179V15.436h-2.017v-3.3h2.017v-.872c0-3.468 1.895-4.507 7.273-4.889l.443 3.316-1.513.107c-1.497.091-1.787.473-1.787 1.573v.764h3.239v3.3h-3.041V28.18h-4.614ZM109.578 6.788h4.676v21.39h-4.676V6.789ZM125.118 6.375c5.867 0 8.831 3.575 8.831 11.184v.062c0 6.982-2.582 10.497-7.701 10.924.016 1.146.596 1.559 2.231 1.65l2.644.153-.719 3.652c-5.088-.26-7.273-2.14-6.753-5.485-4.905-.566-7.38-4.08-7.38-10.894v-.061c0-7.61 2.964-11.185 8.847-11.185Zm4.079 12.3V16.49c0-4.355-1.329-6.433-4.095-6.433-2.735 0-4.079 2.078-4.079 6.433v2.185c0 4.217 1.344 6.234 4.095 6.234 2.75 0 4.079-2.017 4.079-6.234Z"/><defs><linearGradient id="a" x1="2.125" x2="34.819" y1="2.125" y2="28.18" gradientUnits="userSpaceOnUse"><stop stop-color="#6AA2E2"/><stop offset=".178" stop-color="#64A0E2"/><stop offset=".375" stop-color="#4878F4"/><stop offset=".63" stop-color="#164CF8"/><stop offset=".808" stop-color="#2F4BA8"/><stop offset="1" stop-color="#1D3686"/></linearGradient><linearGradient id="b" x1="2.125" x2="34.819" y1="2.125" y2="28.18" gradientUnits="userSpaceOnUse"><stop stop-color="#6AA2E2"/><stop offset=".178" stop-color="#64A0E2"/><stop offset=".375" stop-color="#4878F4"/><stop offset=".63" stop-color="#164CF8"/><stop offset=".808" stop-color="#2F4BA8"/><stop offset="1" stop-color="#1D3686"/></linearGradient></defs></svg>
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
									<td align="center">
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
