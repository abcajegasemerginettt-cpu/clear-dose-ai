import { Camera, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";

export const CameraScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup: stop camera when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setIsScanning(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsScanning(false);
    }
  };

  return (
    <Card className="glass-card overflow-hidden border-2">
      <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30">
        {!isScanning ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
            <div className="rounded-full bg-primary/10 p-6 backdrop-blur-sm">
              <Camera className="h-16 w-16 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Ready to Scan</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Position a tablet or capsule in front of your camera for instant identification
              </p>
            </div>
            <Button 
              onClick={startCamera}
              size="lg"
              className="medical-gradient text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Camera className="mr-2 h-5 w-5" />
              Start Camera
            </Button>
            {hasPermission === false && (
              <p className="text-sm text-destructive">
                Camera access denied. Please enable camera permissions.
              </p>
            )}
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-4 border-2 border-primary/50 rounded-lg scan-pulse" />
              <Scan className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 text-primary/30 scan-pulse" />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <Button
                onClick={stopCamera}
                variant="secondary"
                className="glass-button"
              >
                Stop Camera
              </Button>
              <Button
                className="medical-gradient text-white"
              >
                <Scan className="mr-2 h-4 w-4" />
                Capture & Identify
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
