import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, AlertCircle, Info, Download, FileText, FileSpreadsheet } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportToCSV, exportToJSON, exportToExcel } from "@/utils/exportUtils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChatBot } from "@/components/ChatBot";

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
  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    if (!medicine || medicine.name === 'Not a medicine') {
      toast.error("No valid medicine data to export");
      return;
    }

    const exportData = [{
      'Name': medicine.name,
      'Generic Name': medicine.generic_name,
      'Description': medicine.description,
      'Type': medicine.medicine_type,
      'Category': medicine.category,
      'Confidence': `${medicine.confidence}%`,
      'Variants': medicine.variants.join(', '),
      'Side Effects': medicine.side_effects.join(', '),
      'Storage': medicine.storage
    }];

    switch (format) {
      case 'csv':
        exportToCSV(exportData, `${medicine.name}-details.csv`);
        break;
      case 'json':
        exportToJSON(exportData, `${medicine.name}-details.json`);
        break;
      case 'excel':
        exportToExcel(exportData, `${medicine.name}-details.xlsx`);
        break;
    }
    
    toast.success(`Data for ${medicine.name} exported as ${format.toUpperCase()}`);
  };
  if (!medicine) {
    return (
      <Card className="glass-card p-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <Pill className="h-12 w-12 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No Medicine Scanned Yet</h3>
            <p className="text-sm text-white">
              Start your camera and scan a tablet or capsule to see its information here
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="space-y-2 w-full">
          <div className="flex items-start gap-3">
            <div className="rounded-lg p-2 medical-gradient">
              <Pill className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl sm:text-2xl font-bold break-words">{medicine.name}</h3>
              <p className="text-xs sm:text-sm text-white break-words">{medicine.generic_name}</p>
              {medicine.name !== 'Not a medicine' && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {medicine.medicine_type.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {medicine.category}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          {medicine.confidence && (
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary border-primary/20 text-xs"
            >
              {medicine.confidence}% Confidence
            </Badge>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto flex-shrink-0" disabled={!medicine || medicine.name === 'Not a medicine'}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <FileText className="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('json')}>
              <FileText className="h-4 w-4 mr-2" />
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">Description</h4>
          </div>
          <p className="text-sm text-white leading-relaxed">
            {medicine.description}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">Variants</h4>
          </div>
          <ul className="text-sm text-white space-y-1">
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
          <p className="text-sm text-white">
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
                className="text-sm text-white flex items-start gap-2"
              >
                <span className="text-destructive mt-1">•</span>
                <span>{effect}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* AI Chatbot Section */}
        {medicine.name !== 'Not a medicine' && (
          <div className="pt-4 border-t">
            <ChatBot medicine={medicine} />
          </div>
        )}
      </div>
    </Card>
  );
};
