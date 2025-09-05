export interface KpiCard {
  id: string;
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  spark?: number[];
  hint?: string;
  sublabel?: string;
}

export interface FiltersState {
  party?: number[];
  channel?: Array<'WEB' | 'PHONE' | 'WALKIN'>;
  status?: string[];
  deposits?: 'ON' | 'OFF' | null;
  vip?: boolean | null;
}

export type Section = 'Patio' | 'Bar' | 'Main';

export interface TableRow {
  id: string;
  name: string;
  section: Section;
  capacity: number;
  available: boolean;
}

export interface Reservation {
  id: string;
  guestName: string;
  tableId: string;
  section: Section;
  start: string; // ISO
  end: string;   // ISO
  partySize: number;
  channel: 'WEB' | 'PHONE' | 'WALKIN';
  vip: boolean;
  depositRequired: boolean;
  status: 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  specialRequests?: string;
  guestPhone?: string;
  guestEmail?: string;
}

export interface Policy {
  depositsEnabled: boolean;
}

export interface CommandCenterData {
  kpis: KpiCard[];
  tables: TableRow[];
  reservations: Reservation[];
  policies: Policy;
  loading: boolean;
  error?: { code: string; message: string; requestId?: string };
}