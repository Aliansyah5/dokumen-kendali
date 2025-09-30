import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Users,
  Calendar,
  BarChart3,
  ChevronRight,
  FolderOpen,
  Clock,
} from "lucide-react";
import { excelService, Package } from "../services/ExcelService";

const PackageView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPackageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadPackageData = async () => {
    try {
      setLoading(true);
      await excelService.loadGoogleSheets();

      if (id) {
        const pkg = excelService.getPackageById(id);
        if (pkg) {
          setPackageData(pkg);
        } else {
          setError("Paket tidak ditemukan");
        }
      }
    } catch (err) {
      console.error("Error loading package data:", err);
      setError("Gagal memuat data paket");
    } finally {
      setLoading(false);
    }
  };

  const handleSubDocumentClick = (subDocId: string) => {
    navigate(`/package/${id}/document/${subDocId}`);
  };

  const getSubDocIcon = (index: number) => {
    const icons = [
      <FileText className="w-6 h-6" />,
      <Users className="w-6 h-6" />,
      <Calendar className="w-6 h-6" />,
    ];
    return icons[index % icons.length];
  };

  const getSubDocGradient = (index: number) => {
    const gradients = [
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600",
      "from-purple-500 to-purple-600",
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-600 font-medium">
              Memuat data paket...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-red-50/80 backdrop-blur-md rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="mr-4 p-2 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-blue-600" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl">
                  <FolderOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold gradient-text">
                    {packageData.name}
                  </h1>
                  <p className="text-blue-600/80 mt-1">
                    Sub Dokumen - Paket {packageData.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Package Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {packageData.totalDocuments}
                </div>
                <div className="text-sm text-blue-600">Total Dokumen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {packageData.completedDocuments}
                </div>
                <div className="text-sm text-green-600">Selesai</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {packageData.progressPercentage}%
                </div>
                <div className="text-sm text-indigo-600">Progress</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Package Overview */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-card border border-blue-100/50 mb-8">
          <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
            Overview Paket
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-blue-800">
                    Sub Dokumen
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {packageData.subDocuments.length}
                  </p>
                </div>
                <FolderOpen className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-green-800">
                    Dokumen Selesai
                  </h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {packageData.completedDocuments}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-purple-800">
                    Progress
                  </h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {packageData.progressPercentage}%
                  </p>
                </div>
                <BarChart3 className="w-12 h-12 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Sub Documents Grid */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-card border border-blue-100/50">
          <h2 className="text-2xl font-bold gradient-text mb-8 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-blue-600" />
            Daftar Sub Dokumen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packageData.subDocuments.map((subDoc, index) => (
              <div
                key={subDoc.id}
                onClick={() => handleSubDocumentClick(subDoc.id)}
                className="group cursor-pointer bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon and Header */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 bg-gradient-to-r ${getSubDocGradient(
                      index
                    )} rounded-lg text-white`}
                  >
                    {getSubDocIcon(index)}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {subDoc.title}
                </h3>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Dokumen:</span>
                    <span className="font-semibold text-gray-800">
                      {subDoc.progress.total}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Selesai:</span>
                    <span className="font-semibold text-green-600">
                      {subDoc.progress.completed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-semibold text-blue-600">
                      {subDoc.progress.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className={`bg-gradient-to-r ${getSubDocGradient(
                      index
                    )} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${subDoc.progress.percentage}%` }}
                  ></div>
                </div>

                {/* Action Button */}
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                    Klik untuk melihat detail →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PackageView;
