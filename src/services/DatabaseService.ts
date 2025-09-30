// Browser-compatible database service using localStorage
// Note: For production, consider using IndexedDB or a web-compatible database

export interface TimelineSchedule {
  id?: number;
  packageId: string;
  subDocumentId?: string; // Add subDocumentId for better separation
  documentId: string;
  documentName: string;
  scheduledDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentLink {
  id?: number;
  packageId: string;
  documentId: string;
  documentName: string;
  linkUrl: string;
  createdAt: string;
  updatedAt: string;
}

class DatabaseService {
  private timelineKey = "dashboard_timeline_schedules";
  private linksKey = "dashboard_document_links";

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    // Initialize localStorage if not exists
    if (!localStorage.getItem(this.timelineKey)) {
      localStorage.setItem(this.timelineKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.linksKey)) {
      localStorage.setItem(this.linksKey, JSON.stringify([]));
    }
  }

  private generateId(): number {
    return Date.now() + Math.random() * 1000;
  }

  private getTimelineData(): TimelineSchedule[] {
    try {
      const data = localStorage.getItem(this.timelineKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading timeline data:", error);
      return [];
    }
  }

  private setTimelineData(data: TimelineSchedule[]): void {
    try {
      localStorage.setItem(this.timelineKey, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving timeline data:", error);
    }
  }

  private getLinksData(): DocumentLink[] {
    try {
      const data = localStorage.getItem(this.linksKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading links data:", error);
      return [];
    }
  }

  private setLinksData(data: DocumentLink[]): void {
    try {
      localStorage.setItem(this.linksKey, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving links data:", error);
    }
  }

  // Timeline Schedule Methods
  async addTimelineSchedule(
    schedule: Omit<TimelineSchedule, "id" | "createdAt" | "updatedAt">
  ): Promise<number> {
    const schedules = this.getTimelineData();
    const now = new Date().toISOString();
    const id = this.generateId();

    // Remove existing schedule for same package/subDocument/document/date combination
    const filteredSchedules = schedules.filter(
      (s) =>
        !(
          s.packageId === schedule.packageId &&
          s.subDocumentId === schedule.subDocumentId &&
          s.documentId === schedule.documentId &&
          s.scheduledDate === schedule.scheduledDate
        )
    );

    const newSchedule: TimelineSchedule = {
      id,
      ...schedule,
      createdAt: now,
      updatedAt: now,
    };

    filteredSchedules.push(newSchedule);
    this.setTimelineData(filteredSchedules);

    return id;
  }

  async getTimelineSchedules(
    packageId?: string,
    subDocumentId?: string,
    documentId?: string
  ): Promise<TimelineSchedule[]> {
    let schedules = this.getTimelineData();

    if (packageId && subDocumentId && documentId) {
      schedules = schedules.filter(
        (s) =>
          s.packageId === packageId &&
          s.subDocumentId === subDocumentId &&
          s.documentId === documentId
      );
    } else if (packageId && subDocumentId) {
      schedules = schedules.filter(
        (s) => s.packageId === packageId && s.subDocumentId === subDocumentId
      );
    } else if (packageId && documentId) {
      schedules = schedules.filter(
        (s) => s.packageId === packageId && s.documentId === documentId
      );
    } else if (packageId) {
      schedules = schedules.filter((s) => s.packageId === packageId);
    }

    return schedules.sort(
      (a, b) =>
        new Date(b.scheduledDate).getTime() -
        new Date(a.scheduledDate).getTime()
    );
  }

  async deleteTimelineSchedule(id: number): Promise<void> {
    const schedules = this.getTimelineData();
    const filteredSchedules = schedules.filter((s) => s.id !== id);
    this.setTimelineData(filteredSchedules);
  }

  // Document Link Methods
  async addDocumentLink(
    link: Omit<DocumentLink, "id" | "createdAt" | "updatedAt">
  ): Promise<number> {
    const links = this.getLinksData();
    const now = new Date().toISOString();
    const id = this.generateId();

    // Remove existing link for same package/document combination
    const filteredLinks = links.filter(
      (l) =>
        !(l.packageId === link.packageId && l.documentId === link.documentId)
    );

    const newLink: DocumentLink = {
      id,
      ...link,
      createdAt: now,
      updatedAt: now,
    };

    filteredLinks.push(newLink);
    this.setLinksData(filteredLinks);

    return id;
  }

  async getDocumentLinks(
    packageId?: string,
    documentId?: string
  ): Promise<DocumentLink[]> {
    let links = this.getLinksData();

    if (packageId && documentId) {
      links = links.filter(
        (l) => l.packageId === packageId && l.documentId === documentId
      );
    } else if (packageId) {
      links = links.filter((l) => l.packageId === packageId);
    }

    return links.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getDocumentLink(
    packageId: string,
    documentId: string
  ): Promise<DocumentLink | null> {
    const links = await this.getDocumentLinks(packageId, documentId);
    return links.length > 0 ? links[0] : null;
  }

  async deleteDocumentLink(id: number): Promise<void> {
    const links = this.getLinksData();
    const filteredLinks = links.filter((l) => l.id !== id);
    this.setLinksData(filteredLinks);
  }

  // Utility method to clear all data (for testing/reset)
  async clearAllData(): Promise<void> {
    localStorage.removeItem(this.timelineKey);
    localStorage.removeItem(this.linksKey);
    this.initializeStorage();
  }
}

// Create and export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;
