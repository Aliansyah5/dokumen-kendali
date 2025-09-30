import React, { useRef, useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { DocumentData } from "../types";

interface FileUploadProps {
  onUpload: (data: DocumentData[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const processExcelFile = (file: File) => {
    setUploading(true);
    setError(null);
    setSuccess(false);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        // Get first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Parse data (assuming first row is header)
        const documents: DocumentData[] = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row && row.length > 0 && row[0]) {
            // Skip empty rows
            const doc: DocumentData = {
              nama: String(row[0] || "").trim(),
              status: validateStatus(String(row[1] || "").trim()),
              tanggalDiterima: parseDate(row[2]),
              tanggalSelesai: parseDate(row[3]),
              pic: row[4] ? String(row[4]).trim() : undefined,
            };

            if (doc.nama) {
              // Only add if document name exists
              documents.push(doc);
            }
          }
        }

        if (documents.length === 0) {
          throw new Error(
            "Tidak ada data yang valid ditemukan dalam file Excel"
          );
        }

        onUpload(documents);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        console.error("Error processing Excel file:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memproses file"
        );
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = () => {
      setError("Gagal membaca file");
      setUploading(false);
    };

    reader.readAsBinaryString(file);
  };

  const validateStatus = (
    status: string
  ): "Selesai" | "Dalam Proses" | "Belum Dimulai" => {
    const normalizedStatus = status.toLowerCase().trim();

    if (
      normalizedStatus.includes("selesai") ||
      normalizedStatus.includes("complete")
    ) {
      return "Selesai";
    } else if (
      normalizedStatus.includes("proses") ||
      normalizedStatus.includes("progress")
    ) {
      return "Dalam Proses";
    } else {
      return "Belum Dimulai";
    }
  };

  const parseDate = (dateValue: any): string => {
    if (!dateValue) return "";

    // If it's already a string, return it
    if (typeof dateValue === "string") {
      return dateValue.trim();
    }

    // If it's a number (Excel date serial), convert it
    if (typeof dateValue === "number") {
      const date = XLSX.SSF.parse_date_code(dateValue);
      return `${date.y}-${String(date.m).padStart(2, "0")}-${String(
        date.d
      ).padStart(2, "0")}`;
    }

    // If it's a Date object
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split("T")[0];
    }

    return "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const validateAndProcessFile = (file: File) => {
    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      ".xlsx",
      ".xls",
    ];

    const fileExtension = file.name.toLowerCase().split(".").pop();

    if (
      !allowedTypes.includes(file.type) &&
      !["xlsx", "xls"].includes(fileExtension || "")
    ) {
      setError(
        "Format file tidak didukung. Silakan upload file Excel (.xlsx atau .xls)"
      );
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file terlalu besar. Maksimal 10MB");
      return;
    }

    processExcelFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="w-full">
      <div
        onClick={handleFileSelect}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200
          ${
            dragOver
              ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-102"
              : "border-blue-300 hover:border-blue-400 bg-white hover:shadow-md"
          }
          ${uploading ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center text-center">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-sm text-blue-600 font-medium">
                Memproses file...
              </p>
            </>
          ) : success ? (
            <>
              <CheckCircle className="h-8 w-8 text-blue-600 mb-3" />
              <p className="text-sm text-blue-600 font-bold">
                File berhasil diupload!
              </p>
            </>
          ) : (
            <>
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl shadow-3d mb-3">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-700 mb-1 font-medium">
                <span className="font-bold text-blue-600">
                  Klik untuk upload
                </span>{" "}
                atau drag & drop
              </p>
              <p className="text-xs text-blue-500 font-medium">
                Excel files (.xlsx, .xls) up to 10MB
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* File format guide */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
        <div className="flex items-start">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-bold mb-2">Format Excel yang diharapkan:</p>
            <ul className="list-disc list-inside space-y-1 font-medium">
              <li>Kolom A: Nama Dokumen</li>
              <li>Kolom B: Status (Selesai/Dalam Proses/Belum Dimulai)</li>
              <li>Kolom C: Tanggal Diterima</li>
              <li>Kolom D: Tanggal Selesai</li>
              <li>Kolom E: PIC (Opsional)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
