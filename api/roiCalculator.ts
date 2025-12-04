/**
 * ROI Calculator for ProofIQ
 * Calculates savings based on customer inputs
 */

export interface CalculatorInputs {
	annual_lifeline_enrollments: number;
	average_review_time_seconds: number;
	annual_order_volume: number;
	average_non_compliance_cost: number;
}

export interface ROIResults {
	efficiency_gains: number;
	compliance_accuracy: number;
	annual_value_save: number;
}

/**
 * Calculate ROI based on customer inputs
 */
export function calculateROI(inputs: CalculatorInputs): ROIResults {
	const {
		annual_lifeline_enrollments,
		average_review_time_seconds,
		annual_order_volume,
		average_non_compliance_cost
	} = inputs;

	// Efficiency Gains Calculation
	// Assumes 90% time savings on manual review
	// Average hourly rate for compliance staff: $50/hour
	const hourly_rate = 50;
	const hours_saved = (annual_order_volume * (average_review_time_seconds / 3600)) * 0.9;
	const efficiency_gains = Math.round(hours_saved * hourly_rate * 100) / 100;

	// Compliance Accuracy Calculation
	// Assumes 5% reduction in violations/rejections
	// Each violation costs average_non_compliance_cost
	const violation_reduction_rate = 0.05;
	const violations_prevented = annual_order_volume * violation_reduction_rate;
	const compliance_accuracy = Math.round(violations_prevented * average_non_compliance_cost * 100) / 100;

	// Annual Value Save (sum of both)
	const annual_value_save = efficiency_gains + compliance_accuracy;

	return {
		efficiency_gains,
		compliance_accuracy,
		annual_value_save
	};
}

/**
 * Format number as currency string
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
	return new Intl.NumberFormat('en-US').format(num);
}
