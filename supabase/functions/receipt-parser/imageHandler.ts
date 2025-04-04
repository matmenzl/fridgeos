
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

  console.log("Processing request with Content-Type:", contentType);

  if (contentType.includes("application/json")) {
    try {
      // Get the request body as JSON
      let json;
      
      try {
        // If we have the bodyText property from req (added in index.ts)
        if (req.bodyText) {
          console.log("Using pre-parsed bodyText");
          json = JSON.parse(req.bodyText);
        } else {
          // Try to parse the request body directly
          const requestBodyText = req.text ? await req.text() : "";
          console.log("Request body text length:", requestBodyText.length);
          
          if (requestBodyText && requestBodyText.length > 0) {
            try {
              json = JSON.parse(requestBodyText);
            } catch (e) {
              console.error("Failed to parse request body text:", e);
              throw new Error(`Invalid JSON in request body: ${e.message}`);
            }
          } else {
            throw new Error("Empty request body");
          }
        }
      } catch (e) {
        console.error("Error accessing request body:", e);
        throw new Error(`Could not access request body: ${e.message}`);
      }
      
      console.log("JSON parsed successfully, checking for image data");
      
      // Check if the image property exists and is a valid base64 string
      if (!json.image || typeof json.image !== 'string') {
        console.error("No valid image found in request");
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
