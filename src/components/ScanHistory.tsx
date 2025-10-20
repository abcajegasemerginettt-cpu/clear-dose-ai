import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Download, Trash2, FileText, FileSpreadsheet, CheckSquare, Square, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const fetchScanHistory = async (page: number = currentPage) => {
    try {
      setLoading(true);
      
      // First get the total count
      const { count } = await (supabase as any)
        .from('scan_history')
        .select('*', { count: 'exact', head: true });
      
      setTotalCount(count || 0);
      
      // Then get the paginated data
      const offset = (page - 1) * itemsPerPage;
      const { data, error } = await (supabase as any)
        .from('scan_history')
        .select('*')
        .order('scanned_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

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
      fetchScanHistory(1); // Reset to first page when new scan is added
      setCurrentPage(1);
    }
  }, [refreshTrigger]);

  // Fetch data when page changes
  useEffect(() => {
    fetchScanHistory(currentPage);
  }, [currentPage]);

  const deleteScan = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('scan_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Check if this was the last item on the current page
      const newScans = scans.filter(scan => scan.id !== id);
      if (newScans.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        setScans(newScans);
        setTotalCount(totalCount - 1);
      }
      
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
      
      // Check if this will leave the current page empty
      const newScans = scans.filter(scan => !selectedScans.has(scan.id));
      if (newScans.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        setScans(newScans);
        setTotalCount(totalCount - selectedScans.size);
      }
      
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

  // Pagination helper functions
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
          <div className="text-center py-8 text-muted-foreground">
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
                  <p className="text-xs text-muted-foreground">
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
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalCount > itemsPerPage && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} scans
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={!hasPrevPage}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNumber)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={!hasNextPage}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
