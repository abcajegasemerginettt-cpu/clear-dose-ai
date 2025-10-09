import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, AlertCircle, Info, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface MedicineInfoProps {
  medicine?: Medicine | null;
  classifiedType?: 'tablet' | 'capsule' | null;
}

export const MedicineInfo = ({ medicine, classifiedType }: MedicineInfoProps) => {
  if (!medicine) {
    return (
      <Card className="glass-card p-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <Pill className="h-12 w-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No Medicine Scanned Yet</h3>
            <p className="text-sm text-muted-foreground">
              Start your camera and scan a tablet or capsule to see its information here
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg medical-gradient p-2">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{medicine.name}</h3>
              <p className="text-sm text-muted-foreground">{medicine.generic_name}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {medicine.medicine_type.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {medicine.category}
                </Badge>
              </div>
            </div>
          </div>
          {medicine.confidence && (
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary border-primary/20"
            >
              {medicine.confidence}% Confidence
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">Description</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {medicine.description}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">Variants</h4>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            {medicine.variants.map((variant, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{variant}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">Storage</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            {medicine.storage}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <h4 className="font-semibold">Side Effects</h4>
          </div>
          <ul className="space-y-2">
            {medicine.side_effects.map((effect, index) => (
              <li 
                key={index}
                className="text-sm text-muted-foreground flex items-start gap-2"
              >
                <span className="text-destructive mt-1">•</span>
                <span>{effect}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};
