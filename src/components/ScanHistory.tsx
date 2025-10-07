import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ScanRecord {
  id: string;
  medicineName: string;
  timestamp: string;
  confidence: number;
}

export const ScanHistory = () => {
  // Mock data - will be replaced with real data from Supabase
  const mockScans: ScanRecord[] = [
    {
      id: "1",
      medicineName: "Aspirin 500mg",
      timestamp: "2024-01-15 10:30 AM",
      confidence: 95
    },
    {
      id: "2",
      medicineName: "Paracetamol 650mg",
      timestamp: "2024-01-14 03:15 PM",
      confidence: 92
    },
    {
      id: "3",
      medicineName: "Ibuprofen 400mg",
      timestamp: "2024-01-13 09:45 AM",
      confidence: 88
    }
  ];

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Scan History</h3>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export All
        </Button>
      </div>

      <div className="space-y-3">
        {mockScans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No scans yet</p>
          </div>
        ) : (
          mockScans.map((scan) => (
            <div
              key={scan.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-medium">{scan.medicineName}</h4>
                <p className="text-xs text-muted-foreground">{scan.timestamp}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  {scan.confidence}%
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
