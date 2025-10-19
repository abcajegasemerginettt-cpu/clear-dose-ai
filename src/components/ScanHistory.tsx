import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Download, Trash2, FileText, FileSpreadsheet, CheckSquare, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
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

interface ScanHistoryProps {
  refreshTrigger?: number;
}

export const ScanHistory = ({ refreshTrigger }: ScanHistoryProps) => {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScans, setSelectedScans] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

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

  // Refresh when refreshTrigger changes (new scan completed)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchScanHistory();
    }
  }, [refreshTrigger]);

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

  const bulkDeleteScans = async () => {
    if (selectedScans.size === 0) {
      toast.error("No scans selected");
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('scan_history')
        .delete()
        .in('id', Array.from(selectedScans));

      if (error) throw error;
      
      setScans(scans.filter(scan => !selectedScans.has(scan.id)));
      setSelectedScans(new Set());
      setIsSelectMode(false);
      toast.success(`${selectedScans.size} scan(s) deleted successfully`);
    } catch (error) {
      console.error("Error deleting scans:", error);
      toast.error("Failed to delete selected scans");
    }
  };

  const toggleScanSelection = (scanId: string) => {
    const newSelected = new Set(selectedScans);
    if (newSelected.has(scanId)) {
      newSelected.delete(scanId);
    } else {
      newSelected.add(scanId);
    }
    setSelectedScans(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedScans.size === scans.length) {
      setSelectedScans(new Set());
    } else {
      setSelectedScans(new Set(scans.map(scan => scan.id)));
    }
  };

  const cancelSelectMode = () => {
    setIsSelectMode(false);
    setSelectedScans(new Set());
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
          <p className="text-white">Loading scan history...</p>
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
          {selectedScans.size > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedScans.size} selected
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isSelectMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                className="gap-2"
              >
                {selectedScans.size === scans.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {selectedScans.size === scans.length ? 'Deselect All' : 'Select All'}
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={bulkDeleteScans}
                disabled={selectedScans.size === 0}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedScans.size})
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelSelectMode}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              {scans.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSelectMode(true)}
                  className="gap-2"
                >
                  <CheckSquare className="h-4 w-4" />
                  Select
                </Button>
              )}
              
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
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {scans.length === 0 ? (
          <div className="text-center py-8 text-white">
            <p>No scans yet</p>
            <p className="text-sm">Start scanning medicines to see your history here</p>
          </div>
        ) : (
          scans.map((scan) => (
            <div
              key={scan.id}
              className={`flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors ${
                selectedScans.has(scan.id) ? 'bg-accent/30 border-primary/50' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                {isSelectMode && (
                  <Checkbox
                    checked={selectedScans.has(scan.id)}
                    onCheckedChange={() => toggleScanSelection(scan.id)}
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{scan.medicine_name}</h4>
                  <p className="text-xs text-white">
                    {new Date(scan.scanned_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  {scan.confidence}%
                </Badge>
                {!isSelectMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteScan(scan.id)}
                    className="h-8 w-8 text-white hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
