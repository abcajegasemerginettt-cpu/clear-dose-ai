import { Smartphone, Scan, ArrowRight } from "lucide-react";
import { CameraScanner } from "@/components/CameraScanner";
import { MedicineInfo } from "@/components/MedicineInfo";
import { ScanHistory } from "@/components/ScanHistory";
import LaserFlow from "@/components/LaserFlow";
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

const Index = () => {
  const [scannedMedicine, setScannedMedicine] = useState<Medicine | null>(null);
  // const [medicineSuggestions, setMedicineSuggestions] = useState<Medicine[]>([]);
  // const [classifiedType, setClassifiedType] = useState<'tablet' | 'capsule' | null>(null);

  const handleScanComplete = (medicine: Medicine) => {
    setScannedMedicine(medicine);
    // Clear suggestions when a medicine is directly selected
    // setMedicineSuggestions([]);
    // setClassifiedType(null);
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
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Laser Flow Background */}
      <div className="fixed inset-0 z-0 bg-black">
        <LaserFlow 
          color="#A50000"
          horizontalBeamOffset={0.5}
          verticalBeamOffset={0.3}
          wispDensity={0.8}
          fogIntensity={0.8}
          verticalSizing={3.0}
          horizontalSizing={0.3}
        />
      </div>

      {!showScanner ? (
        /* Landing Page */
        <>
          {/* Navigation Bar */}
          <nav className="relative z-10 border-b border-white/10 backdrop-blur-sm bg-black/20">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scan className="h-6 w-6 text-white" />
                  <span className="text-xl font-bold text-white">MedLens AI</span>
                </div>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/10"
                    onClick={() => setShowScanner(true)}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="relative z-10 min-h-[calc(100vh-73px)] flex items-center px-6">
            <div className="container mx-auto">
              <div className="max-w-2xl">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
                  AI-Powered Medicine Scanner
                </h1>
                <p className="text-xl md:text-2xl text-white/70 mb-8 leading-relaxed">
                  Instantly identify tablets and capsules with advanced computer vision technology. Get detailed information in seconds.
                </p>
                <Button 
                  onClick={() => setShowScanner(true)}
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 text-base px-8 py-6 h-auto rounded-full group transition-all"
                >
                  Start Scanning
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-xs text-white/40 mt-6">
                  <strong>Medical Disclaimer:</strong> This tool is for informational purposes only. 
                  Always consult healthcare professionals for medical advice.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Scanner Interface */
        <>
          {/* Hero Section */}
          <div className="relative overflow-hidden z-10">
            <div className="relative container mx-auto px-4 py-16">
              <div className="text-center space-y-6 mb-auto">
                <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl">
                  MedLens AI
                </h1>
                <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto drop-shadow-lg">
                  Instantly identify medicines using advanced AI technology
                </p>
              </div>
            </div>
          </div>

          {/* Scanner Section */}
          <div className="relative z-10 container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Camera Scanner */}
              <div className="space-y-6">
                <CameraScanner 
                  onScanComplete={handleScanComplete}
                  // onSuggestionsReady={handleSuggestionsReady}
                />
              </div>
              
              {/* Medicine Info */}
              <div className="space-y-6">
                  <MedicineInfo medicine={scannedMedicine} />
              </div>
            </div>
            
            {/* Scan History */}
            <div className="mt-12 max-w-4xl mx-auto">
              <ScanHistory />
            </div>
          </div>

          {/* Footer */}
          <footer className="relative z-10 backdrop-blur-md bg-black/30 border-t border-white/10 mt-16">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Smartphone className="h-5 w-5 text-white" />
                  <span className="font-semibold text-white">MedLens AI</span>
                </div>
                <p className="text-sm text-white/70">
                  © 2025 MedLens AI. All rights reserved.
                </p>
                <p className="text-xs text-white/50 max-w-2xl mx-auto">
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
