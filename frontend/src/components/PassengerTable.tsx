import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StatusBadge } from "@/components/StatusBadge";
import { apiService } from "@/services/api";
import type { PassengerData } from "@/types";

interface PassengerTableProps {
  passengers: PassengerData[];
  onPassengerUpdate: (updatedPassenger: PassengerData) => void;
  loading?: boolean;
}

export function PassengerTable({ passengers, onPassengerUpdate, loading }: PassengerTableProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, 'download' | 'parse' | null>>({});

  const handleDownload = async (passengerId: string) => {
    setLoadingStates(prev => ({ ...prev, [passengerId]: 'download' }));
    
    try {
      const response = await apiService.downloadInvoice(passengerId);
      if (response.success && response.data) {
        onPassengerUpdate(response.data);
      } else {
        console.error('Download failed:', response.error);
      }
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [passengerId]: null }));
    }
  };

  const handleParse = async (passengerId: string) => {
    setLoadingStates(prev => ({ ...prev, [passengerId]: 'parse' }));
    
    try {
      const response = await apiService.parseInvoice(passengerId);
      if (response.success && response.data) {
        onPassengerUpdate(response.data);
      } else {
        console.error('Parse failed:', response.error);
      }
    } catch (error) {
      console.error('Parse error:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [passengerId]: null }));
    }
  };

  const handleOpenPdf = (pdfPath: string) => {
    // Extract just the filename from the full backend path
    const filename = pdfPath.split('/').pop() || pdfPath.split('\\').pop();
    const pdfUrl = `http://localhost:3001/uploads/${filename}`;
    console.log('Opening PDF:', pdfUrl); // Debug log
    window.open(pdfUrl, '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-2">Loading passengers...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passenger Records</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket Number</TableHead>
              <TableHead>Passenger Name</TableHead>
              <TableHead>Download Status</TableHead>
              <TableHead>Parse Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passengers.map((passenger) => (
              <TableRow key={passenger.id}>
                <TableCell className="font-mono">{passenger.ticketNumber}</TableCell>
                <TableCell>{`${passenger.firstName} ${passenger.lastName}`}</TableCell>
                <TableCell>
                  <StatusBadge status={passenger.downloadStatus} />
                  {passenger.errorMessage && passenger.downloadStatus === 'error' && (
                    <div className="text-xs text-red-600 mt-1" title={passenger.errorMessage}>
                      {passenger.errorMessage.substring(0, 50)}...
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={passenger.parseStatus} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(passenger.id)}
                      disabled={loadingStates[passenger.id] === 'download'}
                    >
                      {loadingStates[passenger.id] === 'download' ? (
                        <LoadingSpinner size="sm" className="mr-1" />
                      ) : null}
                      Download Invoice
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleParse(passenger.id)}
                      disabled={
                        passenger.downloadStatus !== 'success' ||
                        loadingStates[passenger.id] === 'parse'
                      }
                    >
                      {loadingStates[passenger.id] === 'parse' ? (
                        <LoadingSpinner size="sm" className="mr-1" />
                      ) : null}
                      Parse Invoice
                    </Button>

                    {passenger.pdfPath && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenPdf(passenger.pdfPath!)}
                      >
                        Open PDF
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
