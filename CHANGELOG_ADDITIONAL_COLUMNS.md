# Perubahan Terbaru - Kolom Tambahan Dokumen

## Ringkasan Perubahan

Telah dilakukan perubahan pada aplikasi dokumen kendali untuk menambahkan kolom-kolom tambahan sesuai dengan kebutuhan:

### 1. Progress Percentage yang Lebih Besar

- Ukuran font progress percentage di halaman detail dokumen diperbesar dari `text-2xl` menjadi `text-4xl`
- Ukuran font label "Progress" diperbesar dari `text-sm` menjadi `text-base font-medium`
- Perubahan ini membuat progress percentage lebih menonjol dan mudah dibaca

### 2. Kolom KAK untuk Sub Document Balai

- Ditambahkan kolom "KAK" khusus untuk sub document yang mengandung kata "balai" dalam judulnya
- Kolom ini memungkinkan penambahan dan pengeditan data KAK melalui modal input
- Data disimpan di database Supabase dalam tabel `additional_document_data`

### 3. Kolom Tambahan untuk Direktorat Irigasi dan Rawa

- Ditambahkan 2 kolom baru untuk sub document yang mengandung "direktorat irigasi" atau "irigasi dan rawa":
  1. **Nota Dinas Direktur Irigasi dan Rawa Ke Ditjen SDA**
  2. **Nota Dinas Dit. Irwa ke KI**
- Kedua kolom ini juga dapat diedit melalui modal input yang sama seperti link
- Data disimpan di database Supabase

## Perubahan File

### Database

- **File baru**: `database/additional_columns_setup.sql`
  - Script SQL untuk membuat tabel `additional_document_data`
  - Menyimpan data kolom tambahan (KAK dan 2 kolom direktorat)

### Backend/Services

- **`src/lib/supabase.ts`**

  - Ditambahkan interface `SupabaseAdditionalDocumentData`

- **`src/services/SupabaseDatabaseService.ts`**

  - Ditambahkan interface `AdditionalDocumentData`
  - Ditambahkan methods untuk CRUD operations:
    - `addOrUpdateAdditionalDocumentData()`
    - `getAdditionalDocumentData()`
    - `updateAdditionalDocumentDataField()`
    - `deleteAdditionalDocumentData()`

- **`src/services/ExcelService.ts`**
  - Ditambahkan field tambahan di interface `DocumentItem`:
    - `kak?: string`
    - `notaDinasDirIrigasiKeDitjen?: string`
    - `notaDinasDitIrwaKeKI?: string`

### Frontend/Components

- **`src/pages/DocumentDetail.tsx`**

  - Progress percentage diperbesar
  - Ditambahkan props `subDocumentId` dan `subDocumentTitle` ke `DocumentTable`

- **`src/components/DocumentTable.tsx`**
  - Ditambahkan props baru: `subDocumentId` dan `subDocumentTitle`
  - Ditambahkan state untuk mengelola additional data
  - Ditambahkan helper functions:
    - `shouldShowKAKColumn()` - menentukan apakah menampilkan kolom KAK
    - `shouldShowDirIrigasiColumns()` - menentukan apakah menampilkan kolom direktorat
    - `getAdditionalDataValue()` - mengambil nilai additional data
    - `renderAdditionalField()` - render kolom tambahan dengan edit button
  - Ditambahkan kolom header dan body tabel untuk KAK dan direktorat
  - Ditambahkan modal edit untuk additional fields

## Cara Penggunaan

### 1. Setup Database

Jalankan script SQL berikut di Supabase SQL Editor:

```sql
-- Dari file: database/additional_columns_setup.sql
```

### 2. Kolom Tambahan

- **KAK**: Kolom ini akan muncul otomatis pada sub document yang judulnya mengandung kata "balai"
- **Nota Dinas**: Kedua kolom ini akan muncul otomatis pada sub document yang judulnya mengandung "direktorat irigasi" atau "irigasi dan rawa"

### 3. Mengedit Kolom Tambahan

1. Klik tombol edit (ikon pensil) pada kolom yang ingin diedit
2. Modal akan terbuka dengan form input
3. Masukkan nilai yang diinginkan
4. Klik "Simpan" untuk menyimpan ke database

## Struktur Database Baru

### Tabel: additional_document_data

```sql
- id (BIGSERIAL PRIMARY KEY)
- package_id (TEXT NOT NULL)
- sub_document_id (TEXT NOT NULL)
- document_id (TEXT NOT NULL)
- document_name (TEXT NOT NULL)
- kak (TEXT) -- Untuk sub document Balai
- nota_dinas_dir_irigasi_ke_ditjen (TEXT) -- Untuk direktorat irigasi
- nota_dinas_dit_irwa_ke_ki (TEXT) -- Untuk direktorat irigasi
- created_at (TIMESTAMP WITH TIME ZONE)
- updated_at (TIMESTAMP WITH TIME ZONE)
```

## Testing

Untuk menguji fitur baru:

1. Pastikan script SQL sudah dijalankan di Supabase
2. Buka halaman detail dokumen untuk paket dengan sub document "Balai"
3. Verifikasi kolom "KAK" muncul di tabel
4. Buka halaman detail dokumen untuk paket dengan sub document "Direktorat Irigasi"
5. Verifikasi 2 kolom "Nota Dinas" muncul di tabel
6. Test edit functionality dengan klik tombol edit pada kolom tambahan

## Catatan

- Kolom tambahan hanya muncul sesuai dengan kondisi sub document yang relevan
- Data disimpan secara real-time ke database Supabase
- Modal edit menggunakan pattern yang sama dengan edit link untuk konsistensi UX

prompt

1. saya ingin tulisan {subDocumentData.progress.percentage}% dibuat lebih besar agar sesuai dengan container nya dan tidak terlalu kecil

2.disetiap sub document hanya nomor 1 / Balai
tambahkan kolom lagi namanya KAK simpan di supabase, untuk action nya sama seperti link input via modal tanpa jadikan text biasa

3.disetiap sub document hanya nomor 2 / direktorat irigasi dan rawa
tambahkan 2 kolom lagi namanya

1.  Nota Dinas Direktur Irigasi dan Rawa Ke Ditjen SDA
2.  Nota Dinas dit. Irwa ke KI
    simpan di supabase, untuk action nya sama seperti link input via modal tanpa jadikan text biasa
