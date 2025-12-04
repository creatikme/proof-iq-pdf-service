import type { VercelRequest, VercelResponse } from '@vercel/node';
import { convertSvgToPdf } from './svgToPdf.js';
import reportSvg from './report.svg';

interface CalculatorInputs {
	annual_lifeline_enrollments: number;
	average_review_time_seconds: number;
	annual_order_volume: number;
	average_non_compliance_cost: number;
}

export default async function handler(
	request: VercelRequest,
	response: VercelResponse
) {
	// Only allow POST requests
	if (request.method !== 'POST') {
		return response.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const {
			annual_lifeline_enrollments,
			average_review_time_seconds,
			annual_order_volume,
			average_non_compliance_cost,
		} = request.body as CalculatorInputs;

		// Validate required fields
		if (
			!annual_lifeline_enrollments ||
			!average_review_time_seconds ||
			!annual_order_volume ||
			!average_non_compliance_cost
		) {
			return response.status(400).json({
				error: 'Missing required calculator data',
			});
		}

		const calculatorData: CalculatorInputs = {
			annual_lifeline_enrollments,
			average_review_time_seconds,
			annual_order_volume,
			average_non_compliance_cost,
		};

		// Generate PDF with calculated ROI values
		const pdfBytes = await convertSvgToPdf(reportSvg, 1200, calculatorData);

		// Return PDF as base64
		const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

		return response.status(200).json({
			success: true,
			pdf: pdfBase64,
		});
	} catch (error: any) {
		console.error('Error generating PDF:', error);
		return response.status(500).json({
			error: 'Failed to generate PDF',
			message: error?.message || 'Unknown error',
		});
	}
}
