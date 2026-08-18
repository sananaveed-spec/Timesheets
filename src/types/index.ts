export interface ClockifyRow {
  Project: string;
  Client: string;
  Description: string;
  Activity: string;
  User: string;
  Group: string;
  Email: string;
  Tags: string;
  Type: string;
  Billable: string;
  Invoiced: string;
  'Invoice ID': string;
  'Start Date': string;
  'Start Time': string;
  'End Date': string;
  'End Time': string;
  'Duration (h)': string;
  'Duration (decimal)': string;
  'Billable Rate (USD)': string;
  'Billable Amount (USD)': string;
  'Date of creation': string;
}

export type IndentLevel = 0 | 1 | 2;

export interface PivotRow {
  label: string;
  indentLevel: IndentLevel;
  dateValues: Record<string, number>;
  grandTotal: number;
  isEmployeeTotal?: boolean;
}

export interface PivotData {
  dates: string[];
  dateLabels: string[];
  rows: PivotRow[];
  reportTitle: string;
}

export type EmployeeCategory =
  | 'full-time-salaried'
  | 'full-time-hourly'
  | 'part-time-hourly';

export interface ManagedUser {
  id: string;
  name: string;
  category: EmployeeCategory;
}

export interface MentionUser {
  id: string;
  name: string;
}
