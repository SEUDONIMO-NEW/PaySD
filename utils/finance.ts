
import { Loan, Installment, Periodicity, LoanStatus } from '../types';

export const calculateTotalDebt = (principal: number, totalRate: number): number => {
  return principal + (principal * totalRate);
};

export const generateInstallments = (
  loanId: string,
  principal: number,
  totalRate: number,
  periodicity: Periodicity,
  count: number,
  startDate: string
): Installment[] => {
  const totalDebt = calculateTotalDebt(principal, totalRate);
  const installmentAmount = Math.ceil(totalDebt / count);
  const installments: Installment[] = [];
  const start = new Date(startDate);

  for (let i = 1; i <= count; i++) {
    const dueDate = new Date(start);
    
    if (periodicity === Periodicity.DIARIO) {
      dueDate.setDate(start.getDate() + i);
    } else if (periodicity === Periodicity.SEMANAL) {
      dueDate.setDate(start.getDate() + (i * 7));
    } else if (periodicity === Periodicity.CATORCENAL) {
      dueDate.setDate(start.getDate() + (i * 14));
    } else if (periodicity === Periodicity.MENSUAL) {
      dueDate.setMonth(start.getMonth() + i);
    }

    installments.push({
      id: `inst-${loanId}-${i}`,
      loanId,
      number: i,
      dueDate: dueDate.toISOString(),
      amount: installmentAmount,
      paidAmount: 0,
      status: 'PENDIENTE'
    });
  }

  return installments;
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
};
