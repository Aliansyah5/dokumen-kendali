import React, { useMemo, useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Circle,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DocumentItem, TimeScheduleData } from "../services/ExcelService";
import databaseService, { TimelineSchedule } from "../services/DatabaseService";

interface TimelineViewProps {
  documents: DocumentItem[];
  timeScheduleData?: TimeScheduleData[];
  subDocumentTitle?: string;
  packageId?: string;
  subDocumentId?: string;
}

interface TimelineEvent {
  date: string;
  day: number;
  month: string;
  year: number;
  events: {
    type: "received" | "completed" | "scheduled" | "in-progress";
    title: string;
    document: string;
    status?: string;
  }[];
}

const TimelineView: React.FC<TimelineViewProps> = ({
  documents,
  timeScheduleData = [],
  subDocumentTitle = "Dokumen",
  packageId = "",
  subDocumentId = "",
}) => {
  const [timelineSchedules, setTimelineSchedules] = useState<
    TimelineSchedule[]
  >([]);
  const [showCalendarScheduler, setShowCalendarScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    for (let i = 0; i < 42; i++) {
      // 6 weeks * 7 days
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatDateKey = (date: Date): string => {
    // Use local timezone to avoid date shifts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to create local date from date string
  const createLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in JavaScript
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return formatDateKey(date) === formatDateKey(today);
  };

  const isSameMonth = (date: Date, month: Date): boolean => {
    return (
      date.getMonth() === month.getMonth() &&
      date.getFullYear() === month.getFullYear()
    );
  };

  const getScheduledDocsForDate = (date: Date): TimelineSchedule[] => {
    const dateKey = formatDateKey(date);
    return timelineSchedules.filter(
      (schedule) => schedule.scheduledDate === dateKey
    );
  };

  // Load timeline schedules from database
  useEffect(() => {
    const loadTimelineSchedules = async () => {
      try {
        // Get schedules for this specific package and sub-document combination
        const schedules = await databaseService.getTimelineSchedules(
          packageId,
          subDocumentId
        );
        setTimelineSchedules(schedules);
        console.log(
          `Loaded timeline schedules for package "${packageId}" and subDocument "${subDocumentId}":`,
          schedules
        );
      } catch (error) {
        console.error("Error loading timeline schedules:", error);
      }
    };

    if (packageId && subDocumentId) {
      loadTimelineSchedules();
    }
  }, [packageId, subDocumentId]);

  const loadTimelineSchedules = async () => {
    try {
      // Get schedules for this specific package and sub-document combination
      const schedules = await databaseService.getTimelineSchedules(
        packageId,
        subDocumentId
      );
      setTimelineSchedules(schedules);
      console.log(
        `Reloaded timeline schedules for package "${packageId}" and subDocument "${subDocumentId}":`,
        schedules
      );
    } catch (error) {
      console.error("Error loading timeline schedules:", error);
    }
  };

  const handleAddSchedule = async (documentIndices: number[], date: string) => {
    try {
      for (const documentIndex of documentIndices) {
        const doc = documents[documentIndex];
        await databaseService.addTimelineSchedule({
          packageId,
          subDocumentId, // Include subDocumentId for proper separation
          documentId: `${documentIndex}`, // Use simple index as documentId
          documentName: doc.nama || `Document ${documentIndex + 1}`,
          scheduledDate: date,
        });
      }
      await loadTimelineSchedules();
      setSelectedDocuments([]);
      setSelectedDate("");
      setShowDocumentModal(false);
    } catch (error) {
      console.error("Error adding schedule:", error);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      await databaseService.deleteTimelineSchedule(scheduleId);
      await loadTimelineSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  const handleDateClick = (date: Date) => {
    const dateKey = formatDateKey(date);
    setSelectedDate(dateKey);
    setShowDocumentModal(true);
  };

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const dayNames = ["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const timelineData = useMemo(() => {
    const eventsMap: Map<string, TimelineEvent> = new Map();

    // Helper function to add event to map
    const addEvent = (dateKey: string, event: TimelineEvent["events"][0]) => {
      if (!eventsMap.has(dateKey)) {
        const date = createLocalDate(dateKey); // Use local date creation
        if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
          eventsMap.set(dateKey, {
            date: dateKey,
            day: date.getDate(),
            month: date.toLocaleString("id-ID", { month: "long" }),
            year: date.getFullYear(),
            events: [],
          });
        } else {
          console.warn(`Invalid date detected: ${dateKey}`);
          return;
        }
      }
      if (eventsMap.has(dateKey)) {
        eventsMap.get(dateKey)!.events.push(event);
      }
    };

    // Process ONLY database timeline schedules (remove Google Sheets integration)
    timelineSchedules.forEach((schedule) => {
      addEvent(schedule.scheduledDate, {
        type: "scheduled",
        title: "Jadwal Aktivitas",
        document: schedule.documentName,
        status: "Terjadwal",
      });
    });

    // Sort events by date using local date creation
    const sortedEvents = Array.from(eventsMap.values()).sort(
      (a, b) =>
        createLocalDate(a.date).getTime() - createLocalDate(b.date).getTime()
    );

    console.log(
      "TimelineView: Final timeline events (SQLite only)",
      sortedEvents
    );
    return sortedEvents;
  }, [timelineSchedules]); // Only depend on timelineSchedules

  const getEventIcon = (type: string) => {
    switch (type) {
      case "scheduled":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "scheduled":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "scheduled":
        return "Terjadwal";
      default:
        return "Lainnya";
    }
  };

  const groupedByMonth = useMemo(() => {
    const grouped = new Map<string, TimelineEvent[]>();

    timelineData.forEach((event) => {
      const monthKey = `${event.month} ${event.year}`;
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)!.push(event);
    });

    return grouped;
  }, [timelineData]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-white mr-3" />
            <div>
              <h3 className="text-xl font-bold text-white">
                Timeline {subDocumentTitle}
              </h3>
              {packageId && subDocumentId && (
                <p className="text-white/80 text-sm mt-1">
                  Paket: <span className="font-medium">{packageId}</span> • Sub
                  Dokumen: <span className="font-medium">{subDocumentId}</span>
                </p>
              )}
            </div>
          </div>
          <div className="text-white/90 text-sm bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
            {timelineData.length} aktivitas
          </div>
        </div>
      </div>

      {/* Google Calendar-like Scheduler Section - Always show if documents exist */}
      {packageId && documents.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Kalender Penjadwalan
            </h4>
            <button
              onClick={() => setShowCalendarScheduler(!showCalendarScheduler)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              {showCalendarScheduler ? "Sembunyikan" : "Tampilkan"} Kalender
            </button>
          </div>

          {showCalendarScheduler && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() - 1
                      )
                    )
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="text-lg font-bold text-gray-800">
                  {monthNames[currentMonth.getMonth()]}{" "}
                  {currentMonth.getFullYear()}
                </h3>
                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1
                      )
                    )
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-sm font-semibold text-gray-600"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((date, index) => {
                    const scheduledDocs = getScheduledDocsForDate(date);
                    const isCurrentMonth = isSameMonth(date, currentMonth);
                    const isDateToday = isToday(date);

                    return (
                      <div
                        key={index}
                        onClick={() => isCurrentMonth && handleDateClick(date)}
                        className={`
                          min-h-[80px] p-2 border border-gray-200 cursor-pointer transition-all hover:bg-blue-50
                          ${
                            isCurrentMonth
                              ? "bg-white"
                              : "bg-gray-50 text-gray-400"
                          }
                          ${
                            isDateToday ? "ring-2 ring-blue-500 bg-blue-50" : ""
                          }
                          ${
                            scheduledDocs.length > 0
                              ? "bg-green-50 border-green-200"
                              : ""
                          }
                        `}
                      >
                        <div
                          className={`text-sm font-medium ${
                            isDateToday ? "text-blue-700" : ""
                          }`}
                        >
                          {date.getDate()}
                        </div>
                        {scheduledDocs.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {scheduledDocs.slice(0, 2).map((schedule, i) => (
                              <div
                                key={i}
                                className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
                                title={schedule.documentName}
                              >
                                {schedule.documentName.length > 15
                                  ? schedule.documentName.substring(0, 15) +
                                    "..."
                                  : schedule.documentName}
                              </div>
                            ))}
                            {scheduledDocs.length > 2 && (
                              <div className="text-xs text-gray-600">
                                +{scheduledDocs.length - 2} lainnya
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Document Selection Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Pilih Dokumen untuk Tanggal{" "}
                {selectedDate &&
                  new Date(selectedDate).toLocaleDateString("id-ID")}
              </h3>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  onClick={() => {
                    const newSelected = selectedDocuments.includes(index)
                      ? selectedDocuments.filter((i) => i !== index)
                      : [...selectedDocuments, index];
                    setSelectedDocuments(newSelected);
                  }}
                  className={`
                    p-3 border rounded-lg cursor-pointer transition-all
                    ${
                      selectedDocuments.includes(index)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <div className="flex items-center">
                    <div
                      className={`
                      w-4 h-4 border-2 rounded mr-3 flex items-center justify-center
                      ${
                        selectedDocuments.includes(index)
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }
                    `}
                    >
                      {selectedDocuments.includes(index) && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {doc.nama || `Document ${index + 1}`}
                      </h4>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            doc.status === "Selesai"
                              ? "bg-green-100 text-green-800"
                              : doc.status === "Dalam Proses"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {doc.status || "Belum Dimulai"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDocumentModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() =>
                  handleAddSchedule(selectedDocuments, selectedDate)
                }
                disabled={selectedDocuments.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Jadwalkan {selectedDocuments.length} Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Content */}
      <div className="p-6">
        {timelineData.length === 0 ? (
          /* Empty Timeline State */
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Belum Ada Jadwal
            </h3>
            <p className="text-gray-500 mb-2">
              Tidak ada jadwal yang tersimpan
            </p>
            <p className="text-sm text-gray-400">
              Gunakan kalender di atas untuk menjadwalkan dokumen
            </p>
          </div>
        ) : (
          /* Timeline with Data */
          Array.from(groupedByMonth.entries()).map(([monthYear, events]) => (
            <div key={monthYear} className="mb-8 last:mb-0">
              {/* Month Header */}
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-lg">
                  <h4 className="text-lg font-bold text-indigo-800">
                    {monthYear}
                  </h4>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-indigo-200 to-transparent ml-4"></div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full ml-4">
                  {events.length} hari
                </div>
              </div>

              {/* Events Grid */}
              <div className="space-y-4">
                {events.map((timelineEvent) => (
                  <div
                    key={timelineEvent.date}
                    className="bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all duration-200"
                  >
                    {/* Date Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold text-lg mr-4">
                          {timelineEvent.day}
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-800">
                            {createLocalDate(
                              timelineEvent.date
                            ).toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {timelineEvent.events.length} aktivitas
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Events List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {timelineEvent.events.map((event, index) => (
                        <div
                          key={index}
                          className={`flex items-start p-3 rounded-lg border transition-all hover:shadow-sm ${getEventColor(
                            event.type
                          )}`}
                        >
                          <div className="mr-3 mt-1">
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm mb-1">
                              {event.title}
                            </div>
                            <div className="text-xs text-gray-700 mb-1">
                              {event.document}
                            </div>
                            <div className="text-xs opacity-75">
                              {getEventTypeLabel(event.type)}
                            </div>
                          </div>

                          {/* Delete button for database-stored schedules */}
                          {event.type === "scheduled" && packageId && (
                            <button
                              onClick={() => {
                                // Find the schedule ID from the timeline schedules
                                const schedule = timelineSchedules.find(
                                  (s) =>
                                    s.scheduledDate === timelineEvent.date &&
                                    s.documentName === event.document
                                );
                                if (schedule && schedule.id) {
                                  handleDeleteSchedule(schedule.id);
                                }
                              }}
                              className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Hapus Jadwal"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-8 text-sm">
          <div className="flex items-center">
            <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
            <span className="font-medium text-gray-700">
              Selesai:{" "}
              {timelineData.reduce(
                (acc, event) =>
                  acc +
                  event.events.filter((e) => e.type === "completed").length,
                0
              )}
            </span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-blue-500 mr-2" />
            <span className="font-medium text-gray-700">
              Diterima:{" "}
              {timelineData.reduce(
                (acc, event) =>
                  acc +
                  event.events.filter((e) => e.type === "received").length,
                0
              )}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-purple-500 mr-2" />
            <span className="font-medium text-gray-700">
              Terjadwal:{" "}
              {timelineData.reduce(
                (acc, event) =>
                  acc +
                  event.events.filter((e) => e.type === "scheduled").length,
                0
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
