import { Camera, Scan, Upload, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { loadModel, predict, getTopPrediction } from '@/utils/teachableMachine';
import medicinesData from '@/data/medicines.json';

interface CameraScannerProps {
  onScanComplete?: (result: any) => void;
  onSuggestionsReady?: (suggestions: Medicine[], classifiedType: 'tablet' | 'capsule') => void;
  onError?: (error: {
    type: 'low_confidence' | 'not_found' | 'general';
    message: string;
    suggestion?: string;
    confidence?: number;
    medicineName?: string;
  }) => void;
}

type WorkflowStep = 'capture' | 'classify';

interface Medicine {
  id: number;
  name: string;
  generic_name: string;
  description: string;
  medicine_type: 'tablet' | 'capsule';
  variants: string[];
  side_effects: string[];
  storage: string;
  category: string;
  confidence?: number;
}

export const CameraScanner = ({ onScanComplete, onSuggestionsReady, onError }: CameraScannerProps) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('capture');
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [classifiedType, setClassifiedType] = useState<'tablet' | 'capsule' | null>(null);
  const [suggestedMedicines, setSuggestedMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load the Teachable Machine model when the component mounts
    console.log("Loading Teachable Machine model...");
    loadModel()
      .then(() => {
        console.log("Model loaded successfully!");
        // Removed toast notification for cleaner UX
      })
      .catch(err => {
        console.error("Model loading error:", err);
        toast.error("Failed to load the AI model. Please refresh the page.");
      });

    return () => {
      // Cleanup: stop camera when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Step 1: Camera and File Upload Functions
  const startCamera = async () => {
    try {
      setError(null);
      console.log("Requesting camera access...");
      
      let constraints: MediaStreamConstraints = { 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (envErr) {
        console.log("Environment camera not available, trying any camera...");
        constraints = { 
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 } 
          } 
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      
      console.log("Camera stream obtained:", stream);
      setHasPermission(true);
      setIsScanning(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = stream;
          video.onloadedmetadata = async () => {
            try {
              await video.play();
              console.log("Video playback started successfully");
            } catch (err) {
              console.error("Error playing video:", err);
              setError("Failed to start video playback. Click to retry.");
            }
          };
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
      setError("Camera access denied. Please enable camera permissions.");
      toast.error("Camera access denied. Please enable camera permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsScanning(false);
      setError(null);
      console.log("Camera stopped and cleaned up");
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    stopCamera();
    
    // Move to classification step
    setCurrentStep('classify');
    classifyImage(imageData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setCapturedImage(imageData);
      setCurrentStep('classify');
      classifyImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  // Step 2: Image Classification (Teachable Machine Integration)
  const saveScanToHistory = async (medicine: Medicine) => {
    try {
      const { error } = await supabase
        .from('scan_history')
        .insert({
          medicine_name: medicine.name,
          confidence: medicine.confidence,
          scanned_image_url: capturedImage
        });

      if (error) {
        console.error("Error saving to scan history:", error);
        toast.error("Failed to save scan to history");
      } else {
        console.log("Scan saved to history successfully");
      }
    } catch (error) {
      console.error("Error in saveScanToHistory:", error);
      toast.error("An unexpected error occurred while saving the scan");
    }
  };

  const classifyImage = async (imageData: string) => {
    setIsProcessing(true);
    try {
      const imageElement = new Image();
      imageElement.crossOrigin = "anonymous";
      imageElement.src = imageData;
      await new Promise((resolve, reject) => { 
        imageElement.onload = resolve;
        imageElement.onerror = reject;
      });

      const predictions = await predict(imageElement);
      const topPrediction = getTopPrediction(predictions);
      const confidence = Math.round(topPrediction.probability * 100);
      const medicineName = topPrediction.className;

      const foundMedicine = medicinesData.find(
        med => med.name.toLowerCase() === medicineName.toLowerCase()
      );

      if (!foundMedicine) {
        if (onError) {
          onError({
            type: 'not_found',
            message: `The item classified as "${medicineName}" is not a recognized medicine.`,
            suggestion: "Please try a different item.",
            confidence: confidence,
            medicineName: medicineName
          });
        }
        setCurrentStep('capture');
        return;
      }

      const result: Medicine = {
        ...foundMedicine,
        id: foundMedicine.id || 0,
        name: foundMedicine.name || '',
        generic_name: foundMedicine.generic_name || '',
        description: foundMedicine.description || '',
        medicine_type: foundMedicine.medicine_type as 'tablet' | 'capsule',
        variants: foundMedicine.variants || [],
        side_effects: foundMedicine.side_effects || [],
        storage: foundMedicine.storage || '',
        category: foundMedicine.category || '',
        confidence: confidence
      };

      if (onScanComplete) {
        onScanComplete(result);
      }

      saveScanToHistory(result);

      setTimeout(() => {
        resetWorkflow();
      }, 1500);

    } catch (error) {
      console.error("Classification error:", error);
      if (onError) {
        onError({
          type: 'general',
          message: "An unexpected error occurred during classification.",
          suggestion: "Please try again."
        });
      }
      setCurrentStep('capture');
    } finally {
      setIsProcessing(false);
    }
  };

  /*
  // Load Medicine Suggestions - Commented out since we're using direct detection now
  const loadMedicineSuggestions = async (type: 'tablet' | 'capsule'): Promise<Medicine[] | null> => {
    try {
      const { data: medicines, error } = await supabase
        .from('medicines')
        .select('*');

      if (error) throw error;

      // For now, return all medicines since medicine_type column doesn't exist yet
      // TODO: Filter by type once migration is applied
      const typedMedicines: Medicine[] = (medicines || []).map(med => ({
        id: med.id,
        name: med.name,
        dosage: med.dosage || '',
        description: med.description || '',
        side_effects: Array.isArray(med.side_effects) 
          ? med.side_effects.map(effect => String(effect))
          : [],
        manufacturer: med.manufacturer || '',
        medicine_type: type, // Use the classified type
        image_url: undefined, // Will be added after migration
        shape: undefined,     // Will be added after migration
        color: undefined,     // Will be added after migration
        size: undefined       // Will be added after migration
      }));

      setSuggestedMedicines(typedMedicines);
      return typedMedicines;
    } catch (error) {
      console.error("Error loading medicine suggestions:", error);
      toast.error("Failed to load medicine suggestions.");
      return null;
    }
  };

  // Handle Medicine Selection - Commented out since we're using direct detection now
  const selectMedicine = async (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    
    // Save to scan history
    try {
      const { error } = await supabase
        .from('scan_history')
        .insert({
          medicine_id: medicine.id.toString(),
          medicine_name: medicine.name,
          confidence: 95, // High confidence for manual selection
          scanned_image_url: capturedImage
        });

      if (error) throw error;
      
      toast.success(`Medicine selected: ${medicine.name}`);
      
      if (onScanComplete) {
        onScanComplete(medicine);
      }
      
      // Reset workflow for next scan
      setTimeout(() => {
        resetWorkflow();
      }, 1500);
    } catch (error) {
      console.error("Error saving scan history:", error);
      toast.error("Failed to save scan history.");
    }
  };
  */

  const resetWorkflow = () => {
    setCurrentStep('capture');
    setCapturedImage(null);
    setClassifiedType(null);
    setSuggestedMedicines([]);
    setSelectedMedicine(null);
    setError(null);
    setIsProcessing(false);
  };

  // Step 1: Capture UI
  const renderCaptureStep = () => {
    if (isScanning) {
      return (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            controls={false}
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-4 border-2 border-primary/50 rounded-lg scan-pulse" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Scan className="h-24 w-24 text-primary/30 scan-pulse" />
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <Button onClick={stopCamera} variant="secondary" className="glass-button">
              Stop Camera
            </Button>
            <Button onClick={captureImage} className="medical-gradient text-white">
              <Scan className="mr-2 h-4 w-4" />
              Capture Image
            </Button>
          </div>
        </>
      );
    }

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
        <div className="rounded-full bg-primary/10 p-6 backdrop-blur-sm">
          <Camera className="h-16 w-16 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">Ready to Scan</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Take a photo or upload an image of your medicine for identification
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={startCamera}
            size="lg"
            className="medical-gradient text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Camera className="mr-2 h-5 w-5" />
            Start Camera
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            size="lg"
            variant="outline"
            className="shadow-lg hover:shadow-xl transition-all"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload Photo
          </Button>
        </div>
        {hasPermission === false && (
          <p className="text-sm text-destructive">
            Camera access denied. Please enable camera permissions.
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive max-w-md text-center">
            {error}
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    );
  };

  // Step 2: Classification UI
  const renderClassifyStep = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Button 
          onClick={resetWorkflow} 
          variant="secondary"
          size="sm"
          className="glass-button"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      {/* Centered Classification Content */}
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
        {capturedImage && (
          <div className="glass-card p-3 rounded-xl">
            <img 
              src={capturedImage} 
              alt="Captured medicine" 
              className="w-32 h-32 object-cover rounded-lg shadow-lg" 
            />
          </div>
        )}
        
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Analyzing Image...</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Our AI is classifying your medicine as tablet or capsule
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render different UI based on current workflow step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'capture':
        return renderCaptureStep();
      case 'classify':
        return renderClassifyStep();
      default:
        return renderCaptureStep();
    }
  };

  return (
    <Card className="glass-card overflow-hidden border-2">
      <div className="relative aspect-video w-full bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30">
        {renderStepContent()}
      </div>
      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
};
