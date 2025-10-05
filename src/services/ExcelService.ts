import * as XLSX from "xlsx";
import { googleSheetsService } from "./GoogleSheetsService";

export interface DocumentItem {
  nama: string;
  checklist: string;
  tanggalTerima: string;
  tanggalSelesai: string;
  tindakLanjut: string;
  keterangan: string;
  linkUpload?: string;
  status?: "Selesai" | "Dalam Proses" | "Belum Dimulai";
  timelineEntries?: TimelineEntry[];
  // Kolom tambahan untuk sub document 1 (Balai)
  kak?: string;
  // Kolom tambahan untuk sub document 2 (Direktorat Irigasi dan Rawa)
  notaDinasDirIrigasiKeDitjen?: string;
  notaDinasDitIrwaKeKI?: string;
}

export interface TimelineEntry {
  date: string;
  month: string;
  hasCheck: boolean;
  columnIndex: number;
}

export interface MonthlySchedule {
  month: string;
  year: number;
  startColumn: string;
  endColumn: string;
  dates: { [key: string]: boolean }; // date -> hasCheck
}

export interface SubDocument {
  id: string;
  title: string;
  documents: DocumentItem[];
  progress: {
    total: number;
    completed: number;
    inProgress: number;
    percentage: number;
  };
}

export interface Package {
  id: string;
  name: string;
  subDocuments: SubDocument[];
  totalDocuments: number;
  completedDocuments: number;
  progressPercentage: number;
}

export interface TimeScheduleData {
  tanggal: string;
  bulan: string;
  dokumen: string;
  packageId: string;
  subDocumentId: string;
  documentIndex: number;
  hasCheck: boolean;
}

export interface ExcelData {
  namaPaket: string;
  tahunAnggaran: string;
  packages: Package[];
  timeSchedule: TimeScheduleData[];
}

// Interface for document row mapping
interface DocumentRowConfig {
  name: string;
  rows: number[];
}

interface SubDocumentMapping {
  [key: string]: DocumentRowConfig;
}

interface DocumentRowMapping {
  [packageId: string]: SubDocumentMapping;
}

class ExcelService {
  private workbook: XLSX.WorkBook | null = null;
  private worksheet: XLSX.WorkSheet | null = null;
  private useGoogleSheets: boolean = false;

  async loadGoogleSheets(): Promise<void> {
    try {
      console.log("🌐 Loading data from Google Sheets...");

      // Load Google Sheets data
      await googleSheetsService.loadGoogleSheet();

      // Create a mock worksheet from Google Sheets data
      const worksheetData = googleSheetsService.getWorksheetData();
      this.worksheet = worksheetData as any;
      this.useGoogleSheets = true;

      console.log("✅ Google Sheets data loaded successfully");

      // Debug: Check some key cells
      console.log("Sample cell values from Google Sheets:");
      console.log("D2 (Nama Paket):", this.getCellValue("D2"));
      console.log("D3 (Tahun Anggaran):", this.getCellValue("D3"));
      console.log("C9 (Package 1):", this.getCellValue("C9"));
      console.log("C38 (Package 2):", this.getCellValue("C38"));
      console.log("C67 (Package 3):", this.getCellValue("C67"));
    } catch (error) {
      console.error("Error loading Google Sheets:", error);
      throw new Error("Failed to load Google Sheets");
    }
  }

  async loadExcelFile(filePath: string): Promise<void> {
    try {
      console.log("Loading Excel file from:", filePath);
      // For web environment, we'll need to fetch the file
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      console.log("Excel file loaded, size:", arrayBuffer.byteLength, "bytes");

      this.workbook = XLSX.read(arrayBuffer, { type: "array" });
      console.log("Workbook loaded, sheets:", this.workbook.SheetNames);

      // Get the first worksheet
      const sheetName = this.workbook.SheetNames[0];
      this.worksheet = this.workbook.Sheets[sheetName];
      this.useGoogleSheets = false;
      console.log("Using worksheet:", sheetName);

      // Debug: Check some key cells
      console.log("Sample cell values:");
      console.log("D2 (Nama Paket):", this.getCellValue("D2"));
      console.log("D3 (Tahun Anggaran):", this.getCellValue("D3"));
      console.log("C9 (Package 1):", this.getCellValue("C9"));
      console.log("C38 (Package 2):", this.getCellValue("C38"));
      console.log("C67 (Package 3):", this.getCellValue("C67"));
    } catch (error) {
      console.error("Error loading Excel file:", error);
      throw new Error("Failed to load Excel file");
    }
  }

  private getColumnLetter(colIndex: number): string {
    let result = "";
    while (colIndex >= 0) {
      result = String.fromCharCode(65 + (colIndex % 26)) + result;
      colIndex = Math.floor(colIndex / 26) - 1;
    }
    return result;
  }

  private getCellValue(cellRef: string): string {
    // Use Google Sheets service if in Google Sheets mode
    if (this.useGoogleSheets) {
      return googleSheetsService.getCellValue(cellRef);
    }

    // Use Excel/local file mode
    if (!this.worksheet) {
      console.warn(`getCellValue(${cellRef}): No worksheet loaded`);
      return "";
    }
    const cell = this.worksheet[cellRef];
    const value = cell ? String(cell.v || "") : "";
    // Only log non-empty values to avoid spam
    if (
      value.trim() &&
      [
        "D2",
        "D3",
        "C9",
        "C38",
        "C67",
        "D9",
        "D20",
        "D28",
        "D35",
        "D46",
        "D54",
        "D61",
        "D72",
        "D80",
      ].includes(cellRef)
    ) {
      console.log(`getCellValue(${cellRef}): "${value}"`);
    }
    return value;
  }

  private getCellValueAsDate(cellRef: string): string {
    // Use Google Sheets service if in Google Sheets mode
    if (this.useGoogleSheets) {
      return googleSheetsService.getCellValueAsDate(cellRef);
    }

    // Use Excel/local file mode
    if (!this.worksheet) return "";
    const cell = this.worksheet[cellRef];

    if (!cell) return "";

    // If it's a number (Excel date serial)
    if (typeof cell.v === "number") {
      try {
        const date = XLSX.SSF.parse_date_code(cell.v);
        // Validate the parsed date
        if (
          date.y >= 1900 &&
          date.y <= 2100 &&
          date.m >= 1 &&
          date.m <= 12 &&
          date.d >= 1 &&
          date.d <= 31
        ) {
          return `${date.y}-${String(date.m).padStart(2, "0")}-${String(
            date.d
          ).padStart(2, "0")}`;
        }
      } catch (error) {
        console.warn(`Error parsing date serial ${cell.v}:`, error);
        return "";
      }
    }

    // If it's a string, try to format it properly
    const cellValue = String(cell.v || "");
    if (cellValue.trim()) {
      // Use our formatDateString helper - we need to estimate year/month if not available
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const formattedDate = this.formatDateString(
        cellValue,
        currentYear,
        currentMonth
      );
      return formattedDate || cellValue; // Return original if formatting fails
    }

    return "";
  }

  getBasicInfo(): { namaPaket: string; tahunAnggaran: string } {
    return {
      namaPaket: this.getCellValue("D2"),
      tahunAnggaran: this.getCellValue("D3"),
    };
  }

  private determineStatus(
    checklist: string
  ): "Selesai" | "Dalam Proses" | "Belum Dimulai" {
    const check = checklist.toLowerCase().trim();
    if (
      check.includes("v") ||
      check.includes("✓") ||
      check.includes("selesai") ||
      check.includes("100")
    ) {
      return "Selesai";
    } else if (
      check.includes("progress") ||
      check.includes("proses") ||
      (check.match(/\d+/) && parseInt(check) > 0)
    ) {
      return "Dalam Proses";
    }
    return "Belum Dimulai";
  }

  private calculateProgress(documents: DocumentItem[]) {
    const total = documents.length;
    const completed = documents.filter(
      (doc) => doc.status === "Selesai"
    ).length;
    const inProgress = documents.filter(
      (doc) => doc.status === "Dalam Proses"
    ).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, percentage };
  }

  getPackages(): Package[] {
    const packages: Package[] = [];

    // Debug: Log basic info
    console.log("Excel Basic Info:", {
      namaPaket: this.getCellValue("D2"),
      tahunAnggaran: this.getCellValue("D3"),
    });

    // Package 1: C9
    const package1Name = this.getCellValue("C9");
    console.log("Package 1 Name (C9):", package1Name);
    if (package1Name) {
      packages.push(
        this.parsePackage("1", package1Name, [
          { titleCell: "D9", startRow: 10, endRow: 18 }, // E10:E18 (9 dokumen untuk Balai)
          { titleCell: "D21", startRow: 22, endRow: 28 }, // E22:E28 (7 dokumen untuk Irigasi)
          { titleCell: "D31", startRow: 32, endRow: 33 }, // E31:E32 (Kepatuhan Intern)
        ])
      );
    }

    // Package 2: C38
    const package2Name = this.getCellValue("C38");
    console.log("Package 2 Name (C38):", package2Name);
    if (package2Name) {
      packages.push(
        this.parsePackage("2", package2Name, [
          { titleCell: "D38", startRow: 39, endRow: 47 }, // E36:E44 (9 dokumen untuk Balai)
          { titleCell: "D50", startRow: 51, endRow: 57 }, // E48:E54 (7 dokumen untuk Irigasi)
          { titleCell: "D60", startRow: 61, endRow: 62 }, // E57:E58 (Kepatuhan Intern)
        ])
      );
    }

    // Package 3: C61
    const package3Name = this.getCellValue("C67");
    console.log("Package 3 Name (C67):", package3Name);
    if (package3Name) {
      packages.push(
        this.parsePackage("3", package3Name, [
          { titleCell: "D67", startRow: 68, endRow: 76 }, // E62:E70 (9 dokumen untuk Balai)
          { titleCell: "D79", startRow: 80, endRow: 86 }, // E74:E80 (7 dokumen untuk Irigasi)
          { titleCell: "D89", startRow: 90, endRow: 91 }, // E83:E84 (Kepatuhan Intern)
        ])
      );
    }

    console.log("Total packages found:", packages.length);
    packages.forEach((pkg) => {
      console.log(
        `Package ${pkg.id}: ${pkg.name}, SubDocs: ${pkg.subDocuments.length}, Total Docs: ${pkg.totalDocuments}`
      );
    });

    return packages;
  }

  private parsePackage(
    packageId: string,
    packageName: string,
    subDocConfigs: Array<{
      titleCell: string;
      startRow: number;
      endRow: number;
    }>
  ): Package {
    const subDocuments: SubDocument[] = [];
    let totalDocuments = 0;
    let completedDocuments = 0;

    console.log(`\nParsing Package ${packageId}: ${packageName}`);

    subDocConfigs.forEach((config, index) => {
      const subDocId = `${packageId}-${index + 1}`;
      const title = this.getCellValue(config.titleCell);

      console.log(
        `  SubDoc ${index + 1} - Title Cell ${config.titleCell}:`,
        title
      );
      console.log(`  Document Range: E${config.startRow}:E${config.endRow}`);

      if (title) {
        const documents: DocumentItem[] = [];

        for (let row = config.startRow; row <= config.endRow; row++) {
          const documentName = this.getCellValue(`E${row}`);
          if (documentName.trim()) {
            console.log(`    E${row}: "${documentName}"`);
            const checklist = this.getCellValue(`F${row}`);
            const status = this.determineStatus(checklist);

            const doc: DocumentItem = {
              nama: documentName,
              checklist,
              tanggalTerima: this.getCellValue(`G${row}`),
              tanggalSelesai: this.getCellValue(`H${row}`),
              tindakLanjut: this.getCellValue(`I${row}`),
              keterangan: this.getCellValue(`J${row}`),
              linkUpload: this.getCellValue(`K${row}`),
              status,
            };

            documents.push(doc);
            totalDocuments++;
            if (status === "Selesai") completedDocuments++;
          }
        }

        const progress = this.calculateProgress(documents);
        console.log(`  SubDoc ${index + 1} Documents Found:`, documents.length);

        subDocuments.push({
          id: subDocId,
          title,
          documents,
          progress,
        });
      }
    });

    const progressPercentage =
      totalDocuments > 0
        ? Math.round((completedDocuments / totalDocuments) * 100)
        : 0;

    return {
      id: packageId,
      name: packageName,
      subDocuments,
      totalDocuments,
      completedDocuments,
      progressPercentage,
    };
  }

  getTimeScheduleData(): TimeScheduleData[] {
    const timeSchedule: TimeScheduleData[] = [];

    if (!this.worksheet) {
      console.log(
        "❌ ERROR: No worksheet loaded - Excel file not loaded properly!"
      );
      return timeSchedule;
    }

    console.log("=== SCANNING EXCEL FOR TIMELINE DATA ===");
    console.log("✅ Worksheet loaded successfully");

    // Test basic Excel structure first
    console.log("=== BASIC EXCEL STRUCTURE TEST ===");
    console.log("D2 (Nama Paket):", this.getCellValue("D2"));
    console.log("D3 (Tahun Anggaran):", this.getCellValue("D3"));
    console.log("L7 (September header):", this.getCellValue("L7"));
    console.log("AI7 (Oktober header):", this.getCellValue("AI7"));
    console.log("BO7 (November header):", this.getCellValue("BO7"));
    console.log("L9 (Day Sep):", this.getCellValue("L9"));
    console.log("M9 (Day Sep):", this.getCellValue("M9"));
    console.log("N9 (Day Sep):", this.getCellValue("N9"));
    console.log("AI9 (Day Oct):", this.getCellValue("AI9"));
    console.log("BN9 (Day Nov):", this.getCellValue("BN9"));

    // Define document row mapping per package and subdocument
    const documentRowMapping: DocumentRowMapping = {
      // Paket 1
      "1": {
        "1-1": {
          // Sub dokumen Balai
          name: "Balai",
          rows: [10, 11, 12, 13, 14, 15, 16, 17, 18], // L10-CQ10 sampai L18-CQ18 (9 dokumen)
        },
        "1-2": {
          // Sub dokumen Direktorat Irigasi dan Rawa (Subdit Wil. IV)
          name: "Direktorat Irigasi dan Rawa (Subdit Wil. IV)",
          rows: [22, 23, 24, 25, 26, 27, 28], // L22-CQ22 sampai L28-CQ28 (7 dokumen)
        },
        "1-3": {
          // Sub dokumen Kepatuhan Intern
          name: "Kepatuhan Intern",
          rows: [31, 32], // L31-CQ31, L32-CQ32
        },
      },
      // Paket 2
      "2": {
        "2-1": {
          // Sub dokumen Balai
          name: "Balai",
          rows: [36, 37, 38, 39, 40, 41, 42, 43, 44], // L36-CQ36 sampai L44-CQ44 (9 dokumen)
        },
        "2-2": {
          // Sub dokumen Direktorat Irigasi dan Rawa (Subdit Wil. IV)
          name: "Direktorat Irigasi dan Rawa (Subdit Wil. IV)",
          rows: [48, 49, 50, 51, 52, 53, 54], // L48-CQ48 sampai L54-CQ54 (7 dokumen)
        },
        "2-3": {
          // Sub dokumen Kepatuhan Intern
          name: "Kepatuhan Intern",
          rows: [57, 58], // L57-CQ57, L58-CQ58
        },
      },
      // Paket 3
      "3": {
        "3-1": {
          // Sub dokumen Balai
          name: "Balai",
          rows: [62, 63, 64, 65, 66, 67, 68, 69, 70], // L62-CQ62 sampai L70-CQ70 (9 dokumen)
        },
        "3-2": {
          // Sub dokumen Direktorat Irigasi dan Rawa (Subdit Wil. IV)
          name: "Direktorat Irigasi dan Rawa (Subdit Wil. IV)",
          rows: [74, 75, 76, 77, 78, 79, 80], // L74-CQ74 sampai L80-CQ80 (7 dokumen)
        },
        "3-3": {
          // Sub dokumen Kepatuhan Intern
          name: "Kepatuhan Intern",
          rows: [83, 84], // L83-CQ83, L84-CQ84
        },
      },
    };

    // Define month column ranges
    const monthColumns = [
      {
        name: "September 2025",
        startCol: 11, // L
        endCol: 33, // AH
        headerRow: 6, // row 7 (label bulan)
        dateRow: 8, // row 9 (angka tanggal)
        year: 2025,
        month: 9,
      },
      {
        name: "Oktober 2025",
        startCol: 34, // AI
        endCol: 64, // BM
        headerRow: 6,
        dateRow: 8,
        year: 2025,
        month: 10,
      },
      {
        name: "November 2025",
        startCol: 65, // BN
        endCol: 94, // CQ
        headerRow: 6,
        dateRow: 8,
        year: 2025,
        month: 11,
      },
    ];

    // Debug: Test specific example - Paket 1 sesuai spesifikasi
    console.log("=== DEBUG: Testing Paket 1 sesuai spesifikasi lengkap ===");

    // Sub dokumen Balai (Dokumen 1-9: L10-CQ10 sampai L18-CQ18)
    console.log("\n--- Sub dokumen Balai ---");
    for (let docRow = 10; docRow <= 18; docRow++) {
      const docName = this.getCellValue(
        XLSX.utils.encode_cell({ r: docRow - 1, c: 4 })
      ); // E column
      console.log(`Dokumen ${docRow - 9} (Row ${docRow}): "${docName}"`);

      // Scan SEMUA kolom L sampai CQ untuk mencari V mark
      let foundVCount = 0;
      for (let col = 11; col <= 94; col++) {
        // L=11, CQ=94
        const cellRef = XLSX.utils.encode_cell({ r: docRow - 1, c: col });
        const cellValue = this.getCellValue(cellRef);
        if (this.hasCheckMark(cellValue)) {
          foundVCount++;
          const colName = this.getColumnLetter(col);
          const monthHeaderRef = XLSX.utils.encode_cell({ r: 6, c: col });
          const dayRef = XLSX.utils.encode_cell({ r: 8, c: col });
          const monthHeaderVal = this.getCellValue(monthHeaderRef);
          const dayVal = this.getCellValue(dayRef);
          console.log(
            `    ✓ FOUND V at ${colName}${docRow}: "${cellValue}" | MonthHeader: "${monthHeaderVal}" | Day: "${dayVal}"`
          );
        }
      }
      console.log(
        `    Total V marks found for dokumen ${docRow - 9}: ${foundVCount}`
      );
    }

    // Sub dokumen Direktorat Irigasi dan Rawa (Dokumen 1-7: L22-CQ22 sampai L28-CQ28)
    console.log(
      "\n--- Sub dokumen Direktorat Irigasi dan Rawa (Subdit Wil. IV) ---"
    );
    for (let docRow = 22; docRow <= 28; docRow++) {
      const docName = this.getCellValue(
        XLSX.utils.encode_cell({ r: docRow - 1, c: 4 })
      ); // E column
      console.log(`Dokumen ${docRow - 21} (Row ${docRow}): "${docName}"`);

      let foundVCount = 0;
      for (let col = 11; col <= 94; col++) {
        // L=11, CQ=94
        const cellRef = XLSX.utils.encode_cell({ r: docRow - 1, c: col });
        const cellValue = this.getCellValue(cellRef);
        if (this.hasCheckMark(cellValue)) {
          foundVCount++;
          const colName = this.getColumnLetter(col);
          const monthHeaderRef = XLSX.utils.encode_cell({ r: 6, c: col });
          const dayRef = XLSX.utils.encode_cell({ r: 8, c: col });
          const monthHeaderVal = this.getCellValue(monthHeaderRef);
          const dayVal = this.getCellValue(dayRef);
          console.log(
            `    ✓ FOUND V at ${colName}${docRow}: "${cellValue}" | MonthHeader: "${monthHeaderVal}" | Day: "${dayVal}"`
          );
        }
      }
      console.log(
        `    Total V marks found for dokumen ${docRow - 21}: ${foundVCount}`
      );
    }

    // Sub dokumen Kepatuhan Intern (Dokumen 1-2: L31-CQ31 sampai L32-CQ32)
    console.log("\n--- Sub dokumen Kepatuhan Intern ---");
    for (let docRow = 31; docRow <= 32; docRow++) {
      const docName = this.getCellValue(
        XLSX.utils.encode_cell({ r: docRow - 1, c: 4 })
      ); // E column
      console.log(`Dokumen ${docRow - 30} (Row ${docRow}): "${docName}"`);

      let foundVCount = 0;
      for (let col = 11; col <= 94; col++) {
        // L=11, CQ=94
        const cellRef = XLSX.utils.encode_cell({ r: docRow - 1, c: col });
        const cellValue = this.getCellValue(cellRef);
        if (this.hasCheckMark(cellValue)) {
          foundVCount++;
          const colName = this.getColumnLetter(col);
          const monthHeaderRef = XLSX.utils.encode_cell({ r: 6, c: col });
          const dayRef = XLSX.utils.encode_cell({ r: 8, c: col });
          const monthHeaderVal = this.getCellValue(monthHeaderRef);
          const dayVal = this.getCellValue(dayRef);
          console.log(
            `    ✓ FOUND V at ${colName}${docRow}: "${cellValue}" | MonthHeader: "${monthHeaderVal}" | Day: "${dayVal}"`
          );
        }
      }
      console.log(
        `    Total V marks found for dokumen ${docRow - 30}: ${foundVCount}`
      );
    }

    // Scan each package and subdocument using the defined mapping
    Object.keys(documentRowMapping).forEach((packageId: string) => {
      const packageData =
        documentRowMapping[packageId as keyof typeof documentRowMapping];
      Object.keys(packageData).forEach((subDocId: string) => {
        const subDocData = packageData[subDocId as keyof typeof packageData];
        console.log(
          `\n=== Scanning Package ${packageId}, SubDoc ${subDocId} (${subDocData.name}) ===`
        );
        subDocData.rows.forEach((row: number, docIndex: number) => {
          // Get document name from column E
          const docNameRef = XLSX.utils.encode_cell({ r: row - 1, c: 4 }); // Column E = index 4
          const documentName = this.getCellValue(docNameRef);

          console.log(
            `  Checking Row ${row} (Doc ${docIndex + 1}): "${documentName}"`
          );

          // Skip if no document name
          if (!documentName || !documentName.trim()) {
            console.log(`    Skipping - no document name`);
            return;
          }

          // Scan all month columns for this document row (L10-CQ10 range)
          monthColumns.forEach((monthInfo) => {
            console.log(
              `    Scanning ${monthInfo.name} (cols ${monthInfo.startCol}-${monthInfo.endCol})`
            );

            for (let col = monthInfo.startCol; col <= monthInfo.endCol; col++) {
              const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col });
              const cellValue = this.getCellValue(cellRef);

              // Check if cell contains checkmark
              if (this.hasCheckMark(cellValue)) {
                // Ambil angka hari dari baris 9 (dateRow)
                const dayRef = XLSX.utils.encode_cell({
                  r: monthInfo.dateRow,
                  c: col,
                });
                const dayValue = this.getCellValue(dayRef);

                const colName = this.getColumnLetter(col);
                console.log(
                  `    ✓ FOUND V at ${cellRef} (${colName}${row}) value="${cellValue}" dayCell=${colName}${
                    monthInfo.dateRow + 1
                  } dayValue="${dayValue}"`
                );

                if (dayValue && dayValue.trim()) {
                  // Format the date properly
                  let fullDate = this.formatDateString(
                    dayValue,
                    monthInfo.year,
                    monthInfo.month
                  );

                  // Skip if date parsing failed
                  if (!fullDate) {
                    console.warn(`⚠️ Skipping invalid date: ${dayValue}`);
                    continue;
                  }

                  console.log(
                    `    ✅ ADDED to timeline: ${fullDate} - ${documentName}`
                  );

                  timeSchedule.push({
                    tanggal: fullDate,
                    bulan: monthInfo.name,
                    dokumen: documentName,
                    packageId,
                    subDocumentId: subDocId,
                    documentIndex: docIndex,
                    hasCheck: true,
                  });
                } else {
                  console.log(
                    `    ⚠️ Day value kosong di ${colName}${
                      monthInfo.dateRow + 1
                    }`
                  );
                }
              }
            }
          });
        });
      });
    });

    console.log(`\n=== TIMELINE SCAN COMPLETE ===`);
    console.log(`Found ${timeSchedule.length} timeline entries from Excel:`);
    timeSchedule.forEach((entry, idx) => {
      console.log(`${idx + 1}. ${entry.tanggal} - ${entry.dokumen}`);
    });

    return timeSchedule;
  }

  private getDocumentRowIndex(
    packageId: string,
    subDocId: string,
    docIndex: number
  ): number | null {
    // Calculate the actual row index based on package and subdocument
    let baseRow = 0;

    if (packageId === "1") {
      if (subDocId === "1-1") baseRow = 10; // E10:E18
      else if (subDocId === "1-2") baseRow = 22; // E22:E28
      else if (subDocId === "1-3") baseRow = 31; // E31:E32
    } else if (packageId === "2") {
      if (subDocId === "2-1") baseRow = 36; // E36:E44
      else if (subDocId === "2-2") baseRow = 48; // E48:E54
      else if (subDocId === "2-3") baseRow = 57; // E57:E58
    } else if (packageId === "3") {
      if (subDocId === "3-1") baseRow = 62; // E62:E70
      else if (subDocId === "3-2") baseRow = 74; // E74:E80
      else if (subDocId === "3-3") baseRow = 83; // E83:E84
    }

    return baseRow ? baseRow + docIndex : null;
  }

  private extractTimelineForDocument(
    documentName: string,
    packageId: string,
    subDocId: string,
    docIndex: number,
    rowIndex: number,
    monthName: string,
    startColIndex: number,
    endColIndex: number,
    timeSchedule: TimeScheduleData[]
  ): void {
    if (!this.worksheet) return;

    // Get the dates from row 7 (header row)
    const dateRow = 7;

    for (let col = startColIndex; col <= endColIndex; col++) {
      // Check if there's a 'V' mark in this document's row
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex - 1, c: col }); // Convert to 0-based
      const cellValue = this.getCellValue(cellRef);
      const hasCheck =
        cellValue.toLowerCase().includes("v") ||
        cellValue.toLowerCase().includes("✓");

      if (hasCheck) {
        // Get the date from the header row
        const dateRef = XLSX.utils.encode_cell({ r: dateRow - 1, c: col });
        const dateValue = this.getCellValue(dateRef);

        if (dateValue && dateValue.trim()) {
          // Determine year and month from monthName
          const year = monthName.includes("2025") ? "2025" : "2024";
          const monthNum = this.getMonthNumber(monthName);

          // Format the date properly
          let fullDate = this.formatDateString(
            dateValue,
            parseInt(year),
            monthNum
          );

          // Skip if date parsing failed
          if (!fullDate) {
            console.warn(
              `⚠️ Skipping invalid date: ${dateValue} for month ${monthName}`
            );
            continue;
          }

          timeSchedule.push({
            tanggal: fullDate,
            bulan: monthName,
            dokumen: documentName,
            packageId,
            subDocumentId: subDocId,
            documentIndex: docIndex,
            hasCheck: true,
          });
        }
      }
    }
  }

  // Helper method to format date string consistently
  private formatDateString(
    dateValue: string,
    year: number,
    month: number
  ): string | null {
    const trimmedDate = dateValue.trim();

    try {
      // Check if it's already a valid date format
      if (trimmedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const testDate = new Date(trimmedDate);
        if (testDate.getFullYear() >= 1900 && testDate.getFullYear() <= 2100) {
          return trimmedDate;
        }
      }

      // Check for DD/MM/YYYY format
      if (trimmedDate.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const [day, monthPart, yearPart] = trimmedDate.split("/");
        const testDate = new Date(
          parseInt(yearPart),
          parseInt(monthPart) - 1,
          parseInt(day)
        );
        if (testDate.getFullYear() >= 1900 && testDate.getFullYear() <= 2100) {
          return `${yearPart}-${monthPart.padStart(2, "0")}-${day.padStart(
            2,
            "0"
          )}`;
        }
      }

      // Check for DD-MM-YYYY format
      if (trimmedDate.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
        const [day, monthPart, yearPart] = trimmedDate.split("-");
        const testDate = new Date(
          parseInt(yearPart),
          parseInt(monthPart) - 1,
          parseInt(day)
        );
        if (testDate.getFullYear() >= 1900 && testDate.getFullYear() <= 2100) {
          return `${yearPart}-${monthPart.padStart(2, "0")}-${day.padStart(
            2,
            "0"
          )}`;
        }
      }

      // If it's just a day number, construct the full date
      if (/^\d{1,2}$/.test(trimmedDate)) {
        const day = parseInt(trimmedDate);
        if (
          day >= 1 &&
          day <= 31 &&
          year >= 1900 &&
          year <= 2100 &&
          month >= 1 &&
          month <= 12
        ) {
          const testDate = new Date(year, month - 1, day);
          if (testDate.getDate() === day) {
            // Valid day for the month
            return `${year}-${month.toString().padStart(2, "0")}-${day
              .toString()
              .padStart(2, "0")}`;
          }
        }
      }

      // If none of the above formats work, return null
      return null;
    } catch (error) {
      console.warn(`Date parsing error for "${dateValue}":`, error);
      return null;
    }
  }

  // Helper method to get month number from Indonesian month name
  private getMonthNumber(monthName: string): number {
    if (monthName.includes("September")) return 9;
    if (monthName.includes("Oktober")) return 10;
    if (monthName.includes("November")) return 11;
    return 9; // default
  }

  // Enhanced method to get monthly schedule for a specific subdocument
  getMonthlyScheduleForSubDocument(
    packageId: string,
    subDocId: string
  ): MonthlySchedule[] {
    const schedules: MonthlySchedule[] = [];
    const timeData = this.getTimeScheduleData();

    const monthsData = [
      { month: "September 2025", year: 2025, startCol: "L", endCol: "AH" },
      { month: "Oktober 2025", year: 2025, startCol: "AI", endCol: "BM" },
      { month: "November 2025", year: 2025, startCol: "BN", endCol: "CQ" },
    ];

    monthsData.forEach((monthInfo) => {
      const monthSchedule: MonthlySchedule = {
        month: monthInfo.month,
        year: monthInfo.year,
        startColumn: monthInfo.startCol,
        endColumn: monthInfo.endCol,
        dates: {},
      };

      // Filter timeline data for this month and subdocument
      const monthData = timeData.filter(
        (td) =>
          td.bulan === monthInfo.month &&
          td.packageId === packageId &&
          td.subDocumentId === subDocId
      );

      monthData.forEach((data) => {
        monthSchedule.dates[data.tanggal] = data.hasCheck;
      });

      schedules.push(monthSchedule);
    });

    return schedules;
  }

  private hasCheckMark(cellValue: string): boolean {
    if (!cellValue || typeof cellValue !== "string") {
      return false;
    }

    const value = cellValue.trim();
    // Check for V, v, ✓, X, x (case insensitive)
    const hasV =
      value.toLowerCase() === "v" ||
      value === "✓" ||
      value.toLowerCase() === "x";

    // Debug: Log ALL values being checked (not just matches)
    if (value !== "") {
      console.log(`DEBUG: Checking "${cellValue}" -> hasCheck: ${hasV}`);
    }

    return hasV;
  }

  private getPackageInfoForRow(row: number): {
    packageId: string;
    subDocumentId: string;
    documentIndex: number;
  } {
    // Determine package based on row ranges
    let packageId = "1";
    let subDocumentId = "1-1";
    let documentIndex = 0;

    // Package 1: rows 10-32
    if (row >= 10 && row <= 32) {
      packageId = "1";
      if (row >= 10 && row <= 18) {
        subDocumentId = "1-1";
        documentIndex = row - 10; // 0-based index within subdocument
      } else if (row >= 22 && row <= 28) {
        subDocumentId = "1-2";
        documentIndex = row - 22;
      } else if (row >= 31 && row <= 32) {
        subDocumentId = "1-3";
        documentIndex = row - 31;
      }
    }
    // Package 2: rows 36-58
    else if (row >= 36 && row <= 58) {
      packageId = "2";
      if (row >= 36 && row <= 44) {
        subDocumentId = "2-1";
        documentIndex = row - 36;
      } else if (row >= 48 && row <= 54) {
        subDocumentId = "2-2";
        documentIndex = row - 48;
      } else if (row >= 57 && row <= 58) {
        subDocumentId = "2-3";
        documentIndex = row - 57;
      }
    }
    // Package 3: rows 62-84
    else if (row >= 62 && row <= 84) {
      packageId = "3";
      if (row >= 62 && row <= 70) {
        subDocumentId = "3-1";
        documentIndex = row - 62;
      } else if (row >= 74 && row <= 80) {
        subDocumentId = "3-2";
        documentIndex = row - 74;
      } else if (row >= 83 && row <= 84) {
        subDocumentId = "3-3";
        documentIndex = row - 83;
      }
    }

    return { packageId, subDocumentId, documentIndex };
  }

  private determinePackageFromRow(row: number): string {
    if (row >= 10 && row <= 32) return "1";
    if (row >= 36 && row <= 58) return "2";
    if (row >= 62 && row <= 84) return "3";
    return "1";
  }

  private determineSubDocumentFromRow(row: number): string {
    // This is a simplified logic - you might need to make it more sophisticated
    if (row >= 10 && row <= 18) return "1-1";
    if (row >= 22 && row <= 28) return "1-2";
    if (row >= 31 && row <= 32) return "1-3";
    if (row >= 36 && row <= 44) return "2-1";
    if (row >= 48 && row <= 54) return "2-2";
    if (row >= 57 && row <= 58) return "2-3";
    if (row >= 62 && row <= 70) return "3-1";
    if (row >= 74 && row <= 80) return "3-2";
    if (row >= 83 && row <= 84) return "3-3";
    return "1-1";
  }

  getPackageById(packageId: string): Package | null {
    const packages = this.getPackages();
    return packages.find((pkg) => pkg.id === packageId) || null;
  }

  getSubDocumentById(
    packageId: string,
    subDocumentId: string
  ): SubDocument | null {
    const pkg = this.getPackageById(packageId);
    if (!pkg) return null;
    return pkg.subDocuments.find((sub) => sub.id === subDocumentId) || null;
  }

  getAllExcelData(): ExcelData | null {
    if (!this.worksheet) return null;

    const basicInfo = this.getBasicInfo();

    return {
      namaPaket: basicInfo.namaPaket,
      tahunAnggaran: basicInfo.tahunAnggaran,
      packages: this.getPackages(),
      timeSchedule: this.getTimeScheduleData(),
    };
  }
}

// Export singleton instance
export const excelService = new ExcelService();
export default ExcelService;
