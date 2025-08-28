import type { DownloadStatus, ParseStatus } from '../types';

export const getStatusColor = (status: DownloadStatus | ParseStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'success':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'error':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'not_found':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

export const getStatusIcon = (status: DownloadStatus | ParseStatus) => {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'not_found':
      return '🔍';
    default:
      return '❓';
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getStatusText = (status: DownloadStatus | ParseStatus) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'success':
      return 'Success';
    case 'error':
      return 'Error';
    case 'not_found':
      return 'Not Found';
    default:
      return 'Unknown';
  }
};
