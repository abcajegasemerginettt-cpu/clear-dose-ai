import { Camera, Zap, Shield, Smartphone, Scan, Database, Activity } from "lucide-react";
import { CameraScanner } from "@/components/CameraScanner";
import { MedicineInfo } from "@/components/MedicineInfo";
// import { MedicineSuggestions } from "@/components/MedicineSuggestions";
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Laser Flow Background */}
      <div className="fixed inset-0 z-0">
        <LaserFlow 
          color="#A50000"
          horizontalBeamOffset={0.1}
          verticalBeamOffset={0.0}
          wispDensity={1.2}
          fogIntensity={0.6}
        />
      </div>

      {!showScanner ? (
        /* Landing Page */
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-bold text-white drop-shadow-2xl">
                MedLens AI
              </h1>
              <p className="text-xl md:text-3xl text-white/90 max-w-3xl mx-auto drop-shadow-lg">
                AI-Powered Medicine Identification
              </p>
              <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
                Instantly identify tablets and capsules with advanced computer vision technology
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <Button 
                onClick={() => setShowScanner(true)}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-12 py-6 h-auto rounded-full shadow-2xl hover:scale-105 transition-transform"
              >
                <Scan className="mr-2 h-6 w-6" />
                Start Scanning
              </Button>
            </div>

            {/*
            // Feature Grid
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-4xl mx-auto">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
                <div className="rounded-full bg-white/20 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl text-white mb-2">AI-Powered Scanning</h3>
                <p className="text-sm text-white/70">Advanced computer vision for accurate medicine identification</p>
              </div>
              
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
                <div className="rounded-full bg-white/20 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Database className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl text-white mb-2">Comprehensive Database</h3>
                <p className="text-sm text-white/70">Access detailed medicine information and safety data</p>
              </div>
              
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
                <div className="rounded-full bg-white/20 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl text-white mb-2">Instant Results</h3>
                <p className="text-sm text-white/70">Get medicine details and safety information in seconds</p>
              </div>
            </div>
            */}

            {/* Disclaimer */}
            <div className="pt-8 max-w-2xl mx-auto">
              <p className="text-xs text-white/50">
                <strong>Medical Disclaimer:</strong> This tool is for informational purposes only. 
                Always consult healthcare professionals for medical advice.
              </p>
            </div>
          </div>
        </div>
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
