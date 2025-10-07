import { CameraScanner } from "@/components/CameraScanner";
import { MedicineInfo } from "@/components/MedicineInfo";
import { ScanHistory } from "@/components/ScanHistory";
import { Brain, ShieldCheck, Zap } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";

const Index = () => {
  // Mock medicine data - will be replaced with real AI predictions
  const mockMedicine = {
    name: "Aspirin",
    dosage: "500mg",
    description: "Aspirin is a common pain reliever and anti-inflammatory medication. It works by blocking certain natural substances in your body to reduce pain and swelling.",
    sideEffects: [
      "Upset stomach or heartburn",
      "Drowsiness or dizziness",
      "Mild headache",
      "Nausea or vomiting"
    ],
    confidence: 95
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-3xl" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium mb-4">
              <Brain className="h-4 w-4 text-primary" />
              AI-Powered Medicine Recognition
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MedLens AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Instantly identify tablets and capsules using advanced AI technology. 
              Get comprehensive medicine information in seconds.
            </p>
            
            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-12">
              {[
                {
                  icon: Brain,
                  title: "AI Recognition",
                  description: "TensorFlow-powered identification"
                },
                {
                  icon: Zap,
                  title: "Instant Results",
                  description: "Real-time scanning & analysis"
                },
                {
                  icon: ShieldCheck,
                  title: "Verified Data",
                  description: "Accurate medicine information"
                }
              ].map((feature, index) => (
                <div key={index} className="glass-card p-6 text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-lg medical-gradient flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Scanner Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <CameraScanner />
          
          <div className="grid md:grid-cols-2 gap-8">
            <MedicineInfo medicine={mockMedicine} />
            <ScanHistory />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <div className="text-center text-sm text-muted-foreground">
          <p>MedLens AI - Powered by TensorFlow & Lovable Cloud</p>
          <p className="mt-2">⚕️ Always consult healthcare professionals for medical advice</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
