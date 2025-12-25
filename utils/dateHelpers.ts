/**
 * Converte uma string de data ISO (YYYY-MM-DD) para um objeto Date local
 * sem problemas de timezone (evita conversão UTC)
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();

  // Se for formato ISO com hora (2026-01-01T08:30:00), pega só a parte da data
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Converte uma string de data/hora ISO para um objeto Date local
 */
export function parseLocalDateTime(dateTimeString: string): Date {
  if (!dateTimeString) return new Date();

  const [datePart, timePart] = dateTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);

  if (timePart) {
    const [hour, minute, second] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
  }

  return new Date(year, month - 1, day);
}

/**
 * Retorna a data de hoje com hora zerada
 */
export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Calcula quantos dias faltam até uma data
 */
export function getDaysUntil(dateString: string): number {
  const eventDate = parseLocalDate(dateString);
  eventDate.setHours(0, 0, 0, 0);
  const today = getToday();
  const diffTime = eventDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Verifica se uma data já passou
 */
export function isPastDate(dateString: string): boolean {
  const date = parseLocalDate(dateString);
  date.setHours(0, 0, 0, 0);
  return date < getToday();
}

/**
 * Verifica se uma data é futura
 */
export function isFutureDate(dateString: string): boolean {
  return !isPastDate(dateString);
}

/**
 * Verifica se uma data é hoje
 */
export function isToday(dateString: string): boolean {
  const date = parseLocalDate(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Formata uma data para exibição (DD/MM/YYYY)
 */
export function formatDateDisplay(dateString: string): string {
  const date = parseLocalDate(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formata uma data/hora para exibição (DD/MM/YYYY HH:mm)
 */
export function formatDateTimeDisplay(dateTimeString: string): string {
  const date = parseLocalDateTime(dateTimeString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

/**
 * Retorna o dia e mês abreviado para exibição em cards
 */
export function getDateParts(dateString: string): { day: number; month: string } {
  const date = parseLocalDate(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
  return { day, month };
}

/**
 * Retorna texto de countdown (Hoje, Amanhã, Em X dias)
 */
export function getCountdownText(dateString: string): string {
  const daysUntil = getDaysUntil(dateString);

  if (daysUntil === 0) return 'Hoje';
  if (daysUntil === 1) return 'Amanha';
  if (daysUntil < 0) return `Ha ${Math.abs(daysUntil)} dias`;
  return `Em ${daysUntil} dias`;
}
