import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { excelService, Package, SubDocument } from "../services/ExcelService";
import DocumentTable from "../components/DocumentTable";
import ProgressChart from "../components/ProgressChart";
import TimelineView from "../components/TimelineView";
import SupabaseConnectionTest from "../components/SupabaseConnectionTest";

const DocumentDetail: React.FC = () => {
  const { id, docId } = useParams<{ id: string; docId: string }>();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [subDocumentData, setSubDocumentData] = useState<SubDocument | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timelineData, setTimelineData] = useState<any[]>([]);

  useEffect(() => {
    loadDocumentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, docId]);

  const loadDocumentData = async () => {
    try {
      setLoading(true);
      await excelService.loadGoogleSheets();

      if (id && docId) {
        const pkg = excelService.getPackageById(id);
        const subDoc = excelService.getSubDocumentById(id, docId);

        if (pkg && subDoc) {
          setPackageData(pkg);
          setSubDocumentData(subDoc);

          // Load timeline data for this subdocument
          const scheduleData = excelService.getTimeScheduleData();
          console.log("All timeline data:", scheduleData);

          const filteredSchedule = scheduleData.filter(
            (schedule) =>
              schedule.packageId === id && schedule.subDocumentId === docId
          );
          console.log("Filtered timeline data:", filteredSchedule);

          // Add test data if no data found
          if (filteredSchedule.length === 0) {
            console.log(
              "No timeline data found for this document, adding test data"
            );
            const testSchedule = [
              {
                tanggal: "2025-09-11",
                bulan: "September 2025",
                dokumen:
                  "Test - Surat Permohonan Persetujuan Izin Kontrak Tahun Jamak (MYC)",
                packageId: id,
                subDocumentId: docId,
                documentIndex: 0,
                hasCheck: true,
              },
            ];
            setTimelineData(testSchedule);
          } else {
            setTimelineData(filteredSchedule);
          }
        } else {
          setError("Data tidak ditemukan");
        }
      }
    } catch (err) {
      console.error("Error loading document data:", err);
      setError("Gagal memuat data dokumen");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStats = () => {
    if (!subDocumentData) return { selesai: 0, proses: 0, belum: 0 };

    return {
      selesai: subDocumentData.progress.completed,
      proses: subDocumentData.progress.inProgress,
      belum:
        subDocumentData.progress.total -
        subDocumentData.progress.completed -
        subDocumentData.progress.inProgress,
    };
  };

  const getFilteredDocuments = () => {
    if (!subDocumentData) return [];

    let filtered = subDocumentData.documents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.keterangan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.tindakLanjut?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((doc) => {
        const status = doc.status || "Belum Dimulai";
        return status === statusFilter;
      });
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-600 font-medium">
              Memuat data dokumen...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !packageData || !subDocumentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-red-50/80 backdrop-blur-md rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate(`/package/${id}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Kembali ke Paket
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Beranda
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/package/${id}`)}
                className="mr-4 p-2 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-blue-600" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold gradient-text">
                    {subDocumentData.title}
                  </h1>
                  <p className="text-blue-600/80 mt-1">
                    {packageData.name} • Paket {packageData.id}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={loadDocumentData}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </button>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-700">
                  {subDocumentData.progress.percentage}%
                </div>
                <div className="text-base text-blue-600 font-medium">
                  Progress
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Enhanced Stats Cards with Animation */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-xl shadow-md">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-blue-700">
                    Total Dokumen
                  </p>
                  <p className="text-3xl font-bold text-blue-800">
                    {subDocumentData.progress.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-xl shadow-md">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-green-700">
                    Selesai
                  </p>
                  <p className="text-3xl font-bold text-green-800">
                    {stats.selesai}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 shadow-lg border border-yellow-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-500 rounded-xl shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-yellow-700">
                    Dalam Proses
                  </p>
                  <p className="text-3xl font-bold text-yellow-800">
                    {stats.proses}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-xl shadow-md">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-purple-700">
                    Progress
                  </p>
                  <p className="text-3xl font-bold text-purple-800">
                    {subDocumentData.progress.percentage}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Progress Chart - Larger */}
            <div className="xl:col-span-2 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                  Progress Overview
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 bg-blue-50 rounded-full">
                    <span className="text-sm font-semibold text-blue-600">
                      {subDocumentData.progress.percentage}% Complete
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-30 w-full flex items-center justify-center">
                <div className="w-full h-full relative">
                  <ProgressChart
                    stats={{
                      total: subDocumentData.progress.total,
                      selesai: stats.selesai,
                      dalamProses: stats.proses,
                      belumDimulai: stats.belum,
                      persentase: subDocumentData.progress.percentage,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Status Distribution - Enhanced */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <PieChart className="w-6 h-6 mr-3 text-blue-600" />
                  Status Distribution
                </h3>
              </div>

              <div className="space-y-6">
                {[
                  {
                    label: "Selesai",
                    value: stats.selesai,
                    color: "bg-green-500",
                    bgColor: "bg-green-50",
                    textColor: "text-green-800",
                    total: subDocumentData.progress.total,
                  },
                  {
                    label: "Dalam Proses",
                    value: stats.proses,
                    color: "bg-yellow-500",
                    bgColor: "bg-yellow-50",
                    textColor: "text-yellow-800",
                    total: subDocumentData.progress.total,
                  },
                  {
                    label: "Belum Dimulai",
                    value: stats.belum,
                    color: "bg-gray-500",
                    bgColor: "bg-gray-50",
                    textColor: "text-gray-800",
                    total: subDocumentData.progress.total,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`p-4 rounded-lg ${item.bgColor} hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div
                          className={`w-4 h-4 rounded-full ${item.color} mr-3`}
                        ></div>
                        <span
                          className={`text-sm font-semibold ${item.textColor}`}
                        >
                          {item.label}
                        </span>
                      </div>
                      <span className={`text-lg font-bold ${item.textColor}`}>
                        {item.value}
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-3 shadow-inner">
                      <div
                        className={`h-3 rounded-full ${item.color} transition-all duration-500 ease-out`}
                        style={{
                          width: `${
                            item.total > 0 ? (item.value / item.total) * 100 : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-600">
                        {item.total > 0
                          ? Math.round((item.value / item.total) * 100)
                          : 0}
                        % dari total
                      </span>
                      <span className="text-xs font-medium text-gray-700">
                        {item.value} dokumen
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Documents Section with Search */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header with Search */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center mb-4 lg:mb-0">
                  <FileText className="w-6 h-6 text-white mr-3" />
                  <h3 className="text-xl font-bold text-white">
                    Daftar Dokumen - {subDocumentData.title}
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Cari dokumen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full sm:w-64 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 appearance-none cursor-pointer transition-all"
                    >
                      <option value="all" className="text-gray-800">
                        Semua Status
                      </option>
                      <option value="Selesai" className="text-gray-800">
                        Selesai
                      </option>
                      <option value="Dalam Proses" className="text-gray-800">
                        Dalam Proses
                      </option>
                      <option value="Belum Dimulai" className="text-gray-800">
                        Belum Dimulai
                      </option>
                    </select>
                  </div>

                  {/* Export Button */}
                  <button className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-all duration-200 backdrop-blur-sm">
                    <Download className="w-5 h-5 mr-2" />
                    Export
                  </button>
                </div>
              </div>

              {/* Search Results Info */}
              {(searchTerm || statusFilter !== "all") && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-white/90 text-sm">
                    Menampilkan {getFilteredDocuments().length} dari{" "}
                    {subDocumentData.documents.length} dokumen
                    {searchTerm && ` untuk "${searchTerm}"`}
                    {statusFilter !== "all" &&
                      ` dengan status "${statusFilter}"`}
                  </p>
                </div>
              )}
            </div>

            {/* Supabase Connection Status */}
            <div className="mb-6">
              <SupabaseConnectionTest />
            </div>

            {/* Enhanced Document Table */}
            <DocumentTable
              documents={getFilteredDocuments()}
              title=""
              showSearch={false}
              packageId={id}
              subDocumentId={docId}
              subDocumentTitle={subDocumentData.title}
              onLinkUpdate={loadDocumentData}
            />
          </div>

          {/* Enhanced Timeline View */}
          <TimelineView
            documents={subDocumentData.documents}
            timeScheduleData={timelineData}
            subDocumentTitle={subDocumentData.title}
            packageId={id}
            subDocumentId={docId}
          />
        </div>
      </main>
    </div>
  );
};

export default DocumentDetail;
