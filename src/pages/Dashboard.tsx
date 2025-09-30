import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react";
import ProgressChart from "../components/ProgressChart";
// import DocumentTable from "../components/DocumentTable";
// import TimelineView from "../components/TimelineView";
import { DashboardData, DocumentData, ProgressStats } from "../types";
import { excelService } from "../services/ExcelService";

const Dashboard: React.FC = () => {
  const { department } = useParams<{ department: string }>();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    namaPaket: "",
    sinkronisasi: "",
    dokumen: [],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await excelService.loadGoogleSheets();
        const data = excelService.getAllExcelData();

        if (data) {
          // For now, use the first package's first sub-document as default
          const firstPackage = data.packages[0];
          const convertedDocuments: DocumentData[] = [];

          if (firstPackage) {
            firstPackage.subDocuments.forEach((subDoc) => {
              subDoc.documents.forEach((doc) => {
                convertedDocuments.push({
                  nama: doc.nama,
                  status: doc.status || "Belum Dimulai",
                  tanggalDiterima: doc.tanggalTerima,
                  tanggalSelesai: doc.tanggalSelesai,
                  pic: doc.keterangan || undefined,
                });
              });
            });
          }

          setDashboardData({
            namaPaket: data.namaPaket,
            sinkronisasi: new Date().toLocaleDateString("id-ID"),
            dokumen: convertedDocuments,
          });
        }
      } catch (err) {
        console.error("Error loading Excel data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [department]);

  const getDepartmentTitle = (dept: string) => {
    const titles: Record<string, string> = {
      balai: "Balai",
      "subdir-wilayah-iv":
        "Subdirektorat Wilayah IV - Direktorat Irigasi dan Rawa",
      sekjen: "Sekretariat Jenderal",
      "inspektur-jenderal": "Inspektur Jenderal",
      "menteri-pu": "Menteri PU",
    };
    return titles[dept] || "Dashboard";
  };

  const calculateProgress = (dokumen: DocumentData[]): ProgressStats => {
    const total = dokumen.length;
    const selesai = dokumen.filter((doc) => doc.status === "Selesai").length;
    const dalamProses = dokumen.filter(
      (doc) => doc.status === "Dalam Proses"
    ).length;
    const belumDimulai = dokumen.filter(
      (doc) => doc.status === "Belum Dimulai"
    ).length;
    const persentase = total > 0 ? Math.round((selesai / total) * 100) : 0;

    return {
      total,
      selesai,
      dalamProses,
      belumDimulai,
      persentase,
    };
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await excelService.loadGoogleSheets();
      const data = excelService.getAllExcelData();

      if (data) {
        const firstPackage = data.packages[0];
        const convertedDocuments: DocumentData[] = [];

        if (firstPackage) {
          firstPackage.subDocuments.forEach((subDoc) => {
            subDoc.documents.forEach((doc) => {
              convertedDocuments.push({
                nama: doc.nama,
                status: doc.status || "Belum Dimulai",
                tanggalDiterima: doc.tanggalTerima,
                tanggalSelesai: doc.tanggalSelesai,
                pic: doc.keterangan || undefined,
              });
            });
          });
        }

        setDashboardData({
          namaPaket: data.namaPaket,
          sinkronisasi: new Date().toLocaleDateString("id-ID"),
          dokumen: convertedDocuments,
        });
      }
    } catch (err) {
      console.error("Error refreshing Excel data:", err);
    } finally {
      setLoading(false);
    }
  };

  const progressStats = calculateProgress(dashboardData.dokumen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate("/")}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors group"
              >
                <div className="p-2 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors mr-3">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="font-medium">Kembali</span>
              </button>
              <div className="border-l border-blue-200 pl-6">
                <h1 className="text-2xl font-bold gradient-text">
                  {getDepartmentTitle(department || "")}
                </h1>
                <p className="text-blue-600/70 text-sm mt-1">
                  Dashboard Monitoring Progress Dokumen
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="btn-secondary flex items-center"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-3d p-6 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-3d">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">
                  Total Dokumen
                </p>
                <p className="text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {progressStats.total}
                </p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="text-xs text-blue-600 font-medium">
                Semua dokumen aktif
              </p>
            </div>
          </div>

          <div className="card-3d p-6 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-3d">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Selesai</p>
                <p className="text-3xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
                  {progressStats.selesai}
                </p>
              </div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-2">
              <p className="text-xs text-emerald-600 font-medium">
                {progressStats.persentase}% completed
              </p>
            </div>
          </div>

          <div className="card-3d p-6 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-3d">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">
                  Dalam Proses
                </p>
                <p className="text-3xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors">
                  {progressStats.dalamProses}
                </p>
              </div>
            </div>
            <div className="bg-amber-50 rounded-lg p-2">
              <p className="text-xs text-amber-600 font-medium">
                Sedang dikerjakan
              </p>
            </div>
          </div>

          <div className="card-3d p-6 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-3d">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">
                  Belum Dimulai
                </p>
                <p className="text-3xl font-bold text-gray-800 group-hover:text-red-600 transition-colors">
                  {progressStats.belumDimulai}
                </p>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-2">
              <p className="text-xs text-red-600 font-medium">Menunggu aksi</p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Enhanced Progress Chart Section */}
          <div className="lg:col-span-1">
            <div className="card-3d p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Progress Overview
                </h3>
                <div className="px-3 py-1 bg-blue-100 rounded-full">
                  <span className="text-xs font-medium text-blue-600">
                    Live
                  </span>
                </div>
              </div>
              <ProgressChart stats={progressStats} />

              {/* Additional Progress Insights */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                  Insights
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completion Rate:</span>
                    <span className="font-semibold text-blue-600">
                      {progressStats.persentase}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Documents:</span>
                    <span className="font-semibold text-amber-600">
                      {progressStats.dalamProses}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Start:</span>
                    <span className="font-semibold text-red-600">
                      {progressStats.belumDimulai}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Table Section */}
          <div className="lg:col-span-2">
            <div className="card-3d p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Detail Dokumen
                </h3>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {dashboardData.dokumen.length} entries
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                <p>Document table view will be implemented here</p>
                <p className="text-sm mt-1">
                  {dashboardData.dokumen.length} documents available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="card-3d p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Timeline Progress
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 font-medium">
                Real-time updates
              </span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
            <p>Timeline view will be implemented here</p>
            <p className="text-sm mt-1">
              Document timeline and progress tracking
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
