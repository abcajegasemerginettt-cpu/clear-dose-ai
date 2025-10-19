import { Smartphone, Scan, ArrowRight } from "lucide-react";
import { CameraScanner } from "@/components/CameraScanner";
import { MedicineInfo } from "@/components/MedicineInfo";
import { ScanHistory } from "@/components/ScanHistory";
import { ConfidenceDisplay } from "@/components/ConfidenceDisplay";
import { Component as ArtificialHero } from "@/components/ui/artificial-hero";
import Aurora from "@/components/Aurora";
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

  const handleScanReset = () => {
    setScannedMedicine(null);
    setConfidenceData([]);
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
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[300] backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40 text-sm sm:text-base px-8 py-6 h-auto rounded-full group transition-all flex items-center shadow-lg hover:shadow-xl"
          >
            Start Scanning
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ) : (
        /* Scanner Interface */
        <>
          {/* Aurora Background Layer */}
          <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" style={{ height: '100vh', width: '100vw' }}>
            <Aurora
              colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
              blend={0.5}
              amplitude={1.0}
              speed={0.5}
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
                  Instantly identify medicines using advanced AI technology
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
                  // onSuggestionsReady={handleSuggestionsReady}
                />
                
                {/* Confidence Display - Only show when there's scanned medicine */}
                {scannedMedicine && confidenceData.length > 0 && (
                  <ConfidenceDisplay predictions={confidenceData} />
                )}
              </div>
              
              {/* Medicine Info */}
              <div className="space-y-4 sm:space-y-6">
                  <MedicineInfo medicine={scannedMedicine} />
              </div>
            </div>
            
            {/* Scan History */}
            <div className="mt-8 sm:mt-12 max-w-4xl mx-auto">
              <ScanHistory refreshTrigger={scanHistoryRefresh} />
            </div>
          </div>

          {/* Footer */}
          <footer className="relative z-10 backdrop-blur-xl bg-white/5 border-t border-white/10 mt-8 sm:mt-12 md:mt-16">
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
