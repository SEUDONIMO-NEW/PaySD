
import { Periodicity } from './types';

export const COLORS = {
  primary: '#1e293b', // Slate 800
  secondary: '#3b82f6', // Blue 500
  success: '#10b981', // Emerald 500
  danger: '#ef4444', // Red 500
  warning: '#f59e0b', // Amber 500
  background: '#f8fafc', // Slate 50
};

export const DEFAULT_LOAN_CONFIGS = {
  [Periodicity.DIARIO]: { rate: 0.12, installments: 20 },
  [Periodicity.SEMANAL]: { rate: 0.16, installments: 10 },
  [Periodicity.CATORCENAL]: { rate: 0.20, installments: 6 },
  [Periodicity.MENSUAL]: { rate: 0.25, installments: 4 },
};

export const MOCK_CHART_DATA = [
  { name: 'Lun', Recaudo: 4000, Meta: 5000 },
  { name: 'Mar', Recaudo: 3000, Meta: 5000 },
  { name: 'Mie', Recaudo: 2000, Meta: 5000 },
  { name: 'Jue', Recaudo: 2780, Meta: 5000 },
  { name: 'Vie', Recaudo: 1890, Meta: 5000 },
  { name: 'Sab', Recaudo: 2390, Meta: 5000 },
  { name: 'Dom', Recaudo: 3490, Meta: 5000 },
];
