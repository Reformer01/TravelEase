// Date type definitions and utilities for better type safety

export type DateString = string; // ISO 8601 date string format

export type DateInput = string; // HTML5 date input format (YYYY-MM-DD)

export interface DateRange {
  start: DateString;
  end: DateString;
}

export interface BookingDates {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
}

// Date validation utilities
export const isValidDateString = (date: string): date is DateString => {
  if (!date || typeof date !== 'string') return false;
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime()) && dateObj.toISOString() === date;
};

export const isValidDateInput = (date: string): date is DateInput => {
  if (!date || typeof date !== 'string') return false;
  // HTML5 date input format: YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
};

export const formatDateInput = (date: DateString | Date): DateInput => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const formatDateDisplay = (date: DateString | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export const toISOString = (date: DateString | Date): DateString => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toISOString();
};
