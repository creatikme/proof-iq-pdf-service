import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// S3 Configuration - will be provided via environment variables
interface S3Config {
	accessKeyId: string;
	secretAccessKey: string;
	region: string;
	bucket: string;
}

/**
 * Upload PDF to S3 and return the public URL
 */
export async function uploadPdfToS3(
	pdfBuffer: Uint8Array,
	fileName: string,
	config: S3Config
): Promise<string> {
	// Initialize S3 client
	const s3Client = new S3Client({
		region: config.region,
		credentials: {
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey,
		},
	});

	// Generate unique file name with timestamp under proof-iq/ path
	const timestamp = Date.now();
	const uniqueFileName = `proof-iq/${timestamp}-${fileName}.pdf`;

	// Upload to S3
	const command = new PutObjectCommand({
		Bucket: config.bucket,
		Key: uniqueFileName,
		Body: pdfBuffer,
		ContentType: 'application/pdf',
		// Make the object publicly readable (optional - adjust based on your security needs)
		// ACL: 'public-read',
	});

	await s3Client.send(command);

	// Return the public URL
	// Format: https://<bucket>.s3.<region>.amazonaws.com/<key>
	const publicUrl = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${uniqueFileName}`;

	return publicUrl;
}
