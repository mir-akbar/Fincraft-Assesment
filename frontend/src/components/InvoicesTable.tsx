import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatCurrency, formatDate } from "@/utils";
import type { PassengerData } from "@/types";

interface InvoicesTableProps {
  passengers: PassengerData[];
  loading?: boolean;
}

export function InvoicesTable({ passengers, loading }: InvoicesTableProps) {
  const [flaggedForReview, setFlaggedForReview] = useState<Set<string>>(new Set());

  // Filter passengers with successfully parsed invoices
  const passengersWithInvoices = passengers.filter(
    (p) => p.parseStatus === 'success' && p.invoiceData
  );

  const handleFlagToggle = (passengerId: string) => {
    setFlaggedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(passengerId)) {
        newSet.delete(passengerId);
      } else {
        newSet.add(passengerId);
      }
      return newSet;
    });
  };

  const handleOpenPdf = (pdfPath?: string) => {
    if (pdfPath) {
      // Extract just the filename from the full backend path
      const filename = pdfPath.split('/').pop() || pdfPath.split('\\').pop();
      const pdfUrl = `http://localhost:3001/uploads/${filename}`;
      console.log('Opening PDF:', pdfUrl); // Debug log
      window.open(pdfUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-2">Loading invoices...</span>
        </CardContent>
      </Card>
    );
  }

  if (passengersWithInvoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Parsed Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No invoices have been parsed yet. Download and parse some invoices to see them here.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parsed Invoices ({passengersWithInvoices.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Airline</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead>Passenger</TableHead>
              <TableHead>Flag for Review</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passengersWithInvoices.map((passenger) => (
              <TableRow key={passenger.id}>
                <TableCell className="font-mono">
                  {passenger.invoiceData?.invoiceNumber}
                </TableCell>
                <TableCell>
                  {passenger.invoiceData?.date ? formatDate(passenger.invoiceData.date) : '-'}
                </TableCell>
                <TableCell>{passenger.invoiceData?.airline}</TableCell>
                <TableCell className="font-semibold">
                  {passenger.invoiceData?.amount ? formatCurrency(passenger.invoiceData.amount) : '-'}
                  {passenger.invoiceData?.amount && passenger.invoiceData.amount > 30000 && (
                    <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                      High Value
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {passenger.invoiceData?.gstin || '-'}
                </TableCell>
                <TableCell>
                  {`${passenger.firstName} ${passenger.lastName}`}
                  <div className="text-xs text-gray-500">{passenger.ticketNumber}</div>
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={flaggedForReview.has(passenger.id)}
                    onCheckedChange={() => handleFlagToggle(passenger.id)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenPdf(passenger.pdfPath)}
                    disabled={!passenger.pdfPath}
                  >
                    📄 Open PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
