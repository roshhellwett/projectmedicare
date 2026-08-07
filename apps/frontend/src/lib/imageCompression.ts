/**
 * Compresses an image file locally in the browser using HTML5 Canvas
 * before uploading it to the server.
 *
 * @param file The original File object from an input element
 * @param maxWidth The maximum width to scale the image to
 * @param quality The image quality (0 to 1) for JPEG/WebP
 * @returns A Promise resolving to a new Blob/File containing the compressed image
 */
export async function compressImage(
  file: File,
  maxWidth = 1000,
  quality = 0.7,
): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File must be an image"));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob (prefer webp, fallback to jpeg)
        const format = "image/webp";
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            // Create a new File from the Blob
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".webp"),
              {
                type: format,
                lastModified: Date.now(),
              },
            );

            resolve(compressedFile);
          },
          format,
          quality,
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
