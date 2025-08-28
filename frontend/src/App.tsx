import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PassengerTable } from "@/components/PassengerTable";
import { InvoicesTable } from "@/components/InvoicesTable";
import { SummaryDashboard } from "@/components/SummaryDashboard";
import { apiService } from "@/services/api";
import type { PassengerData } from "@/types";

type TabType = 'dashboard' | 'passengers' | 'invoices';

function App() {
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  const fetchPassengers = async () => {
    try {
      setError(null);
      const response = await apiService.getPassengers();
      if (response.success && response.data) {
        setPassengers(response.data);
      } else {
        setError(response.error || 'Failed to fetch passengers');
      }
    } catch {
      setError('Network error: Could not connect to the server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePassengerUpdate = (updatedPassenger: PassengerData) => {
    setPassengers(prev => 
      prev.map(p => p.id === updatedPassenger.id ? updatedPassenger : p)
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPassengers();
  };

  useEffect(() => {
    fetchPassengers();
  }, []);

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', count: null },
    { id: 'passengers' as const, label: 'Passengers', count: passengers.length },
    { 
      id: 'invoices' as const, 
      label: 'Invoices', 
      count: passengers.filter(p => p.parseStatus === 'success').length 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoice Processing Dashboard</h1>
              <p className="text-sm text-gray-500">Fincraft Assessment - Invoice Download & Parse System</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? <LoadingSpinner size="sm" className="mr-2" /> : '🔄'}
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-lg">Loading application...</span>
            </CardContent>
          </Card>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <SummaryDashboard passengers={passengers} />
              </div>
            )}

            {activeTab === 'passengers' && (
              <PassengerTable 
                passengers={passengers} 
                onPassengerUpdate={handlePassengerUpdate}
              />
            )}

            {activeTab === 'invoices' && (
              <InvoicesTable passengers={passengers} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Fincraft Assessment - Mini Full-Stack Invoice Processing Application</p>
            <p className="mt-1">Built with React, TypeScript, Tailwind CSS, and shadcn/ui</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
