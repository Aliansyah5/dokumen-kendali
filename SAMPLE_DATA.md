# Sample Excel Data Template

Untuk menguji aplikasi dashboard monitoring, Anda dapat membuat file Excel dengan format berikut:

## Format File Excel

| Kolom A (Nama Dokumen) | Kolom B (Status) | Kolom C (Tanggal Diterima) | Kolom D (Tanggal Selesai) | Kolom E (PIC)  |
| ---------------------- | ---------------- | -------------------------- | ------------------------- | -------------- |
| Dokumen Persetujuan A  | Selesai          | 2024-01-15                 | 2024-02-15                | John Doe       |
| Dokumen Teknis B       | Dalam Proses     | 2024-01-20                 |                           | Jane Smith     |
| Laporan Keuangan C     | Belum Dimulai    | 2024-02-01                 |                           | Bob Johnson    |
| Kontrak Pekerjaan D    | Selesai          | 2024-01-10                 | 2024-01-25                | Alice Brown    |
| Izin Lingkungan E      | Dalam Proses     | 2024-02-05                 |                           | Charlie Wilson |

## Contoh Data untuk Testing

Berikut contoh data yang dapat digunakan untuk testing:

1. **Dokumen Persetujuan Teknis** - Status: Selesai - Diterima: 15/01/2024 - Selesai: 15/02/2024 - PIC: Ahmad Suryadi
2. **Laporan Kemajuan Mingguan** - Status: Dalam Proses - Diterima: 20/01/2024 - PIC: Siti Nurhaliza
3. **Surat Keputusan Menteri** - Status: Belum Dimulai - Diterima: 01/02/2024 - PIC: Budi Santoso
4. **Dokumen RAB** - Status: Selesai - Diterima: 10/01/2024 - Selesai: 25/01/2024 - PIC: Rina Handayani
5. **Izin Gangguan** - Status: Dalam Proses - Diterima: 05/02/2024 - PIC: Teguh Wibowo

## Instruksi Penggunaan

1. Buat file Excel baru (.xlsx)
2. Masukkan data sesuai format di atas
3. Simpan file
4. Upload file tersebut ke aplikasi dashboard
5. Lihat visualisasi progress yang dihasilkan

## Catatan Penting

- Kolom status harus berisi salah satu dari: "Selesai", "Dalam Proses", atau "Belum Dimulai"
- Format tanggal: YYYY-MM-DD (contoh: 2024-01-15)
- Kolom PIC bersifat opsional
- Baris pertama akan dianggap sebagai header dan akan diabaikan saat parsing
