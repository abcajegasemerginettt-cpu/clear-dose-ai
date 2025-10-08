import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Download, Trash2, FileText, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { exportToCSV, exportToJSON, exportToExcel } from "@/utils/exportUtils";

interface ScanRecord {
  id: string;
  medicine_name: string;
  scanned_at: string;
  confidence: number;
}

export const ScanHistory = () => {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScanHistory = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('scan_history')
        .select('*')
        .order('scanned_at', { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (error) {
      console.error("Error fetching scan history:", error);
      toast.error("Failed to load scan history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const deleteScan = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('scan_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setScans(scans.filter(scan => scan.id !== id));
      toast.success("Scan deleted successfully");
    } catch (error) {
      console.error("Error deleting scan:", error);
      toast.error("Failed to delete scan");
    }
  };

  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    if (scans.length === 0) {
      toast.error("No data to export");
      return;
    }

    const exportData = scans.map(scan => ({
      'Medicine Name': scan.medicine_name,
      'Confidence': `${scan.confidence}%`,
      'Scanned At': new Date(scan.scanned_at).toLocaleString(),
      'ID': scan.id
    }));

    switch (format) {
      case 'csv':
        exportToCSV(exportData, 'medlens-scan-history.csv');
        break;
      case 'json':
        exportToJSON(exportData, 'medlens-scan-history.json');
        break;
      case 'excel':
        exportToExcel(exportData, 'medlens-scan-history.xlsx');
        break;
    }
    
    toast.success(`Data exported as ${format.toUpperCase()}`);
  };

  if (loading) {
    return (
      <Card className="glass-card p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading scan history...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Scan History</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export All
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

      <div className="space-y-3">
        {scans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No scans yet</p>
            <p className="text-sm">Start scanning medicines to see your history here</p>
          </div>
        ) : (
          scans.map((scan) => (
            <div
              key={scan.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-medium">{scan.medicine_name}</h4>
                <p className="text-xs text-muted-foreground">
                  {new Date(scan.scanned_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  {scan.confidence}%
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteScan(scan.id)}
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
