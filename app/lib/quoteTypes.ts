export type QuoteStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "DECLINED"
  | "EXPIRED"
  | string;
export type QuoteLineType = "WORK" | "MATERIAL" | string;

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

  vatRate: number;
  validUntil: string | null;

  // ✅ NYTT:
  replyToEmail: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;

  lines: QuoteLine[];

  sumExVat?: number | null;
  sumIncVat?: number | null;
};