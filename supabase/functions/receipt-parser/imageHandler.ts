
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
    try {
      // Get the request body as text
      const bodyText = req.bodyText || "{}";
      
      // Parse the JSON safely
      let json;
      try {
        json = JSON.parse(bodyText);
      } catch (e) {
        console.error("JSON parse error:", e);
        throw new Error(`Invalid JSON in request body: ${e.message}`);
      }
      
      // Check if the image property exists and is a valid base64 string
      if (!json.image || typeof json.image !== 'string') {
        console.error("No valid image found in request:", JSON.stringify(json).substring(0, 100));
        throw new Error("No valid image in request body");
      }
      
      if (!json.image.startsWith("data:image")) {
        console.error("Image not in data URL format");
        throw new Error("Image must be in data:image format");
      }
      
      // Determine format
      if (json.image.includes("data:image/png")) {
        originalImageFormat = "png";
      } else if (json.image.includes("data:image/jpeg") || json.image.includes("data:image/jpg")) {
        originalImageFormat = "jpeg";
      }
      
      // Extract base64 data
      const base64Match = json.image.match(/^data:image\/\w+;base64,(.+)$/);
      if (!base64Match) {
        console.error("Invalid base64 format in image");
        throw new Error("Invalid image format: could not extract base64 data");
      }
      
      const base64Data = base64Match[1];
      
      // Convert base64 to binary data
      try {
        fileData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        console.log(`Image type detected: ${originalImageFormat}, Size: ${fileData.length} Bytes`);
      } catch (e) {
        console.error("Base64 decoding error:", e);
        throw new Error(`Failed to decode base64 image: ${e.message}`);
      }
    } catch (error) {
      console.error("Error processing image from request:", error);
      throw new Error(`Failed to process image: ${error.message}`);
    }
  } else {
    console.error(`Unsupported Content-Type: ${contentType}`);
    throw new Error(`Unsupported Content-Type: ${contentType}. Expected application/json.`);
  }

  // Create new FormData
  const formData = new FormData();
  const blob = new Blob([fileData], { type: `image/${originalImageFormat}` });
  formData.append("document", blob, `receipt.${originalImageFormat}`);

  return { formData, originalImageFormat };
}
