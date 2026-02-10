
export enum Role {
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
  password?: string; // Añadido para autenticación
  role: Role;
  avatar?: string;
  parentId?: string; // ID del usuario que lo creó (Dueño -> Supervisor -> Recaudador)
  assignedCapital?: number; // Para Recaudadores
  profitMargin?: number; // % de ganancia para el recaudador
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
