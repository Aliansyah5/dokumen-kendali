import * as XLSX from "xlsx";

export interface GoogleSheetCell {
  row: number;
  col: number;
  value: string;
}

export class GoogleSheetsService {
  private sheetId: string;
  private gid: string;
  private data: { [key: string]: string } = {};
  private isLoaded: boolean = false;

  constructor() {
    // Extract dari URL: https://docs.google.com/spreadsheets/d/1yb2RFcSCrq53Zdc-UVEghSiec03Ql-Mr/edit?gid=1949188595#gid=1949188595
    this.sheetId = "1yb2RFcSCrq53Zdc-UVEghSiec03Ql-Mr";
    this.gid = "1949188595";
  }

  async loadGoogleSheet(): Promise<void> {
    try {
      console.log("Loading Google Sheets data...");

      // Use the CSV export URL untuk mendapatkan data
      const csvUrl = `https://docs.google.com/spreadsheets/d/${this.sheetId}/export?format=csv&gid=${this.gid}`;

      console.log("Fetching from URL:", csvUrl);

      const response = await fetch(csvUrl, {
        method: "GET",
        headers: {
          Accept: "text/csv,text/plain,*/*",
        },
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const csvText = await response.text();
      console.log("CSV data loaded, length:", csvText.length);

      if (csvText.length < 100) {
        console.warn("CSV data seems too short, might be access restricted");
        throw new Error("Google Sheets data appears to be restricted or empty");
      }

      // Parse CSV data menggunakan XLSX
      const workbook = XLSX.read(csvText, { type: "string" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Convert ke format yang sama dengan ExcelService
      this.data = {};
      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:CZ100");

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cellObject = worksheet[cellAddress];
          if (cellObject) {
            this.data[cellAddress] = String(cellObject.v || "");
          }
        }
      }

      this.isLoaded = true;
      console.log("✅ Google Sheets data loaded successfully");
      console.log(
        `📊 Loaded ${Object.keys(this.data).length} cells from Google Sheets`
      );

      // Debug: Check beberapa key cells
      console.log("D2 (Nama Paket):", this.getCellValue("D2"));
      console.log("D3 (Tahun Anggaran):", this.getCellValue("D3"));
      console.log("L7 (September header):", this.getCellValue("L7"));
    } catch (error) {
      console.error("❌ Error loading Google Sheets:", error);
      console.log("💡 Tip: Make sure the Google Sheet is publicly accessible");
      console.log("💡 Sheet URL should allow 'Anyone with the link' to view");
      throw new Error(
        `Failed to load Google Sheets: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  getCellValue(cellRef: string): string {
    if (!this.isLoaded) {
      console.warn(`getCellValue(${cellRef}): Google Sheets not loaded yet`);
      return "";
    }

    const value = this.data[cellRef] || "";

    // Debug untuk cells penting
    if (
      value.trim() &&
      [
        "D2",
        "D3",
        "C9",
        "C35",
        "C61",
        "L7",
        "AI7",
        "BO7",
        "L9",
        "M9",
        "N9",
      ].includes(cellRef)
    ) {
      console.log(`GoogleSheets getCellValue(${cellRef}): "${value}"`);
    }

    return value;
  }

  getCellValueAsDate(cellRef: string): string {
    const value = this.getCellValue(cellRef);
    if (!value || value.trim() === "") return "";

    const trimmedValue = value.trim();

    // Add debug logging for date cells (G and H columns are typically dates)
    if (cellRef.match(/^[G-H]\d+$/) && /^\d+(\.\d+)?$/.test(trimmedValue)) {
      console.log(
        `🔍 Processing date serial in cell ${cellRef}: "${trimmedValue}"`
      );
    }

    // Check if it's a number (Excel date serial)
    if (/^\d+(\.\d+)?$/.test(trimmedValue)) {
      const serialDate = parseFloat(trimmedValue);

      // Excel/Google Sheets date serial starts from January 1, 1900
      if (serialDate > 1 && serialDate < 100000) {
        try {
          // Convert Excel serial date to JavaScript Date
          // Excel serial 1 = January 1, 1900
          // Excel has a leap year bug - treats 1900 as leap year (it's not)

          // For dates after February 28, 1900 (serial > 59), subtract 1 day
          // to account for the non-existent Feb 29, 1900
          const baseDate = new Date(1900, 0, 1); // January 1, 1900
          let daysToAdd = serialDate - 1; // Serial 1 = Jan 1, so subtract 1

          if (serialDate > 59) {
            daysToAdd = serialDate - 2; // Account for leap year bug
          }

          const jsDate = new Date(
            baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000
          );

          // Validate the resulting date
          if (
            !isNaN(jsDate.getTime()) &&
            jsDate.getFullYear() >= 1900 &&
            jsDate.getFullYear() <= 2100
          ) {
            const year = jsDate.getFullYear();
            const month = (jsDate.getMonth() + 1).toString().padStart(2, "0");
            const day = jsDate.getDate().toString().padStart(2, "0");

            const result = `${year}-${month}-${day}`;
            console.log(
              `📅 Excel serial ${serialDate} -> ${result} (${jsDate.toLocaleDateString(
                "id-ID"
              )}) [cell: ${cellRef}]`
            );
            return result;
          }
        } catch (error) {
          console.warn(`Error converting date serial ${serialDate}:`, error);
        }
      }
    }

    // Coba parse berbagai format tanggal string
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // D/M/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
      /^\d{1,2}-\d{1,2}-\d{4}$/, // D-M-YYYY
    ];

    for (const pattern of datePatterns) {
      if (pattern.test(trimmedValue)) {
        try {
          // Convert to standard format
          if (trimmedValue.includes("/")) {
            const parts = trimmedValue.split("/");
            if (parts.length === 3) {
              const [day, month, year] = parts;
              const standardDate = `${year}-${month.padStart(
                2,
                "0"
              )}-${day.padStart(2, "0")}`;
              // Validate the date
              const testDate = new Date(standardDate);
              if (
                !isNaN(testDate.getTime()) &&
                testDate.getFullYear() >= 1900 &&
                testDate.getFullYear() <= 2100
              ) {
                return standardDate;
              }
            }
          } else if (trimmedValue.includes("-")) {
            const parts = trimmedValue.split("-");
            if (parts.length === 3 && parts[0].length === 4) {
              // Already in YYYY-MM-DD format
              const testDate = new Date(trimmedValue);
              if (
                !isNaN(testDate.getTime()) &&
                testDate.getFullYear() >= 1900 &&
                testDate.getFullYear() <= 2100
              ) {
                return trimmedValue;
              }
            } else if (parts.length === 3) {
              // DD-MM-YYYY format
              const [day, month, year] = parts;
              const standardDate = `${year}-${month.padStart(
                2,
                "0"
              )}-${day.padStart(2, "0")}`;
              const testDate = new Date(standardDate);
              if (
                !isNaN(testDate.getTime()) &&
                testDate.getFullYear() >= 1900 &&
                testDate.getFullYear() <= 2100
              ) {
                return standardDate;
              }
            }
          }
        } catch (error) {
          console.warn(`Date parsing error for ${trimmedValue}:`, error);
        }
      }
    }

    // If no pattern matches, try to parse as ISO date
    try {
      const testDate = new Date(trimmedValue);
      if (
        !isNaN(testDate.getTime()) &&
        testDate.getFullYear() >= 1900 &&
        testDate.getFullYear() <= 2100
      ) {
        const year = testDate.getFullYear();
        const month = (testDate.getMonth() + 1).toString().padStart(2, "0");
        const day = testDate.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    } catch (error) {
      // Silent fail for non-date values
    }

    // If no parsing works, return empty string for better UX
    console.warn(
      `⚠️ Could not parse date: "${trimmedValue}" (cellRef: ${cellRef})`
    );
    return "";
  }

  isDataLoaded(): boolean {
    return this.isLoaded;
  }

  // Method untuk mendapatkan worksheet-like object yang kompatibel dengan ExcelService
  getWorksheetData(): { [key: string]: { v: string } } {
    const worksheetData: { [key: string]: { v: string } } = {};

    Object.keys(this.data).forEach((cellRef) => {
      worksheetData[cellRef] = { v: this.data[cellRef] };
    });

    return worksheetData;
  }

  // Method untuk testing koneksi
  async testConnection(): Promise<boolean> {
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${this.sheetId}/export?format=csv&gid=${this.gid}`;
      const response = await fetch(csvUrl, { method: "HEAD" });
      return response.ok;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();
export default GoogleSheetsService;
