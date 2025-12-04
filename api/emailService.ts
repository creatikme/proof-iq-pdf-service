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
							<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMzQiIGhlaWdodD0iMzQiIGZpbGw9Im5vbmUiPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0zLjk1IDQuOTkyYzEuNDU1LTEuNzcxIDMuNzA3LTIuODY4IDYuMDA1LTIuODY3IDQuNzUuMDAzIDkuNS4wMTEgMTQuMjUxLjAxMyAyLjI1OC0uMDAyIDQuNTE3LjAyNCA2Ljc3NS0uMDEtLjY1Mi41OTktMS4yNTUgMS4yNS0xLjg4OCAxLjg2OC0yLjg4MiAyLjgzOS02LjgyMyA0LjU4Mi0xMC44NyA0Ljc1OC00LjA2OC4xNDMtOC4xLS44NDMtMTEuODQzLTIuMzg1IDEuMTIgMi43MTggMS45NTEgNS41NyAyLjI2MiA4LjQ5OC4xNiAxLjU0NS4yMiAzLjExMi4wMTcgNC42NTctLjQwOCAzLjMzNC0xLjg3MyA2LjUyLTQuMTA3IDkuMDIzLS43OC44NDQtMS42IDEuNjUtMi40MjUgMi40NS0uMDA0LTYuOTYgMC0xMy45MjEtLjAwMi0yMC44ODJBNy45MTcgNy45MTcgMCAwIDEgMy45NSA0Ljk5MloiLz48cGF0aCBmaWxsPSJ1cmwoI2IpIiBkPSJNMjguNjc3IDYuNTEyYy45MjgtMS4yNjMgMi4wODMtMi4zMzMgMy4xOTctMy40MjcuMDAzIDYuOTE3LS4wMDMgMTMuODM2LS4wMDMgMjAuNzUzYTcuODY4IDcuODY4IDAgMCAxLTEuODU0IDUuMTk4Yy0xLjQzMyAxLjc0MS0zLjY0OSAyLjc5Mi01LjkgMi44MzItMi42MS4wMS01LjIxOS4wMDEtNy44MjggMC0uNzkyLS4wMTUtMS41ODguMDM3LTIuMzc3LS4wNC0xLjExNC4xMi0yLjIzLS4wMzMtMy4zNDUtLjAwMi0yLjQ2Ni4wMDMtNC45MzItLjAxOC03LjM5OCAwIC42OS0uNjU1IDEuMzQzLTEuMzUgMi4wMjgtMi4wMSAyLjcyMy0yLjUzOSA2LjMyLTQuMTMgMTAuMDM3LTQuMzk1IDQuMjMtLjI2NiA4LjQ3Ny42MTEgMTIuMzkgMi4yLTEuNDY4LTMuNTk0LTIuMzEtNy40NjMtMi4yNjYtMTEuMzU0YTE2LjgwNyAxNi44MDcgMCAwIDEgMy4zMTktOS43NTVaIi8+PHBhdGggZmlsbD0iIzFBMUExQSIgZD0iTTQ4LjMzNiA2Ljc4OGM0LjgxMyAwIDcuMjQyIDIuMjYgNy4yNDIgNi43MjJ2LjA2MmMwIDQuNDMtMi40MyA2LjY3Ny03LjI0MiA2LjY3N0g0NS4wNXY3LjkzaC00LjY3NlY2Ljc4OGg3Ljk2Wm0tLjQ1OSA5Ljg1NWMyLjEwOSAwIDMuMTMyLTEuMDA5IDMuMTMyLTMuMDcxdi0uMDYyYzAtMi4wOTMtMS4wMjMtMy4xMTctMy4xMzItMy4xMTdINDUuMDV2Ni4yNWgyLjgyN1pNNTcuMDMgMjguMTc5VjEyLjEzNWg0LjU1M2MuMDQ2IDEuMTQ2LS4xMjIgMS45NTYtLjg1NSAzLjg4MWwuMjkuMTUzYzEuNTg5LTMuMjg1IDIuOTM0LTQuMjkzIDUuNjIzLTQuNTg0bC41NSA0LjE0LTEuNTEzLjEzOWMtMi44NzIuMjQ0LTQuMDQ5IDEuNDUxLTQuMDQ5IDUuNjA3djYuNzA4SDU3LjAzWk03NC43MDkgMjguNTkxYy00LjY2IDAtNy4yNTgtMy4wMjUtNy4yNTgtOC4zNzN2LS4wNjFjMC01LjM3OCAyLjU5OC04LjQzNCA3LjI1OC04LjQzNCA0LjY3NSAwIDcuMjg4IDMuMDU2IDcuMjg4IDguNDM0di4wNjFjMCA1LjM0OC0yLjYxMyA4LjM3My03LjI4OCA4LjM3M1ptMC0zLjE2M2MxLjcxMSAwIDIuNTUxLTEuNDIgMi41NTEtNC4zN3YtMS43ODdjMC0yLjk2NC0uODQtNC4zODUtMi41NTEtNC4zODUtMS42OTYgMC0yLjUyMSAxLjQyLTIuNTIxIDQuMzg1djEuNzg3YzAgMi45NS44MjUgNC4zNyAyLjUyIDQuMzdaTTkwLjQ5MyAyOC41OTFjLTQuNjYgMC03LjI1OC0zLjAyNS03LjI1OC04LjM3M3YtLjA2MWMwLTUuMzc4IDIuNTk4LTguNDM0IDcuMjU4LTguNDM0IDQuNjc1IDAgNy4yODggMy4wNTYgNy4yODggOC40MzR2LjA2MWMwIDUuMzQ4LTIuNjEzIDguMzczLTcuMjg4IDguMzczWm0wLTMuMTYzYzEuNzExIDAgMi41NTItMS40MiAyLjU1Mi00LjM3di0xLjc4N2MwLTIuOTY0LS44NC00LjM4NS0yLjU1Mi00LjM4NS0xLjY5NiAwLTIuNTIxIDEuNDItMi41MjEgNC4zODV2MS43ODdjMCAyLjk1LjgyNSA0LjM3IDIuNTIxIDQuMzdaTTEwMC4zNjQgMjguMTc5VjE1LjQzNmgtMi4wMTd2LTMuM2gyLjAxN3YtLjg3MmMwLTMuNDY4IDEuODk1LTQuNTA3IDcuMjczLTQuODg5bC40NDMgMy4zMTYtMS41MTMuMTA3Yy0xLjQ5Ny4wOTEtMS43ODcuNDczLTEuNzg3IDEuNTczdi43NjRoMy4yMzl2My4zaC0zLjA0MVYyOC4xOGgtNC42MTRaTTEwOS41NzggNi43ODhoNC42NzZ2MjEuMzloLTQuNjc2VjYuNzg5Wk0xMjUuMTE4IDYuMzc1YzUuODY3IDAgOC44MzEgMy41NzUgOC44MzEgMTEuMTg0di4wNjJjMCA2Ljk4Mi0yLjU4MiAxMC40OTctNy43MDEgMTAuOTI0LjAxNiAxLjE0Ni41OTYgMS41NTkgMi4yMzEgMS42NWwyLjY0NC4xNTMtLjcxOSAzLjY1MmMtNS4wODgtLjI2LTcuMjczLTIuMTQtNi43NTMtNS40ODUtNC45MDUtLjU2Ni03LjM4LTQuMDgtNy4zOC0xMC44OTR2LS4wNjFjMC03LjYxIDIuOTY0LTExLjE4NSA4Ljg0Ny0xMS4xODVabTQuMDc5IDEyLjNWMTYuNDljMC00LjM1NS0xLjMyOS02LjQzMy00LjA5NS02LjQzMy0yLjczNSAwLTQuMDc5IDIuMDc4LTQuMDc5IDYuNDMzdjIuMTg1YzAgNC4yMTcgMS4zNDQgNi4yMzQgNC4wOTUgNi4yMzQgMi43NSAwIDQuMDc5LTIuMDE3IDQuMDc5LTYuMjM0WiIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iYSIgeDE9IjIuMTI1IiB4Mj0iMzQuODE5IiB5MT0iMi4xMjUiIHkyPSIyOC4xOCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIHN0b3AtY29sb3I9IiM2QUEyRTIiLz48c3RvcCBvZmZzZXQ9Ii4xNzgiIHN0b3AtY29sb3I9IiM2NEEwRTIiLz48c3RvcCBvZmZzZXQ9Ii4zNzUiIHN0b3AtY29sb3I9IiM0ODc4RjQiLz48c3RvcCBvZmZzZXQ9Ii42MyIgc3RvcC1jb2xvcj0iIzE2NENGOCIvPjxzdG9wIG9mZnNldD0iLjgwOCIgc3RvcC1jb2xvcj0iIzJGNEJBOCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzFEMzY4NiIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJiIiB4MT0iMi4xMjUiIHgyPSIzNC44MTkiIHkxPSIyLjEyNSIgeTI9IjI4LjE4IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzZBQTJFMiIvPjxzdG9wIG9mZnNldD0iLjE3OCIgc3RvcC1jb2xvcj0iIzY0QTBFMiIvPjxzdG9wIG9mZnNldD0iLjM3NSIgc3RvcC1jb2xvcj0iIzQ4NzhGNCIvPjxzdG9wIG9mZnNldD0iLjYzIiBzdG9wLWNvbG9yPSIjMTY0Q0Y4Ii8+PHN0b3Agb2Zmc2V0PSIuODA4IiBzdG9wLWNvbG9yPSIjMkY0QkE4Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMUQzNjg2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+" alt="ProofIQ" width="134" height="34" style="display: block; border: 0;">
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
