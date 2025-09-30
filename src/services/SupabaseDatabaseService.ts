import {
  supabase,
  SupabaseTimelineSchedule,
  SupabaseDocumentLink,
} from "../lib/supabase";

// Interface for compatibility with existing code
export interface TimelineSchedule {
  id?: number;
  packageId: string;
  subDocumentId?: string;
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

class SupabaseDatabaseService {
  // Helper functions to convert between camelCase and snake_case
  private toSupabaseTimelineSchedule(
    schedule: Omit<TimelineSchedule, "id" | "createdAt" | "updatedAt">
  ): Omit<SupabaseTimelineSchedule, "id" | "created_at" | "updated_at"> {
    return {
      package_id: schedule.packageId,
      sub_document_id: schedule.subDocumentId,
      document_id: schedule.documentId,
      document_name: schedule.documentName,
      scheduled_date: schedule.scheduledDate,
    };
  }

  private fromSupabaseTimelineSchedule(
    supabaseSchedule: SupabaseTimelineSchedule
  ): TimelineSchedule {
    return {
      id: supabaseSchedule.id,
      packageId: supabaseSchedule.package_id,
      subDocumentId: supabaseSchedule.sub_document_id,
      documentId: supabaseSchedule.document_id,
      documentName: supabaseSchedule.document_name,
      scheduledDate: supabaseSchedule.scheduled_date,
      createdAt: supabaseSchedule.created_at || "",
      updatedAt: supabaseSchedule.updated_at || "",
    };
  }

  private toSupabaseDocumentLink(
    link: Omit<DocumentLink, "id" | "createdAt" | "updatedAt">
  ): Omit<SupabaseDocumentLink, "id" | "created_at" | "updated_at"> {
    return {
      package_id: link.packageId,
      document_id: link.documentId,
      document_name: link.documentName,
      link_url: link.linkUrl,
    };
  }

  private fromSupabaseDocumentLink(
    supabaseLink: SupabaseDocumentLink
  ): DocumentLink {
    return {
      id: supabaseLink.id,
      packageId: supabaseLink.package_id,
      documentId: supabaseLink.document_id,
      documentName: supabaseLink.document_name,
      linkUrl: supabaseLink.link_url,
      createdAt: supabaseLink.created_at || "",
      updatedAt: supabaseLink.updated_at || "",
    };
  }

  // Timeline Schedule Methods
  async addTimelineSchedule(
    schedule: Omit<TimelineSchedule, "id" | "createdAt" | "updatedAt">
  ): Promise<number> {
    try {
      // Remove existing schedule for same package/subDocument/document/date combination
      await this.deleteExistingSchedule(
        schedule.packageId,
        schedule.subDocumentId,
        schedule.documentId,
        schedule.scheduledDate
      );

      const supabaseSchedule = this.toSupabaseTimelineSchedule(schedule);

      const { data, error } = await supabase
        .from("timeline_schedules")
        .insert([supabaseSchedule])
        .select()
        .single();

      if (error) {
        console.error("Supabase error adding timeline schedule:", error);
        throw error;
      }

      console.log("✅ Timeline schedule added to Supabase:", data);
      return data.id;
    } catch (error) {
      console.error("Error adding timeline schedule:", error);
      throw error;
    }
  }

  private async deleteExistingSchedule(
    packageId: string,
    subDocumentId?: string,
    documentId?: string,
    scheduledDate?: string
  ): Promise<void> {
    try {
      let query = supabase
        .from("timeline_schedules")
        .delete()
        .eq("package_id", packageId);

      if (subDocumentId) {
        query = query.eq("sub_document_id", subDocumentId);
      }
      if (documentId) {
        query = query.eq("document_id", documentId);
      }
      if (scheduledDate) {
        query = query.eq("scheduled_date", scheduledDate);
      }

      const { error } = await query;
      if (error) {
        console.error("Error deleting existing schedule:", error);
      }
    } catch (error) {
      console.error("Error in deleteExistingSchedule:", error);
    }
  }

  async getTimelineSchedules(
    packageId?: string,
    subDocumentId?: string,
    documentId?: string
  ): Promise<TimelineSchedule[]> {
    try {
      let query = supabase
        .from("timeline_schedules")
        .select("*")
        .order("scheduled_date", { ascending: false });

      if (packageId && subDocumentId && documentId) {
        query = query
          .eq("package_id", packageId)
          .eq("sub_document_id", subDocumentId)
          .eq("document_id", documentId);
      } else if (packageId && subDocumentId) {
        query = query
          .eq("package_id", packageId)
          .eq("sub_document_id", subDocumentId);
      } else if (packageId && documentId) {
        query = query.eq("package_id", packageId).eq("document_id", documentId);
      } else if (packageId) {
        query = query.eq("package_id", packageId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error getting timeline schedules:", error);
        throw error;
      }

      const schedules = (data || []).map(this.fromSupabaseTimelineSchedule);
      console.log(
        `📅 Retrieved ${schedules.length} timeline schedules from Supabase`
      );
      return schedules;
    } catch (error) {
      console.error("Error getting timeline schedules:", error);
      throw error;
    }
  }

  async deleteTimelineSchedule(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from("timeline_schedules")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Supabase error deleting timeline schedule:", error);
        throw error;
      }

      console.log("🗑️ Timeline schedule deleted from Supabase:", id);
    } catch (error) {
      console.error("Error deleting timeline schedule:", error);
      throw error;
    }
  }

  // Document Link Methods
  async addDocumentLink(
    link: Omit<DocumentLink, "id" | "createdAt" | "updatedAt">
  ): Promise<number> {
    try {
      // Remove existing link for same package/document combination
      await supabase
        .from("document_links")
        .delete()
        .eq("package_id", link.packageId)
        .eq("document_id", link.documentId);

      const supabaseLink = this.toSupabaseDocumentLink(link);

      const { data, error } = await supabase
        .from("document_links")
        .insert([supabaseLink])
        .select()
        .single();

      if (error) {
        console.error("Supabase error adding document link:", error);
        throw error;
      }

      console.log("🔗 Document link added to Supabase:", data);
      return data.id;
    } catch (error) {
      console.error("Error adding document link:", error);
      throw error;
    }
  }

  async getDocumentLinks(
    packageId?: string,
    documentId?: string
  ): Promise<DocumentLink[]> {
    try {
      let query = supabase
        .from("document_links")
        .select("*")
        .order("updated_at", { ascending: false });

      if (packageId && documentId) {
        query = query.eq("package_id", packageId).eq("document_id", documentId);
      } else if (packageId) {
        query = query.eq("package_id", packageId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error getting document links:", error);
        throw error;
      }

      const links = (data || []).map(this.fromSupabaseDocumentLink);
      console.log(`🔗 Retrieved ${links.length} document links from Supabase`);
      return links;
    } catch (error) {
      console.error("Error getting document links:", error);
      throw error;
    }
  }

  async getDocumentLink(
    packageId: string,
    documentId: string
  ): Promise<DocumentLink | null> {
    try {
      const links = await this.getDocumentLinks(packageId, documentId);
      return links.length > 0 ? links[0] : null;
    } catch (error) {
      console.error("Error getting document link:", error);
      throw error;
    }
  }

  async deleteDocumentLink(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from("document_links")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Supabase error deleting document link:", error);
        throw error;
      }

      console.log("🗑️ Document link deleted from Supabase:", id);
    } catch (error) {
      console.error("Error deleting document link:", error);
      throw error;
    }
  }

  // Utility method to clear all data (for testing/reset)
  async clearAllData(): Promise<void> {
    try {
      await supabase.from("timeline_schedules").delete().neq("id", 0);
      await supabase.from("document_links").delete().neq("id", 0);
      console.log("🧹 All data cleared from Supabase");
    } catch (error) {
      console.error("Error clearing all data:", error);
      throw error;
    }
  }

  // Method to test connection
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("timeline_schedules")
        .select("count", { count: "exact", head: true });

      if (error) {
        console.error("Supabase connection test failed:", error);
        return false;
      }

      console.log("✅ Supabase connection successful");
      return true;
    } catch (error) {
      console.error("Error testing Supabase connection:", error);
      return false;
    }
  }
}

// Create and export singleton instance
export const supabaseDatabaseService = new SupabaseDatabaseService();
export default supabaseDatabaseService;
