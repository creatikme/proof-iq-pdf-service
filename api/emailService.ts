import { Resend } from 'resend';

interface EmailData {
	name: string;
	email: string;
	company?: string;
	pdfUrl?: string;
}

interface AdminNotificationData {
	name: string;
	email: string;
	phone?: string;
	company?: string;
	message?: string;
	source?: string;
	pdfUrl?: string;
	annual_lifeline_enrollments?: number;
	average_review_time_seconds?: number;
	annual_order_volume?: number;
	average_non_compliance_cost?: number;
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
	
	const logoUrl = 'https://rwkxzth5o4gld2dh.public.blob.vercel-storage.com/proof-iq-logo.png';

	const pdfSection = pdfUrl
		? `
			<p style="margin: 0 0 24px; color: #3f3f46; font-size: 15px;">
				Your custom report is ready to download and includes detailed projections based on your specific requirements.
			</p>

			<table role="presentation" style="width: 100%; margin: 0 0 32px;">
				<tr>
					<td align="center">
						<a href="${pdfUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2256f7; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; border-radius: 4px;">
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
						<td style="padding: 20px 40px; border-bottom: 1px solid #e4e4e7;">
							<img src="${logoUrl}" alt="ProofIQ" width="134" height="34" style="display: block; border: 0;">
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
										<a href="https://proofiqapp.com/demo" style="display: inline-block; padding: 12px 24px; background-color: #2256f7; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; border-radius: 4px;">
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
						<td style="padding: 16px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
							<p style="margin: 0 0 4px; color: #71717a; font-size: 13px;">
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

const ADMIN_EMAIL = 'creatikme@gmail.com';

export async function sendAdminNotificationEmail(
	leadData: AdminNotificationData,
	resendApiKey: string
): Promise<{ success: boolean; emailId?: string; error?: string }> {
	try {
		const resend = new Resend(resendApiKey);

		const emailHtml = createAdminEmailTemplate(leadData);

		const { data, error } = await resend.emails.send({
			from: 'ProofIQ <noreply@proofiqapp.com>',
			to: ADMIN_EMAIL,
			subject: `ProofIQ Lead: ${leadData.name}${leadData.company ? ` from ${leadData.company}` : ''}`,
			html: emailHtml,
			tags: [
				{ name: 'type', value: 'admin_notification' },
				{ name: 'source', value: 'lead_form' },
			],
		});

		if (error) {
			console.error('Admin notification error:', error);
			return { success: false, error: error.message };
		}

		return { success: true, emailId: data?.id };
	} catch (error) {
		console.error('Admin notification service error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

function createAdminEmailTemplate(data: AdminNotificationData): string {
	const {
		name,
		email,
		phone,
		company,
		message,
		source,
		pdfUrl,
		annual_lifeline_enrollments,
		average_review_time_seconds,
		annual_order_volume,
		average_non_compliance_cost,
	} = data;

	const hasCalculatorData =
		annual_lifeline_enrollments &&
		average_review_time_seconds &&
		annual_order_volume &&
		average_non_compliance_cost;

	const logoUrl = 'https://rwkxzth5o4gld2dh.public.blob.vercel-storage.com/proof-iq-logo.png';

	const calculatorSection = hasCalculatorData
		? `
			<tr>
				<td style="padding: 20px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px;">
					<p style="margin: 0 0 12px; color: #0369a1; font-size: 14px; font-weight: 600;">
						Calculator Data Submitted
					</p>
					<table role="presentation" style="width: 100%;">
						<tr>
							<td style="padding: 4px 0; color: #3f3f46; font-size: 14px;">Annual Lifeline Enrollments:</td>
							<td style="padding: 4px 0; color: #18181b; font-size: 14px; font-weight: 500; text-align: right;">${annual_lifeline_enrollments?.toLocaleString()}</td>
						</tr>
						<tr>
							<td style="padding: 4px 0; color: #3f3f46; font-size: 14px;">Average Review Time:</td>
							<td style="padding: 4px 0; color: #18181b; font-size: 14px; font-weight: 500; text-align: right;">${average_review_time_seconds} seconds</td>
						</tr>
						<tr>
							<td style="padding: 4px 0; color: #3f3f46; font-size: 14px;">Annual Order Volume:</td>
							<td style="padding: 4px 0; color: #18181b; font-size: 14px; font-weight: 500; text-align: right;">${annual_order_volume?.toLocaleString()}</td>
						</tr>
						<tr>
							<td style="padding: 4px 0; color: #3f3f46; font-size: 14px;">Average Non-Compliance Cost:</td>
							<td style="padding: 4px 0; color: #18181b; font-size: 14px; font-weight: 500; text-align: right;">$${average_non_compliance_cost?.toLocaleString()}</td>
						</tr>
					</table>
				</td>
			</tr>
			<tr><td style="height: 16px;"></td></tr>
		`
		: '';

	const pdfSection = pdfUrl
		? `
			<tr>
				<td align="center" style="padding-top: 16px;">
					<a href="${pdfUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2256f7; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; border-radius: 4px;">
						View PDF Report
					</a>
				</td>
			</tr>
		`
		: '';

	return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>New Lead Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; line-height: 1.6;">
	<table role="presentation" style="width: 100%; border-collapse: collapse;">
		<tr>
			<td align="center" style="padding: 40px 20px;">
				<table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e4e4e7;">

					<tr>
						<td style="padding: 20px 40px; border-bottom: 1px solid #e4e4e7;">
							<img src="${logoUrl}" alt="ProofIQ" width="134" height="34" style="display: block; border: 0;">
						</td>
					</tr>

					<tr>
						<td style="padding: 32px 40px;">
							<p style="margin: 0 0 8px; color: #71717a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
								New Lead Received
							</p>
							<p style="margin: 0 0 24px; color: #18181b; font-size: 20px; font-weight: 600;">
								${name}${company ? ` &mdash; ${company}` : ''}
							</p>

							<table role="presentation" style="width: 100%; margin-bottom: 24px;">
								<tr>
									<td style="padding: 12px 16px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 4px;">
										<table role="presentation" style="width: 100%;">
											<tr>
												<td style="padding: 4px 0; color: #71717a; font-size: 13px; width: 100px;">Name</td>
												<td style="padding: 4px 0; color: #18181b; font-size: 14px; font-weight: 500;">${name}</td>
											</tr>
											<tr>
												<td style="padding: 4px 0; color: #71717a; font-size: 13px;">Email</td>
												<td style="padding: 4px 0; color: #18181b; font-size: 14px;">
													<a href="mailto:${email}" style="color: #2256f7; text-decoration: none;">${email}</a>
												</td>
											</tr>
											${phone ? `
											<tr>
												<td style="padding: 4px 0; color: #71717a; font-size: 13px;">Phone</td>
												<td style="padding: 4px 0; color: #18181b; font-size: 14px;">
													<a href="tel:${phone}" style="color: #2256f7; text-decoration: none;">${phone}</a>
												</td>
											</tr>
											` : ''}
											${company ? `
											<tr>
												<td style="padding: 4px 0; color: #71717a; font-size: 13px;">Company</td>
												<td style="padding: 4px 0; color: #18181b; font-size: 14px; font-weight: 500;">${company}</td>
											</tr>
											` : ''}
											${source ? `
											<tr>
												<td style="padding: 4px 0; color: #71717a; font-size: 13px;">Source</td>
												<td style="padding: 4px 0; color: #18181b; font-size: 14px;">${source}</td>
											</tr>
											` : ''}
										</table>
									</td>
								</tr>
							</table>

							${message ? `
							<table role="presentation" style="width: 100%; margin-bottom: 24px;">
								<tr>
									<td style="padding: 16px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 4px;">
										<p style="margin: 0 0 8px; color: #a16207; font-size: 13px; font-weight: 600;">
											Message from Lead
										</p>
										<p style="margin: 0; color: #3f3f46; font-size: 14px;">
											${message}
										</p>
									</td>
								</tr>
							</table>
							` : ''}

							<table role="presentation" style="width: 100%;">
								${calculatorSection}
								${pdfSection}
							</table>
						</td>
					</tr>

					<tr>
						<td style="padding: 16px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
							<p style="margin: 0; color: #a1a1aa; font-size: 12px;">
								This is an automated notification from ProofIQ Lead Management System.
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
