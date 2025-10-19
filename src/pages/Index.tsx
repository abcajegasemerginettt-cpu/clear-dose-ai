import { Smartphone, Scan, ArrowRight } from "lucide-react";
import { CameraScanner } from "@/components/CameraScanner";
import { MedicineInfo } from "@/components/MedicineInfo";
import { ScanHistory } from "@/components/ScanHistory";
import { ConfidenceDisplay } from "@/components/ConfidenceDisplay";
import { UnknownMedicineCard } from "@/components/UnknownMedicineCard";
import { Component as ArtificialHero } from "@/components/ui/artificial-hero";
import LaserFlow from "@/components/LaserFlow";
import PixelBlast from "@/components/PixelBlast";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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

interface PredictionResult {
  name: string;
  confidence: number;
}

const Index = () => {
  const [scannedMedicine, setScannedMedicine] = useState<Medicine | null>(null);
  const [scanHistoryRefresh, setScanHistoryRefresh] = useState(0);
  const [confidenceData, setConfidenceData] = useState<PredictionResult[]>([]);
  const [scanError, setScanError] = useState<{
    type: 'low_confidence' | 'not_found' | 'general';
    message: string;
    suggestion?: string;
    confidence?: number;
    medicineName?: string;
  } | null>(null);
  // const [medicineSuggestions, setMedicineSuggestions] = useState<Medicine[]>([]);
  // const [classifiedType, setClassifiedType] = useState<'tablet' | 'capsule' | null>(null);

  const handleScanComplete = (medicine: Medicine) => {
    setScannedMedicine(medicine);
    // Clear suggestions when a medicine is directly selected
    // setMedicineSuggestions([]);
    // setClassifiedType(null);
  };

  const handleScanSaved = () => {
    // Trigger scan history refresh after scan is saved to database
    setScanHistoryRefresh(prev => prev + 1);
  };

  const handleConfidenceData = (predictions: PredictionResult[]) => {
    setConfidenceData(predictions);
  };

  const handleScanError = (error: {
    type: 'low_confidence' | 'not_found' | 'general';
    message: string;
    suggestion?: string;
    confidence?: number;
    medicineName?: string;
  }) => {
    setScanError(error);
    setScannedMedicine(null);
    setConfidenceData([]);
  };

  const handleScanReset = () => {
    setScannedMedicine(null);
    setConfidenceData([]);
    setScanError(null);
  };

  /*
  const handleSuggestionsReady = (suggestions: Medicine[], type: 'tablet' | 'capsule') => {
    setMedicineSuggestions(suggestions);
    setClassifiedType(type);
    // Clear any previously selected medicine
    setScannedMedicine(null);
  };

  const handleMedicineSelection = (medicine: Medicine) => {
    setScannedMedicine(medicine);
    // Clear suggestions after selection
    setMedicineSuggestions([]);
    setClassifiedType(null);
  };
  */

  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {!showScanner ? (
        /* Landing Page with Artificial Hero */
        <div className="fixed inset-0" style={{ height: '100vh', width: '100vw' }}>
          <ArtificialHero />
          {/* Overlay button to enter scanner */}
          <button 
            onClick={() => setShowScanner(true)}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[300] bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/40 text-sm sm:text-base px-8 py-6 h-auto rounded-full group transition-all flex items-center shadow-lg hover:shadow-xl"
          >
            Start Scanning
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ) : (
        /* Scanner Interface */
        <>
          {/* PixelBlast Background Layer */}
          <div className="fixed inset-0 z-0 bg-black" style={{ height: '100vh', width: '100vw' }}>
            <PixelBlast
              variant="circle"
              pixelSize={6}
              color="#FFFFFF"
              patternScale={3}
              patternDensity={1.2}
              pixelSizeJitter={0.5}
              enableRipples
              rippleSpeed={0.4}
              rippleThickness={0.12}
              rippleIntensityScale={1.5}
              liquid
              liquidStrength={0.12}
              liquidRadius={1.2}
              liquidWobbleSpeed={5}
              speed={0.6}
              edgeFade={0.25}
              transparent
            />
          </div>

          {/* Laser Flow Overlay */}
          <div className="fixed inset-0 z-0 bg-transparent pointer-events-none" style={{ height: '100vh', width: '100vw' }}>
            <LaserFlow 
              color="#A50000"
              horizontalBeamOffset={0.25}
              verticalBeamOffset={0.0}
              wispDensity={1.6}
              wispIntensity={8.0}
              wispSpeed={14.0}
              flowStrength={0.5}
              verticalSizing={3.2}
              horizontalSizing={0.4}
              fogIntensity={0.8}
              fogScale={0.28}
              fogFallSpeed={1.0}
              decay={0.9}
              falloffStart={2.2}
            />
          </div>

          {/* Hero Section */}
          <div className="relative overflow-hidden z-10">
            <div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
              <div className="text-center space-y-4 sm:space-y-6 mb-auto">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white drop-shadow-2xl">
                  MedLens AI
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-3xl mx-auto drop-shadow-lg px-4">
                  Identify tablets and capsules using AI technology
                </p>
                <p className="text-xs sm:text-sm text-white/60 max-w-2xl mx-auto px-4">
                  Currently supports 25+ common medicines • Beta version
                </p>
              </div>
            </div>
          </div>

          {/* Scanner Section */}
          <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {/* Camera Scanner */}
              <div className="space-y-4 sm:space-y-6">
                <CameraScanner 
                  onScanComplete={handleScanComplete}
                  onScanSaved={handleScanSaved}
                  onScanReset={handleScanReset}
                  onConfidenceData={handleConfidenceData}
                  onError={handleScanError}
                  // onSuggestionsReady={handleSuggestionsReady}
                />
                
                {/* Confidence Display - Only show when there's scanned medicine */}
                {scannedMedicine && confidenceData.length > 0 && (
                  <ConfidenceDisplay predictions={confidenceData} />
                )}
              </div>
              
              {/* Medicine Info or Error Display */}
              <div className="space-y-4 sm:space-y-6">
                {scanError ? (
                  <UnknownMedicineCard 
                    error={scanError} 
                    onRetry={handleScanReset}
                  />
                ) : (
                  <MedicineInfo medicine={scannedMedicine} />
                )}
              </div>
            </div>
            
            {/* Scan History */}
            <div className="mt-8 sm:mt-12 max-w-4xl mx-auto">
              <ScanHistory refreshTrigger={scanHistoryRefresh} />
            </div>
          </div>

          {/* Footer */}
          <footer className="relative z-10 backdrop-blur-md bg-black/30 border-t border-white/10 mt-8 sm:mt-12 md:mt-16">
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Smartphone className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                  <span className="font-semibold text-white text-sm sm:text-base">MedLens AI</span>
                </div>
                <p className="text-xs sm:text-sm text-white/70">
                  © 2025 MedLens AI. All rights reserved.
                </p>
                <p className="text-xs text-white/50 max-w-2xl mx-auto px-4">
                  <strong>Disclaimer:</strong> This app is for informational purposes only. 
                  Always consult healthcare professionals for medical advice.
                </p>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default Index;
