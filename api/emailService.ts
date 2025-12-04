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

	return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Your ProofIQ ROI Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa;">
	<table role="presentation" style="width: 100%; border-collapse: collapse;">
		<tr>
			<td align="center" style="padding: 40px 20px;">
				<table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
					
					<!-- Header -->
					<tr>
						<td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #5a7fe6 0%, #3d5fc4 100%); border-radius: 12px 12px 0 0;">
							<h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
								🛡️ ProofIQ
							</h1>
							<p style="margin: 10px 0 0; color: #e8eeff; font-size: 14px;">
								AI-Powered Lifeline Compliance Audits
							</p>
						</td>
					</tr>

					<!-- Main Content -->
					<tr>
						<td style="padding: 40px;">
							<h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">
								Hi ${firstName},
							</h2>
							
							<p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
								Thank you for your interest in ProofIQ! We've prepared a personalized ROI analysis ${company ? `for <strong>${company}</strong>` : 'for your organization'}.
							</p>

							<p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
								Your custom report shows the measurable impact ProofIQ can deliver:
							</p>

							<!-- Benefits List -->
							<table role="presentation" style="width: 100%; margin-bottom: 30px;">
								<tr>
									<td style="padding: 16px; background-color: #f0f4ff; border-radius: 8px; margin-bottom: 12px;">
										<div style="display: flex; align-items: start;">
											<span style="font-size: 24px; margin-right: 12px;">⚡</span>
											<div>
												<strong style="color: #2d3748; font-size: 16px; display: block; margin-bottom: 4px;">
													90%+ Faster Audit Processing
												</strong>
												<span style="color: #5a6c7d; font-size: 14px;">
													Automate NLAD/RAD checks, duplicate detection, and eligibility validations
												</span>
											</div>
										</div>
									</td>
								</tr>
								<tr>
									<td style="padding: 16px; background-color: #f0f4ff; border-radius: 8px; margin-bottom: 12px;">
										<div style="display: flex; align-items: start;">
											<span style="font-size: 24px; margin-right: 12px;">✅</span>
											<div>
												<strong style="color: #2d3748; font-size: 16px; display: block; margin-bottom: 4px;">
													Near-Perfect Compliance Accuracy
												</strong>
												<span style="color: #5a6c7d; font-size: 14px;">
													Eliminate human errors with AI-powered FCC/USAC rule enforcement
												</span>
											</div>
										</div>
									</td>
								</tr>
								<tr>
									<td style="padding: 16px; background-color: #f0f4ff; border-radius: 8px;">
										<div style="display: flex; align-items: start;">
											<span style="font-size: 24px; margin-right: 12px;">💰</span>
											<div>
												<strong style="color: #2d3748; font-size: 16px; display: block; margin-bottom: 4px;">
													Significant Cost Savings
												</strong>
												<span style="color: #5a6c7d; font-size: 14px;">
													Reduce manual review time and avoid costly non-compliance penalties
												</span>
											</div>
										</div>
									</td>
								</tr>
							</table>

							${
								pdfUrl
									? `
							<!-- Download Report Section -->
							<table role="presentation" style="width: 100%; margin: 30px 0; padding: 24px; background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%); border-radius: 12px; border: 2px solid #5a7fe6;">
								<tr>
									<td align="center">
										<p style="margin: 0 0 16px; color: #2d3748; font-size: 18px; font-weight: 600;">
											📊 Your Personalized ROI Report is Ready!
										</p>
										<p style="margin: 0 0 20px; color: #5a6c7d; font-size: 14px;">
											Click below to download your detailed analysis
										</p>
										<a href="${pdfUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
											⬇️ Download Your Report
										</a>
									</td>
								</tr>
							</table>
							`
									: ''
							}

							<!-- CTA Button -->
							<table role="presentation" style="width: 100%; margin: 30px 0;">
								<tr>
									<td align="center">
										<a href="https://proofiqapp.com/demo" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #5a7fe6 0%, #3d5fc4 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(90, 127, 230, 0.3);">
											📅 Schedule Your Demo
										</a>
									</td>
								</tr>
							</table>

							<p style="margin: 30px 0 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
								Ready to transform your Lifeline compliance operations? Let's discuss how ProofIQ can become your competitive advantage.
							</p>

							<p style="margin: 20px 0 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
								Best regards,<br>
								<strong style="color: #2d3748;">The ProofIQ Team</strong>
							</p>
						</td>
					</tr>

					<!-- Footer -->
					<tr>
						<td style="padding: 30px 40px; background-color: #f8fafc; border-radius: 0 0 12px 12px; text-align: center;">
							<p style="margin: 0 0 12px; color: #718096; font-size: 14px;">
								<strong>ProofIQ</strong> - AI-Powered Lifeline Compliance Audits
							</p>
							<p style="margin: 0 0 12px; color: #a0aec0; font-size: 13px;">
								Maximize Accuracy. Minimize Delays.
							</p>
							<p style="margin: 0; color: #cbd5e0; font-size: 12px;">
								© ${new Date().getFullYear()} ProofIQ. All rights reserved.
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
