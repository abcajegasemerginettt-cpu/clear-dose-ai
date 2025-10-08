// Teachable Machine Model Integration
// This file contains the code to integrate with Google's Teachable Machine model
// for tablet/capsule classification

export interface ClassificationResult {
  className: 'tablet' | 'capsule';
  probability: number;
}

export class TeachableMachineClassifier {
  private model: any = null;
  private modelUrl: string;

  constructor(modelUrl: string) {
    this.modelUrl = modelUrl;
  }

  // Load the Teachable Machine model
  async loadModel(): Promise<void> {
    try {
      // Import TensorFlow.js and Teachable Machine libraries
      const tf = await import('@tensorflow/tfjs');
      const tmImage = await import('@teachablemachine/image');

      // Load the model from the URL
      this.model = await tmImage.load(this.modelUrl + 'model.json', this.modelUrl + 'metadata.json');
      console.log('Teachable Machine model loaded successfully');
    } catch (error) {
      console.error('Failed to load Teachable Machine model:', error);
      throw new Error('Model loading failed');
    }
  }

  // Classify an image (from canvas or image element)
  async classifyImage(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<ClassificationResult> {
    if (!this.model) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    try {
      // Get predictions from the model
      const predictions = await this.model.predict(imageElement);
      
      // Find the prediction with highest probability
      let bestPrediction = predictions[0];
      for (const prediction of predictions) {
        if (prediction.probability > bestPrediction.probability) {
          bestPrediction = prediction;
        }
      }

      // Map class names to our expected format
      const className = this.mapClassName(bestPrediction.className);
      
      return {
        className,
        probability: bestPrediction.probability
      };
    } catch (error) {
      console.error('Classification failed:', error);
      throw new Error('Image classification failed');
    }
  }

  // Classify from base64 image data
  async classifyFromBase64(base64Image: string): Promise<ClassificationResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const result = await this.classifyImage(img);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = base64Image;
    });
  }

  // Map Teachable Machine class names to our expected format
  private mapClassName(className: string): 'tablet' | 'capsule' {
    const lowerClassName = className.toLowerCase();
    
    // Add your specific class name mappings here
    if (lowerClassName.includes('tablet') || lowerClassName.includes('pill')) {
      return 'tablet';
    } else if (lowerClassName.includes('capsule')) {
      return 'capsule';
    }
    
    // Default fallback - you may want to adjust this based on your model's class names
    return lowerClassName.includes('capsule') ? 'capsule' : 'tablet';
  }

  // Check if model is loaded
  isModelLoaded(): boolean {
    return this.model !== null;
  }

  // Dispose of the model to free memory
  dispose(): void {
    if (this.model && this.model.dispose) {
      this.model.dispose();
      this.model = null;
    }
  }
}

// Factory function to create and initialize the classifier
export async function createTeachableMachineClassifier(modelUrl: string): Promise<TeachableMachineClassifier> {
  const classifier = new TeachableMachineClassifier(modelUrl);
  await classifier.loadModel();
  return classifier;
}

// Example usage:
/*
// 1. First, export your Teachable Machine model and host it
// 2. Replace 'YOUR_MODEL_URL' with the actual URL to your model
const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/';

// 3. Initialize the classifier
const classifier = await createTeachableMachineClassifier(MODEL_URL);

// 4. Classify an image
const result = await classifier.classifyFromBase64(base64ImageData);
console.log(`Classified as: ${result.className} with ${(result.probability * 100).toFixed(1)}% confidence`);
*/
