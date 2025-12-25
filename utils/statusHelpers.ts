import { Colors } from '@/constants/colors';

export type StatusInscricao = 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'CANCELADO_EVENTO';

export function getStatusColor(status: StatusInscricao): string {
  const colors: Record<StatusInscricao, string> = {
    PENDENTE: Colors.warning,
    PAGO: Colors.success,
    CANCELADO: Colors.error,
    CANCELADO_EVENTO: Colors.error,
  };
  return colors[status] || Colors.textSecondary;
}

export function getStatusLabel(status: StatusInscricao): string {
  const labels: Record<StatusInscricao, string> = {
    PENDENTE: 'Pendente',
    PAGO: 'Confirmado',
    CANCELADO: 'Cancelado',
    CANCELADO_EVENTO: 'Evento Cancelado',
  };
  return labels[status] || status;
}

export function getStatusBackgroundColor(status: StatusInscricao): string {
  return getStatusColor(status) + '20';
}
