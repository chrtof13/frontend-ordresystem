export type Oppdrag = {
  id: number;
  tittel: string;
  kunde?: string | null;
  telefon?: string | null;

  status?: string | null;
  dato?: string | null;
  sted?: string | null;
  beskrivelse?: string | null;
  type?: string | null;

  timepris?: number | null;
  estimatTimer?: number | null;
    timerGjort?: number | null;

};

export type OppdragBilde = {
  id: number;
  kind: "HEADER" | "PROGRESS";
  url: string;
  caption?: string | null;
  sortOrder?: number | null;
  uploadedAt?: string | null;
};

export type OppdragMaterial = {
  id: number;
  navn: string;
  prisPerStk: number;
  antall: number;
  enhet?: string | null;
  sortOrder?: number | null;
  createdAt?: string | null;
};