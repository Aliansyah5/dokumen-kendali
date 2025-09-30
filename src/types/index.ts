export interface DocumentData {
  nama: string;
  status: "Selesai" | "Dalam Proses" | "Belum Dimulai";
  tanggalDiterima: string;
  tanggalSelesai?: string;
  pic?: string;
}

export interface DashboardData {
  namaPaket: string;
  sinkronisasi: string;
  dokumen: DocumentData[];
}

export interface ProgressStats {
  total: number;
  selesai: number;
  dalamProses: number;
  belumDimulai: number;
  persentase: number;
}

export interface TimelineItem {
  tanggal: string;
  status: string;
  dokumen: string;
  pic?: string;
}
