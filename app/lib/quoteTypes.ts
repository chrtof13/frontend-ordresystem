export type QuoteStatus = "DRAFT" | "SENT" | "CANCELLED" | string;

export type QuoteLineType = "ITEM" | "TEXT" | "SECTION" | string;

export type QuoteLine = {
  id?: number;
  type: QuoteLineType;
  name: string;
  qty: number | null;
  unit: string | null;
  unitPrice: number | null;
  sortOrder: number;
};

export type Quote = {
  id?: number;
  firmaId?: number;

  status?: QuoteStatus;

  kundeNavn: string;
  kundeEpost: string | null;
  kundeTelefon: string | null;

  title: string | null;
  message: string | null;

  vatRate: number; // f.eks 25
  validUntil: string | null; // YYYY-MM-DD

  createdAt?: string | null;
  updatedAt?: string | null;

  lines: QuoteLine[];

  // kan komme fra backend
  sumExVat?: number | null;
  sumIncVat?: number | null;
};