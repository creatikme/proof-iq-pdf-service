import { Resvg } from '@cf-wasm/resvg';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { injectDynamicValues } from './svgDynamicValues';
import { CalculatorInputs, calculateROI, formatCurrency } from './roiCalculator';

/**
 * Converts an SVG string to a PDF buffer
 * Uses resvg WASM to convert SVG → PNG, then embeds in PDF
 * Optionally injects dynamic calculator values into the SVG
 */
export async function convertSvgToPdf(
	svgString: string,
	width?: number,
	calculatorData?: CalculatorInputs
): Promise<Uint8Array> {
	// Step 1: Convert SVG to PNG using resvg WASM (without text, since resvg doesn't render fonts properly)
	const opts = {
		fitTo: width ? {
			mode: 'width' as const,
			value: width,
		} : undefined,
	};

	const resvg = new Resvg(svgString, opts);
	const pngData = resvg.render();
	const pngBuffer = pngData.asPng();

	// Get the PNG dimensions
	const { width: pngWidth, height: pngHeight } = pngData;

	// Calculate scale factor: SVG original is 776 width, scaled to target width
	const originalSvgWidth = 776;
	const scale = pngWidth / originalSvgWidth;

	// Step 2: Create a PDF and embed the PNG
	const pdfDoc = await PDFDocument.create();

	// Create a page that matches the PNG dimensions
	const page = pdfDoc.addPage([pngWidth, pngHeight]);

	// Embed the PNG image
	const pngImage = await pdfDoc.embedPng(pngBuffer);

	// Draw the image to fill the entire page
	page.drawImage(pngImage, {
		x: 0,
		y: 0,
		width: pngWidth,
		height: pngHeight,
	});

	// Step 3: If calculator data provided, draw text overlays using pdf-lib
	if (calculatorData) {
		const roi = calculateROI(calculatorData);
		const efficiencyGains = formatCurrency(roi.efficiency_gains);
		const complianceAccuracy = formatCurrency(roi.compliance_accuracy);
		const annualValueSave = formatCurrency(roi.annual_value_save);

		// Embed font
		const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

		// Colors
		const lightBlue = rgb(0.92, 0.95, 1); // #ebf3ff
		const textColor = rgb(0.06, 0.09, 0.16); // #0F172A

		// SVG coordinates from svgDynamicValues.ts, scaled to PNG size
		// Card 1: rect x="55" y="335", text x="65" y="370"
		page.drawRectangle({
			x: 55 * scale,
			y: pngHeight - (335 * scale) - (50 * scale),
			width: 210 * scale,
			height: 50 * scale,
			color: lightBlue,
		});

		page.drawText(efficiencyGains, {
			x: 65 * scale,
			y: pngHeight - (370 * scale),
			size: 28 * scale,
			font: font,
			color: textColor,
		});

		// Card 2: rect x="285" y="335", text x="295" y="370"
		page.drawRectangle({
			x: 285 * scale,
			y: pngHeight - (335 * scale) - (50 * scale),
			width: 210 * scale,
			height: 50 * scale,
			color: lightBlue,
		});

		page.drawText(complianceAccuracy, {
			x: 295 * scale,
			y: pngHeight - (370 * scale),
			size: 28 * scale,
			font: font,
			color: textColor,
		});

		// Card 3: rect x="540" y="400", text x="560" y="440"
		page.drawRectangle({
			x: 540 * scale,
			y: pngHeight - (400 * scale) - (45 * scale),
			width: 150 * scale,
			height: 45 * scale,
			color: lightBlue,
		});

		page.drawText(annualValueSave, {
			x: 560 * scale,
			y: pngHeight - (440 * scale),
			size: 28 * scale,
			font: font,
			color: textColor,
		});
	}

	// Step 4: Save and return the PDF
	const pdfBytes = await pdfDoc.save();
	return pdfBytes;
}
