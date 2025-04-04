
/**
 * Processes an image from the request body and converts it to a form suitable for the Mindee API
 */
export function processImageFromRequest(req: Request): { 
  formData: FormData; 
  originalImageFormat: string; 
} {
  // Parse request body
  const contentType = req.headers.get("content-type") || "";
  let fileData: Uint8Array;
  let originalImageFormat = "jpeg"; // Default format

  if (contentType.includes("application/json")) {
    const json = JSON.parse(req.body as string);
    
    // If the image is sent as a base64 string
    if (json.image && json.image.startsWith("data:image")) {
      // Determine format
      if (json.image.includes("data:image/png")) {
        originalImageFormat = "png";
      } else if (json.image.includes("data:image/jpeg") || json.image.includes("data:image/jpg")) {
        originalImageFormat = "jpeg";
      }
      
      // Extract base64 data
      const base64Match = json.image.match(/^data:image\/\w+;base64,(.+)$/);
      if (!base64Match) {
        throw new Error("Invalid image format");
      }
      
      const base64Data = base64Match[1];
      // Convert base64 to binary data
      fileData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      console.log(`Image type detected: ${originalImageFormat}, Size: ${fileData.length} Bytes`);
    } else {
      throw new Error("Image not in correct format");
    }
  } else {
    throw new Error("Unsupported Content-Type");
  }

  // Create new FormData
  const formData = new FormData();
  const blob = new Blob([fileData], { type: `image/${originalImageFormat}` });
  formData.append("document", blob, `receipt.${originalImageFormat}`);

  return { formData, originalImageFormat };
}
