import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatCurrency } from "@/utils";
import type { PassengerData } from "@/types";

interface SummaryDashboardProps {
  passengers: PassengerData[];
  loading?: boolean;
}

export function SummaryDashboard({ passengers, loading }: SummaryDashboardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = {
    totalPassengers: passengers.length,
    downloadSuccess: passengers.filter(p => p.downloadStatus === 'success').length,
    downloadFailed: passengers.filter(p => p.downloadStatus === 'error' || p.downloadStatus === 'not_found').length,
    parseSuccess: passengers.filter(p => p.parseStatus === 'success').length,
    parseFailed: passengers.filter(p => p.parseStatus === 'error').length,
  };

  const passengersWithInvoices = passengers.filter(p => p.parseStatus === 'success' && p.invoiceData);
  const totalAmount = passengersWithInvoices.reduce((sum, p) => sum + (p.invoiceData?.amount || 0), 0);
  const highValueInvoices = passengersWithInvoices.filter(p => (p.invoiceData?.amount || 0) > 30000);

  // Calculate airline-wise summary
  const airlineSummary = passengersWithInvoices.reduce((acc, passenger) => {
    const airline = passenger.invoiceData?.airline || 'Unknown';
    if (!acc[airline]) {
      acc[airline] = { count: 0, amount: 0 };
    }
    acc[airline].count++;
    acc[airline].amount += passenger.invoiceData?.amount || 0;
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Passengers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPassengers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.downloadSuccess}</div>
            <p className="text-xs text-gray-500">
              {stats.downloadFailed} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Parsed Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.parseSuccess}</div>
            <p className="text-xs text-gray-500">
              {stats.parseFailed} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-gray-500">
              {highValueInvoices.length} high-value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Airline Summary */}
      {Object.keys(airlineSummary).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Airline-wise Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(airlineSummary)
                .sort(([,a], [,b]) => b.amount - a.amount)
                .map(([airline, data]) => (
                  <div key={airline} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{airline}</div>
                      <div className="text-sm text-gray-500">{data.count} invoices</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(data.amount)}</div>
                      <div className="text-sm text-gray-500">
                        Avg: {formatCurrency(data.amount / data.count)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* High Value Invoices */}
      {highValueInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>High Value Invoices (Above ₹30,000)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {highValueInvoices.slice(0, 5).map((passenger) => (
                <div key={passenger.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{passenger.firstName} {passenger.lastName}</div>
                    <div className="text-sm text-gray-500">{passenger.invoiceData?.airline}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">
                      {formatCurrency(passenger.invoiceData?.amount || 0)}
                    </div>
                    <div className="text-sm text-gray-500">{passenger.invoiceData?.invoiceNumber}</div>
                  </div>
                </div>
              ))}
              {highValueInvoices.length > 5 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                  And {highValueInvoices.length - 5} more...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
