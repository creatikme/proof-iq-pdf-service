import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { convertSvgToPdf } from './svgToPdf';
import { uploadPdfToS3 } from './s3Upload';
import { sendROIReportEmail, sendAdminNotificationEmail } from './emailService';
import { readFileSync } from 'fs';
import { join } from 'path';

interface LeadData {
	name: string;
	email: string;
	phone?: string;
	company?: string;
	message?: string;
	source?: string;
	annual_lifeline_enrollments?: number;
	average_review_time_seconds?: number;
	annual_order_volume?: number;
	average_non_compliance_cost?: number;
}

export default async function handler(
	request: VercelRequest,
	response: VercelResponse
) {
	// Enable CORS
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (request.method === 'OPTIONS') {
		return response.status(200).end();
	}

	if (request.method === 'GET') {
		// Health check
		return response.status(200).json({ status: 'ok' });
	}

	if (request.method !== 'POST') {
		return response.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const {
			name,
			email,
			phone,
			company,
			message,
			source,
			annual_lifeline_enrollments,
			average_review_time_seconds,
			annual_order_volume,
			average_non_compliance_cost,
		} = request.body as LeadData;

		// Validate required fields
		if (!name || !email) {
			return response.status(400).json({ error: 'Name and email are required' });
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return response.status(400).json({ error: 'Invalid email format' });
		}

		// Check if we need to generate PDF
		const hasCalculatorData =
			annual_lifeline_enrollments &&
			average_review_time_seconds &&
			annual_order_volume &&
			average_non_compliance_cost;

		let pdfUrl: string | null = null;
		let emailSent = false;
		let adminNotified = false;

		// Start DB insert and PDF generation in parallel
		const sql = neon(process.env.DATABASE_URL!);
		
		const [dbResult, pdfResult] = await Promise.all([
			// Database insert
			sql`
				INSERT INTO leads (
					name, email, phone, company, message, source,
					annual_lifeline_enrollments, average_review_time_seconds,
					annual_order_volume, average_non_compliance_cost,
					pdf_report_url, status, created_at, updated_at
				)
				VALUES (
					${name}, ${email}, ${phone || null}, ${company || null},
					${message || null}, ${source || null},
					${annual_lifeline_enrollments || null}, ${average_review_time_seconds || null},
					${annual_order_volume || null}, ${average_non_compliance_cost || null},
					${null}, 'new', NOW(), NOW()
				)
				RETURNING id
			`,
			// PDF generation (if needed)
			hasCalculatorData
				? (async () => {
						const svgPath = join(__dirname, 'report.svg');
						const reportSvg = readFileSync(svgPath, 'utf-8');
						return convertSvgToPdf(reportSvg, 1200, {
							annual_lifeline_enrollments: annual_lifeline_enrollments!,
							average_review_time_seconds: average_review_time_seconds!,
							annual_order_volume: annual_order_volume!,
							average_non_compliance_cost: average_non_compliance_cost!,
						});
				  })()
				: Promise.resolve(null),
		]);

		const leadId = dbResult[0].id;

		// If PDF was generated, upload to S3 and send email in parallel
		if (pdfResult) {
			const s3Config = {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
				region: process.env.AWS_REGION!,
				bucket: process.env.AWS_S3_BUCKET!,
			};

			const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, '-');

			try {
				// Upload PDF to S3
				pdfUrl = await uploadPdfToS3(pdfResult, sanitizedEmail, s3Config);
				console.log('PDF uploaded:', pdfUrl);

				// Send emails and update DB in parallel
				const [emailResult, adminResult] = await Promise.all([
					sendROIReportEmail(
						{ name, email, company, pdfUrl },
						process.env.RESEND_API_KEY!
					),
					sendAdminNotificationEmail(
						{
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
						},
						process.env.RESEND_API_KEY!
					),
					sql`
						UPDATE leads
						SET pdf_report_url = ${pdfUrl}, updated_at = NOW()
						WHERE id = ${leadId}
					`,
				]);

				if (emailResult.success) {
					console.log('Email sent successfully:', emailResult.emailId);
					emailSent = true;
				} else {
					console.error('Failed to send email:', emailResult.error);
				}

				if (adminResult.success) {
					console.log('Admin notified successfully:', adminResult.emailId);
					adminNotified = true;
				} else {
					console.error('Failed to notify admin:', adminResult.error);
				}
			} catch (pdfError) {
				console.error('Error processing PDF/email:', pdfError);
			}
		} else {
			// No PDF, but still notify admin about the new lead
			try {
				const adminResult = await sendAdminNotificationEmail(
					{
						name,
						email,
						phone,
						company,
						message,
						source,
						annual_lifeline_enrollments,
						average_review_time_seconds,
						annual_order_volume,
						average_non_compliance_cost,
					},
					process.env.RESEND_API_KEY!
				);

				if (adminResult.success) {
					console.log('Admin notified successfully:', adminResult.emailId);
					adminNotified = true;
				} else {
					console.error('Failed to notify admin:', adminResult.error);
				}
			} catch (adminError) {
				console.error('Error sending admin notification:', adminError);
			}
		}

		return response.status(201).json({
			success: true,
			leadId,
			pdfUrl,
			emailSent,
			message: 'Lead created successfully' + (emailSent ? ' and email sent' : ''),
		});
	} catch (error: any) {
		console.error('Error creating lead:', error);
		return response.status(500).json({
			error: 'Failed to create lead',
			message: error?.message || 'Unknown error',
		});
	}
}
