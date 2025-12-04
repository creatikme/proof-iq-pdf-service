import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { convertSvgToPdf } from './svgToPdf';
import { uploadPdfToS3 } from './s3Upload';
import { sendROIReportEmail } from './emailService';
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

		// Insert lead into database FIRST (fastest operation)
		const sql = neon(process.env.DATABASE_URL!);
		const result = await sql`
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
		`;

		const leadId = result[0].id;

		// Process PDF generation and email asynchronously (don't wait)
		const hasCalculatorData =
			annual_lifeline_enrollments &&
			average_review_time_seconds &&
			annual_order_volume &&
			average_non_compliance_cost;

		if (hasCalculatorData) {
			// Fire and forget - process in background
			processReportAsync({
				leadId,
				name,
				email,
				company,
				calculatorData: {
					annual_lifeline_enrollments: annual_lifeline_enrollments!,
					average_review_time_seconds: average_review_time_seconds!,
					annual_order_volume: annual_order_volume!,
					average_non_compliance_cost: average_non_compliance_cost!,
				},
			}).catch((error) => {
				console.error('Background processing error:', error);
			});
		}

		// Return immediately
		return response.status(201).json({
			success: true,
			leadId,
			message: 'Lead created successfully' + (hasCalculatorData ? '. Report will be sent shortly.' : ''),
		});
	} catch (error: any) {
		console.error('Error creating lead:', error);
		return response.status(500).json({
			error: 'Failed to create lead',
			message: error?.message || 'Unknown error',
		});
	}
}

// Background processing function
async function processReportAsync(data: {
	leadId: number;
	name: string;
	email: string;
	company?: string;
	calculatorData: {
		annual_lifeline_enrollments: number;
		average_review_time_seconds: number;
		annual_order_volume: number;
		average_non_compliance_cost: number;
	};
}) {
	try {
		// Read SVG file once
		const svgPath = join(__dirname, 'report.svg');
		const reportSvg = readFileSync(svgPath, 'utf-8');

		// Generate PDF
		const pdfBytes = await convertSvgToPdf(
			reportSvg,
			1200,
			data.calculatorData
		);

		// Upload to S3 and send email in parallel
		const s3Config = {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
			region: process.env.AWS_REGION!,
			bucket: process.env.AWS_S3_BUCKET!,
		};

		const sanitizedEmail = data.email.replace(/[^a-zA-Z0-9]/g, '-');

		const [pdfUrl] = await Promise.all([
			uploadPdfToS3(pdfBytes, sanitizedEmail, s3Config),
		]);

		console.log('PDF uploaded:', pdfUrl);

		// Send email with PDF URL
		const emailResult = await sendROIReportEmail(
			{
				name: data.name,
				email: data.email,
				company: data.company,
				pdfUrl,
			},
			process.env.RESEND_API_KEY!
		);

		if (emailResult.success) {
			console.log('Email sent successfully:', emailResult.emailId);

			// Update lead with PDF URL
			const sql = neon(process.env.DATABASE_URL!);
			await sql`
				UPDATE leads 
				SET pdf_report_url = ${pdfUrl}, updated_at = NOW()
				WHERE id = ${data.leadId}
			`;
		} else {
			console.error('Failed to send email:', emailResult.error);
		}
	} catch (error) {
		console.error('Error in background processing:', error);
		// Could add retry logic or dead letter queue here
	}
}
