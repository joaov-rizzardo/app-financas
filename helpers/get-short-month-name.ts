export function getShortMonthName(monthIndex: number): string {
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];  
    return monthNames[monthIndex];
  }
  