import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

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
}

interface MedicineSuggestionsProps {
  suggestions: Medicine[];
  classifiedType: 'tablet' | 'capsule';
  onSelectMedicine: (medicine: Medicine) => void;
}

export const MedicineSuggestions = ({ 
  suggestions, 
  classifiedType, 
  onSelectMedicine 
}: MedicineSuggestionsProps) => {
  if (suggestions.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No medicine suggestions available.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 medical-gradient rounded-full"></div>
          <Badge className="medical-gradient text-white text-lg px-3 py-1 font-bold uppercase tracking-wide">
            {classifiedType}
          </Badge>
          <div className="w-2 h-2 medical-gradient rounded-full"></div>
        </div>
        <h3 className="text-lg font-semibold">Select Your Medicine</h3>
        <p className="text-sm text-muted-foreground">
          Choose the medicine that matches your scan
        </p>
      </div>

      {/* Medicine Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {suggestions.map((medicine, index) => (
          <Card 
            key={medicine.id} 
            className="glass-card group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-primary/30"
            onClick={() => onSelectMedicine(medicine)}
            style={{ 
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            <div className="p-3 text-center space-y-2">
              {/* Medicine Image Container */}
              <div className="relative">
                <div className="w-full h-20 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg flex items-center justify-center group-hover:shadow-md transition-shadow">
                  {medicine.image_url ? (
                    <img 
                      src={medicine.image_url} 
                      alt={medicine.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-10 h-10 medical-gradient rounded-full flex items-center justify-center mb-1 mx-auto">
                        <span className="text-sm font-bold text-white">
                          {medicine.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground uppercase font-medium">
                        {medicine.medicine_type}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Selection indicator */}
                <div className="absolute -top-1 -right-1 w-5 h-5 medical-gradient rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center shadow-lg">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              
              {/* Medicine Info */}
              <div className="space-y-1">
                <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                  {medicine.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {medicine.dosage}
                </p>
              </div>
            </div>
            
            {/* Hover effect border */}
            <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/20 transition-colors duration-300 pointer-events-none"></div>
          </Card>
        ))}
      </div>
    </div>
  );
};
