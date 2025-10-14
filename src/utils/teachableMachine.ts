// Teachable Machine Image Model Integration
// Based on the original Teachable Machine export code

declare global {
  interface Window {
    tmImage: any;
  }
}

const URL = "https://teachablemachine.withgoogle.com/models/yNh0LxXIx/";

let model: any = null;
let maxPredictions: number = 0;

export interface Prediction {
  className: string;
  probability: number;
}

/**
 * Load the image model and metadata
 * This follows the original Teachable Machine structure
 */
export const loadModel = async (): Promise<void> => {
  if (model) {
    console.log("Model already loaded.");
    return;
  }

  try {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    console.log("Loading Teachable Machine model from:", modelURL);
    console.log("Loading metadata from:", metadataURL);
    
    // Check if tmImage is available
    if (!window.tmImage) {
      throw new Error("tmImage library not loaded. Make sure the Teachable Machine script is included.");
    }
    
    // Load the model and metadata
    // Note: the library adds "tmImage" object to your window (window.tmImage)
    model = await window.tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    
    console.log(`Model loaded successfully with ${maxPredictions} classes.`);
    console.log("Model object:", model);
  } catch (error) {
    console.error("Error loading Teachable Machine model:", error);
    throw new Error("Could not load the classification model. Make sure the model URL is accessible.");
  }
};

/**
 * Run the image through the image model
 * @param imageElement - The image element to classify (can be img, video, or canvas)
 * @returns Promise resolving to array of predictions
 */
export const predict = async (imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<Prediction[]> => {
  if (!model) {
    throw new Error("Model not loaded. Call loadModel() first.");
  }

  try {
    console.log("Making prediction with model...");
    console.log("Image element:", imageElement);
    console.log("Image element type:", imageElement.constructor.name);
    
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(imageElement);
    console.log("Raw prediction result:", prediction);
    
    return prediction;
  } catch (error) {
    console.error("Error making prediction:", error);
    throw new Error("Failed to classify the image.");
  }
};

/**
 * Get the top prediction from the results
 */
export const getTopPrediction = (predictions: Prediction[]): Prediction => {
  return predictions.reduce((prev, current) => 
    (prev.probability > current.probability) ? prev : current
  );
};
