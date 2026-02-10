
export enum Role {
  CEO = 'CEO',
  DUEÑO = 'DUEÑO',
  SUPERVISOR = 'SUPERVISOR',
  RECAUDADOR = 'RECAUDADOR',
  CLIENTE = 'CLIENTE',
  SOPORTE = 'SOPORTE'
}

export enum Periodicity {
  DIARIO = 'DIARIO',
  SEMANAL = 'SEMANAL',
  CATORCENAL = 'CATORCENAL',
  MENSUAL = 'MENSUAL'
}

export enum LoanStatus {
  ACTIVO = 'ACTIVO',
  VENCIDO = 'VENCIDO',
  PAGADO = 'PAGADO',
  PENDIENTE = 'PENDIENTE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatar?: string;
  parentId?: string;
  assignedCapital?: number;
  profitMargin?: number;
  routeId?: string; // Vínculo opcional con una ruta
}

export interface Route {
  id: string;
  name: string;
  ownerId: string;
  supervisorId?: string;
  description?: string;
}

export interface Loan {
  id: string;
  clientId: string;
  collectorId: string;
  routeId: string;
  principal: number;
  totalInterest: number;
  totalAmount: number;
  periodicity: Periodicity;
  installmentsCount: number;
  startDate: string;
  status: LoanStatus;
}

export interface Installment {
  id: string;
  loanId: string;
  number: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'PENDIENTE' | 'PAGADO' | 'PARCIAL' | 'VENCIDO';
}

export interface Payment {
  id: string;
  installmentId: string;
  amount: number;
  method: 'MANUAL' | 'PASARELA';
  evidenceUrl?: string;
  timestamp: string;
  collectorId?: string;
}
