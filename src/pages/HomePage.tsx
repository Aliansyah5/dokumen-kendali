import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building,
  Waves,
  FileText,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Calendar,
  FolderOpen,
} from "lucide-react";
import { excelService, ExcelData } from "../services/ExcelService";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExcelData();
  }, []);

  // Debug: Log the loaded data
  useEffect(() => {
    if (excelData) {
      console.log("HomePage - Excel Data Loaded:", excelData);
      console.log("HomePage - Packages:", excelData.packages);
    }
  }, [excelData]);

  const loadExcelData = async () => {
    try {
      setLoading(true);
      // Load Excel file from public folder
      await excelService.loadGoogleSheets();
      const data = excelService.getAllExcelData();
      setExcelData(data);
    } catch (err) {
      console.error("Error loading Excel data:", err);
      setError("Gagal memuat data Excel");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (packageId: string) => {
    navigate(`/package/${packageId}`);
  };

  const getPackageIcon = (index: number) => {
    const icons = [
      <Building className="w-8 h-8" />,
      <Waves className="w-8 h-8" />,
      <FileText className="w-8 h-8" />,
    ];
    return icons[index] || <Building className="w-8 h-8" />;
  };

  const getPackageGradient = (index: number) => {
    const gradients = ["gradient-blue", "gradient-cyan", "gradient-indigo"];
    return gradients[index] || "gradient-blue";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header with floating elements */}
      <header className="relative bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-3d animate-pulse-glow">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text text-shadow">
                  Dashboard Monitoring
                </h1>
                <p className="text-blue-600/80 mt-2 text-lg">
                  Sistem Monitoring Progress Dokumen
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-blue-600/70 font-medium">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <div className="flex items-center mt-1 text-xs text-blue-500/60">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  System Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Excel Data Section */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-card border border-blue-100/50 mb-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-600 font-medium">
                Memuat data Excel...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50/80 backdrop-blur-md rounded-2xl p-8 shadow-card border border-red-100/50 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <div>
                <h3 className="font-semibold text-red-800">
                  Error Loading Data
                </h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          excelData && (
            <>
              {/* Debug Section - Remove this after verification */}
              {/* <div className="bg-yellow-50/80 backdrop-blur-md rounded-2xl p-6 shadow-card border border-yellow-100/50 mb-8">
                <h3 className="text-lg font-bold text-yellow-800 mb-4">
                  Debug Info (hapus setelah verifikasi)
                </h3>
                <div className="text-sm text-yellow-700 space-y-2">
                  <div>
                    <strong>Status:</strong>{" "}
                    {excelData ? "Data loaded successfully" : "No data"}
                  </div>
                  <div>
                    <strong>Nama Paket:</strong>{" "}
                    {excelData.namaPaket || "Tidak ditemukan"}
                  </div>
                  <div>
                    <strong>Tahun Anggaran:</strong>{" "}
                    {excelData.tahunAnggaran || "Tidak ditemukan"}
                  </div>
                  <div>
                    <strong>Jumlah Paket:</strong> {excelData.packages.length}
                  </div>
                  {excelData.packages.length === 0 && (
                    <div className="text-red-600 font-semibold">
                      ⚠️ No packages found! Check console for errors.
                    </div>
                  )}
                  {excelData.packages.map((pkg, index) => (
                    <div
                      key={pkg.id}
                      className="ml-4 border-l-2 border-yellow-300 pl-3"
                    >
                      <strong>Paket {pkg.id}:</strong> "{pkg.name}"
                      <span className="text-gray-600">
                        {" "}
                        ({pkg.subDocuments.length} sub docs,{" "}
                        {pkg.totalDocuments} total docs)
                      </span>
                      {pkg.subDocuments.map((subDoc, subIndex) => (
                        <div
                          key={subDoc.id}
                          className="ml-4 text-xs text-gray-600"
                        >
                          - Sub Doc {subIndex + 1}: "{subDoc.title}" →{" "}
                          {subDoc.documents.length} documents
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div> */}

              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-card border border-blue-100/50 mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Project Info */}
                  <div>
                    <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center">
                      <FolderOpen className="w-6 h-6 mr-3 text-blue-600" />
                      Informasi Paket
                    </h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <label className="text-sm font-semibold text-blue-700 block mb-2">
                          Nama Paket
                        </label>
                        <p className="text-lg font-bold text-gray-800">
                          {excelData.namaPaket || "Tidak tersedia"}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
                        <label className="text-sm font-semibold text-cyan-700 block mb-2">
                          Tahun Anggaran (T.A)
                        </label>
                        <p className="text-lg font-bold text-gray-800">
                          {excelData.tahunAnggaran || "Tidak tersedia"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats from Excel */}
                  <div>
                    <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center">
                      <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                      Statistik Data
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-3d">
                        <div className="text-2xl font-bold text-blue-700 mb-1">
                          {excelData.packages.reduce(
                            (total, pkg) => total + pkg.totalDocuments,
                            0
                          )}
                        </div>
                        <div className="text-xs font-medium text-blue-600">
                          Dokumen Tersedia
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl shadow-3d">
                        <div className="text-2xl font-bold text-indigo-700 mb-1">
                          {excelData.timeSchedule.length}
                        </div>
                        <div className="text-xs font-medium text-indigo-600">
                          Time Schedule
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl shadow-3d">
                        <div className="text-2xl font-bold text-cyan-700 mb-1">
                          {excelData.packages.length}
                        </div>
                        <div className="text-xs font-medium text-cyan-600">
                          Paket Tersedia
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-3d">
                        <div className="text-2xl font-bold text-purple-700 mb-1">
                          {excelData.packages.reduce(
                            (total, pkg) => total + pkg.subDocuments.length,
                            0
                          )}
                        </div>
                        <div className="text-xs font-medium text-purple-600">
                          Sub Dokumen
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )
        )}
        {/* Introduction Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-blue-100/50 rounded-2xl mb-6">
            <div className="animate-float">
              <BarChart3 className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Pilih Departemen untuk Monitoring
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
            Akses dashboard monitoring progress dokumen untuk setiap departemen.
            Lihat statistik real-time, progress charts, dan detail dokumen
            dengan mudah.
          </p>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {excelData &&
            excelData.packages.map((pkg, index) => (
              <div
                key={pkg.id}
                onClick={() => handleMenuClick(pkg.id)}
                className="card-3d group cursor-pointer p-8 hover:scale-105 transition-all duration-300"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* 3D Icon */}
                <div
                  className={`icon-3d ${getPackageGradient(
                    index
                  )} w-20 h-20 mb-6 mx-auto animate-float`}
                >
                  {getPackageIcon(index)}
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                    {pkg.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {pkg.subDocuments.length} Sub Dokumen • {pkg.totalDocuments}{" "}
                    Total Dokumen
                  </p>

                  {/* Mini Chart/Stats */}
                  <div className="bg-blue-50/50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-blue-600">
                        Progress Overview
                      </span>
                      <span className="text-lg font-bold text-blue-700">
                        {pkg.progressPercentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-blue-100 rounded-full h-2 mb-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pkg.progressPercentage}%` }}
                      ></div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-gray-700">
                          {pkg.totalDocuments}
                        </div>
                        <div className="text-gray-500">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-600">
                          {pkg.completedDocuments}
                        </div>
                        <div className="text-gray-500">Selesai</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-amber-600">
                          {pkg.totalDocuments - pkg.completedDocuments}
                        </div>
                        <div className="text-gray-500">Progress</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-3 text-center text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform group-hover:scale-105">
                    <div className="flex items-center justify-center">
                      <span>Lihat Sub Dokumen</span>
                      <svg
                        className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Summary Stats */}
        {/* <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-card border border-blue-100/50">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Ringkasan Keseluruhan
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">186</div>
              <div className="text-gray-600 text-sm">Total Dokumen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">137</div>
              <div className="text-gray-600 text-sm">Dokumen Selesai</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">32</div>
              <div className="text-gray-600 text-sm">Dalam Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">74%</div>
              <div className="text-gray-600 text-sm">Completion Rate</div>
            </div>
          </div>
        </div> */}
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-md border-t border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-2">
              © 2025 Dashboard Monitoring System. All rights reserved.
            </p>
            <p className="text-blue-600 text-sm font-medium">
              Kementerian Pekerjaan Umum dan Perumahan Rakyat
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
