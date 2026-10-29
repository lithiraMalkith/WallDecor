export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_REFERENCE_IMAGES = 5;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function imageFileError(file: { type: string; size: number }): string | undefined {
  if (!IMAGE_TYPES.includes(file.type)) return 'Choose a JPG, PNG, or WEBP image.';
  if (file.size === 0) return 'This image is empty. Please choose another file.';
  if (file.size > MAX_IMAGE_BYTES) return 'Each image must be 10MB or smaller.';
}

// Keep requests below the hosting platform's body limit while accepting
// reference photos up to the 10MB limit shown in the form.
export async function prepareImageUpload(file: File): Promise<File> {
  if (file.size <= 3 * 1024 * 1024) return file;
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    let edge = Math.min(2560, Math.max(bitmap.width, bitmap.height));
    for (let attempt = 0; attempt < 4; attempt++) {
      const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('This photo could not be prepared. Please try another image.');
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.85));
      if (blob && blob.size <= 3 * 1024 * 1024) return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: blob.type });
      edge = Math.round(edge * 0.7);
    }
    throw new Error('Please choose a smaller reference image.');
  } finally { bitmap.close(); }
}
