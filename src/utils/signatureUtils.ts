import signatureImage from '../assets/default-signature.png?inline';

// Returns the supplied factory signature as an inline image for previews and PDF export.
export const getDefaultSignatureDataUrl = (): string => signatureImage;

export function normalizeSignatureImage(dataUrl: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;
			const context = canvas.getContext('2d');
			if (!context) {
				reject(new Error('Could not process signature image'));
				return;
			}

			context.drawImage(image, 0, 0);
			const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
			const pixels = imageData.data;
			for (let index = 0; index < pixels.length; index += 4) {
				const luminance = 0.299 * pixels[index] + 0.587 * pixels[index + 1] + 0.114 * pixels[index + 2];
				const inkOpacity = Math.max(0, Math.min(1, (248 - luminance) / 38));
				pixels[index + 3] = Math.round(pixels[index + 3] * inkOpacity);
			}

			context.putImageData(imageData, 0, 0);
			resolve(canvas.toDataURL('image/png'));
		};
		image.onerror = () => reject(new Error('Could not load signature image'));
		image.src = dataUrl;
	});
}
