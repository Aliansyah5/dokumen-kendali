import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Calendar,
  FileText,
  User,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { DocumentItem } from "../services/ExcelService";
import supabaseDatabaseService, {
  DocumentLink,
} from "../services/SupabaseDatabaseService";

interface DocumentTableProps {
  documents: DocumentItem[];
  title?: string;
  showSearch?: boolean;
  packageId?: string;
  onLinkUpdate?: () => void;
}

const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  title = "Daftar Dokumen",
  showSearch = true,
  packageId = "",
  onLinkUpdate,
}) => {
  const [documentLinks, setDocumentLinks] = useState<{
    [key: string]: DocumentLink;
  }>({});
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<{
    index: number;
    name: string;
  } | null>(null);
  const [linkInput, setLinkInput] = useState<string>("");

  // Load document links on component mount
  useEffect(() => {
    const loadDocumentLinks = async () => {
      try {
        const links = await supabaseDatabaseService.getDocumentLinks(packageId);
        const linksMap: { [key: string]: DocumentLink } = {};
        links.forEach((link) => {
          const key = `${link.packageId}-${link.documentId}`;
          linksMap[key] = link;
        });
        setDocumentLinks(linksMap);
      } catch (error) {
        console.error("Error loading document links:", error);
      }
    };

    if (packageId) {
      loadDocumentLinks();
    }
  }, [packageId]);

  const loadDocumentLinks = async () => {
    try {
      const links = await supabaseDatabaseService.getDocumentLinks(packageId);
      const linksMap: { [key: string]: DocumentLink } = {};
      links.forEach((link) => {
        const key = `${link.packageId}-${link.documentId}`;
        linksMap[key] = link;
      });
      setDocumentLinks(linksMap);
    } catch (error) {
      console.error("Error loading document links:", error);
    }
  };

  // Helper function to create local date from date string (timezone-safe)
  const createLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split("-").map(Number);
    // Create date at noon local time to avoid timezone edge cases
    return new Date(year, month - 1, day, 12, 0, 0, 0); // month is 0-indexed, set to noon
  };

  const handleEditLink = (
    documentIndex: number,
    documentName: string,
    currentLink: string = ""
  ) => {
    setEditingDocument({ index: documentIndex, name: documentName });
    setLinkInput(currentLink);
    setShowLinkModal(true);
  };

  const handleSaveLink = async () => {
    if (!editingDocument) return;

    try {
      if (linkInput.trim()) {
        await supabaseDatabaseService.addDocumentLink({
          packageId,
          documentId: editingDocument.index.toString(),
          documentName: editingDocument.name,
          linkUrl: linkInput.trim(),
        });
      } else {
        // If link is empty, delete existing link
        const linkKey = `${packageId}-${editingDocument.index}`;
        const existingLink = documentLinks[linkKey];
        if (existingLink && existingLink.id) {
          await supabaseDatabaseService.deleteDocumentLink(existingLink.id);
        }
      }

      await loadDocumentLinks();
      setShowLinkModal(false);
      setEditingDocument(null);
      setLinkInput("");

      if (onLinkUpdate) {
        onLinkUpdate();
      }
    } catch (error) {
      console.error("Error saving document link:", error);
    }
  };

  const handleCancelEdit = () => {
    setShowLinkModal(false);
    setEditingDocument(null);
    setLinkInput("");
  };

  const getDocumentLink = (documentIndex: number): string => {
    const linkKey = `${packageId}-${documentIndex}`;
    return documentLinks[linkKey]?.linkUrl || "";
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Selesai":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "Dalam Proses":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "Selesai":
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case "Dalam Proses":
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600 border border-gray-200`;
    }
  };

  const isValidHttpUrl = (string: string) => {
    if (!string) return false;
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const renderLinkOrText = (
    linkText: string,
    documentIndex: number,
    documentName: string
  ) => {
    const savedLink = getDocumentLink(documentIndex);
    const effectiveLink = savedLink || linkText; // Use saved link or fallback to original

    if (!effectiveLink) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-xs italic">No link</span>
          <button
            onClick={() => handleEditLink(documentIndex, documentName)}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
            title="Add Link"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (isValidHttpUrl(effectiveLink)) {
      return (
        <div className="flex items-center space-x-2">
          <a
            href={effectiveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:bg-blue-50 px-2 py-1 rounded-md bg-blue-50 border border-blue-200"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            <span className="text-xs font-medium">See Attachment</span>
          </a>
          <button
            onClick={() =>
              handleEditLink(documentIndex, documentName, effectiveLink)
            }
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
            title="Edit Link"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 text-xs bg-gray-50 px-2 py-1 rounded border font-mono max-w-xs truncate">
            {effectiveLink.length > 30
              ? `${effectiveLink.substring(0, 30)}...`
              : effectiveLink}
          </span>
          <button
            onClick={() =>
              handleEditLink(documentIndex, documentName, effectiveLink)
            }
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
            title="Edit Link"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        </div>
      );
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === "-" || dateString.trim() === "")
      return "-";

    const trimmedDate = dateString.trim();

    try {
      // ✅ Handle Excel serial date (number or numeric string)
      if (/^\d+(\.\d+)?$/.test(trimmedDate)) {
        const serialDate = parseFloat(trimmedDate);

        if (serialDate > 1 && serialDate < 100000) {
          const excelEpoch = new Date(Date.UTC(1900, 0, 1));
          let days = Math.floor(serialDate) - 1;
          if (serialDate > 59) days -= 1;

          let millis = excelEpoch.getTime() + days * 86400000;

          const fraction = serialDate - Math.floor(serialDate);
          if (fraction > 0) {
            millis += fraction * 86400000;
          }

          const date = new Date(millis);

          const day = String(date.getUTCDate()).padStart(2, "0");
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const month = monthNames[date.getUTCMonth()];
          const year = String(date.getUTCFullYear()).slice(-2);

          return `${day}-${month}-${year}`;
        }
      }

      // ✅ YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
        const [y, m, d] = trimmedDate.split("-");
        const date = new Date(Date.UTC(+y, +m - 1, +d));
        const day = String(date.getUTCDate()).padStart(2, "0");
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const month = monthNames[date.getUTCMonth()];
        const year = String(date.getUTCFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
      }

      // ✅ DD/MM/YYYY
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmedDate)) {
        const [d, m, y] = trimmedDate.split("/");
        return formatDate(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
      }

      // ✅ DD-MM-YYYY
      if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(trimmedDate)) {
        const [d, m, y] = trimmedDate.split("-");
        return formatDate(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
      }

      // ✅ Already in DD-MMM-YY
      if (/^\d{1,2}-[A-Za-z]{3}-\d{2}$/.test(trimmedDate)) {
        return trimmedDate;
      }

      // Fallback
      const parsed = new Date(trimmedDate);
      if (!isNaN(parsed.getTime())) {
        const day = String(parsed.getUTCDate()).padStart(2, "0");
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const month = monthNames[parsed.getUTCMonth()];
        const year = String(parsed.getUTCFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
      }

      return "-";
    } catch (err) {
      console.warn("❌ Date formatting error:", err, "for:", dateString);
      return "-";
    }
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">{title}</h3>
          <p className="text-gray-500">Tidak ada dokumen yang ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      {showSearch && title && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              {title}
            </h3>
            <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full font-semibold">
              {documents.length} dokumen
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                No
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Nama Dokumen
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Checklist
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Tanggal Terima
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Tanggal Selesai
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Tindak Lanjut
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Keterangan
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Link
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((doc, index) => (
              <tr
                key={index}
                className="hover:bg-blue-50 transition-all duration-200 group"
              >
                {/* No */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full text-blue-700 font-bold text-sm shadow-sm group-hover:from-blue-200 group-hover:to-blue-300 transition-all">
                    {index + 1}
                  </div>
                </td>

                {/* Nama Dokumen */}
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-start">
                    <FileText className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="font-semibold line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {doc.nama}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(doc.status || "Belum Dimulai")}
                    <span
                      className={`ml-2 ${getStatusBadge(
                        doc.status || "Belum Dimulai"
                      )}`}
                    >
                      {doc.status || "Belum Dimulai"}
                    </span>
                  </div>
                </td>

                {/* Checklist */}
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="bg-gray-100 px-3 py-1 rounded-md text-xs font-mono font-semibold border">
                    {doc.checklist || "-"}
                  </span>
                </td>

                {/* Tanggal Terima */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-blue-400" />
                    <span className="font-medium">
                      {formatDate(doc.tanggalTerima)}
                    </span>
                  </div>
                </td>

                {/* Tanggal Selesai */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-green-400" />
                    <span className="font-medium">
                      {formatDate(doc.tanggalSelesai)}
                    </span>
                  </div>
                </td>

                {/* Tindak Lanjut */}
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex items-start">
                    <User className="w-4 h-4 text-purple-400 mr-1 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2 font-medium">
                      {doc.tindakLanjut || "-"}
                    </span>
                  </div>
                </td>

                {/* Keterangan */}
                <td className="px-6 py-4 text-sm text-gray-500">
                  <span className="line-clamp-2 font-medium">
                    {doc.keterangan || "-"}
                  </span>
                </td>

                {/* Link */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {renderLinkOrText(
                    doc.linkUpload || "",
                    index,
                    doc.nama || `Document ${index + 1}`
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Footer Stats */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <span className="flex items-center bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">
                Selesai:{" "}
                {documents.filter((doc) => doc.status === "Selesai").length}
              </span>
            </span>
            <span className="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
              <Clock className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="font-semibold text-yellow-800">
                Proses:{" "}
                {
                  documents.filter((doc) => doc.status === "Dalam Proses")
                    .length
                }
              </span>
            </span>
            <span className="flex items-center bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
              <XCircle className="w-4 h-4 text-gray-500 mr-2" />
              <span className="font-semibold text-gray-700">
                Belum:{" "}
                {
                  documents.filter(
                    (doc) => doc.status === "Belum Dimulai" || !doc.status
                  ).length
                }
              </span>
            </span>
          </div>
          <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <span className="font-bold text-blue-800">
              Total: {documents.length} dokumen
            </span>
          </div>
        </div>
      </div>

      {/* Link Edit Modal */}
      {showLinkModal && editingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Edit Link Attachment
              </h3>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Dokumen:</p>
              <p className="font-semibold text-gray-800">
                {editingDocument.name}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link URL
              </label>
              <input
                type="text"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://example.com/document"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSaveLink();
                  } else if (e.key === "Escape") {
                    handleCancelEdit();
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Masukkan URL lengkap untuk attachment dokumen
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveLink}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTable;
