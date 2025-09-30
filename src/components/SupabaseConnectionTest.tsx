import React, { useEffect, useState } from "react";
import supabaseDatabaseService from "../services/SupabaseDatabaseService";

const SupabaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<
    "testing" | "connected" | "failed"
  >("testing");

  useEffect(() => {
    const testConnection = async () => {
      try {
        const isConnected = await supabaseDatabaseService.testConnection();
        setConnectionStatus(isConnected ? "connected" : "failed");
      } catch (error) {
        console.error("Connection test failed:", error);
        setConnectionStatus("failed");
      }
    };

    testConnection();
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "testing":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "connected":
        return "text-green-600 bg-green-50 border-green-200";
      case "failed":
        return "text-red-600 bg-red-50 border-red-200";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "testing":
        return "🔄 Testing Supabase connection...";
      case "connected":
        return "✅ Supabase connected successfully";
      case "failed":
        return "❌ Supabase connection failed";
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border text-sm font-medium ${getStatusColor()}`}
    >
      {getStatusText()}
    </div>
  );
};

export default SupabaseConnectionTest;
