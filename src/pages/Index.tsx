import { Camera, Zap, Shield, Smartphone } from "lucide-react";
import { CameraScanner } from "@/components/CameraScanner";
import { MedicineInfo } from "@/components/MedicineInfo";
import { MedicineSuggestions } from "@/components/MedicineSuggestions";
import { ScanHistory } from "@/components/ScanHistory";
import { useState } from "react";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  description: string;
  side_effects: string[];
  manufacturer: string;
  medicine_type: 'tablet' | 'capsule';
  image_url?: string;
  shape?: string;
  color?: string;
  size?: string;
  confidence?: number;
}

const Index = () => {
  const [scannedMedicine, setScannedMedicine] = useState<Medicine | null>(null);
  const [medicineSuggestions, setMedicineSuggestions] = useState<Medicine[]>([]);
  const [classifiedType, setClassifiedType] = useState<'tablet' | 'capsule' | null>(null);

  const handleScanComplete = (medicine: Medicine) => {
    setScannedMedicine(medicine);
    // Clear suggestions when a medicine is directly selected
    setMedicineSuggestions([]);
    setClassifiedType(null);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-medical-accent/5" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 mb-auto">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-medical-red-light to-medical-accent bg-clip-text text-transparent">
              MedLens AI
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Instantly identify medicines using advanced AI technology. 
              Scan tablets and capsules for detailed information and safety guidance.
            </p>
          {/*
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-4 p-6 rounded-2xl glass-card">
                <div className="rounded-full bg-primary/10 p-4">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">AI-Powered Scanning</h3>
                  <p className="text-sm text-muted-foreground">Advanced computer vision for accurate medicine identification</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-4 p-6 rounded-2xl glass-card">
                <div className="rounded-full bg-medical-accent/10 p-4">
                  <Zap className="h-8 w-8" style={{ color: 'hsl(var(--medical-accent))' }} />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Instant Results</h3>
                  <p className="text-sm text-muted-foreground">Get medicine details and safety information in seconds</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-4 p-6 rounded-2xl glass-card">
                <div className="rounded-full bg-destructive/10 p-4">
                  <Shield className="h-8 w-8 text-destructive" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Safety First</h3>
                  <p className="text-sm text-muted-foreground">Complete side effects and dosage information</p>
                </div>
              </div>
            </div>
          */}
          </div>
        </div>
      </div>

      {/* Scanner Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Camera Scanner */}
          <div className="space-y-6">
            <CameraScanner 
              onScanComplete={handleScanComplete}
              onSuggestionsReady={handleSuggestionsReady}
            />
          </div>
          
          {/* Medicine Info */}
          <div className="space-y-6">
            {/* Show suggestions if available, otherwise show selected medicine info */}
            {medicineSuggestions.length > 0 && classifiedType ? (
              <MedicineSuggestions 
                suggestions={medicineSuggestions}
                classifiedType={classifiedType}
                onSelectMedicine={handleMedicineSelection}
              />
            ) : (
              <MedicineInfo medicine={scannedMedicine} />
            )}
          </div>
        </div>
        
        {/* Scan History */}
        <div className="mt-12 max-w-4xl mx-auto">
          <ScanHistory />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card/50 backdrop-blur-sm border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <span className="font-semibold">MedLens AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 MedLens AI. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              <strong>Disclaimer:</strong> This app is for informational purposes only. 
              Always consult healthcare professionals for medical advice. Do not rely solely on 
              AI identification for medication decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
