/**
 * Supabase Keep-Alive Ping Service
 * 
 * This service pings Supabase tables to keep the database active
 * and prevent cold starts/slowdowns
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PingResult {
  success: boolean;
  timestamp: string;
  tables: {
    timeline_schedules: boolean;
    document_links: boolean;
  };
  responseTime: number;
  error?: string;
}

/**
 * Ping Supabase tables to keep them warm
 * Performs lightweight queries to maintain active connection
 */
export async function keepSupabaseAwake(): Promise<PingResult> {
  const startTime = Date.now();
  const result: PingResult = {
    success: false,
    timestamp: new Date().toISOString(),
    tables: {
      timeline_schedules: false,
      document_links: false,
    },
    responseTime: 0,
  };

  try {
    // Ping timeline_schedules table (lightweight query)
    const { error: timelineError } = await supabase
      .from('timeline_schedules')
      .select('id', { head: true, count: 'exact' })
      .limit(1);

    result.tables.timeline_schedules = !timelineError;

    // Ping document_links table (lightweight query)
    const { error: linksError } = await supabase
      .from('document_links')
      .select('id', { head: true, count: 'exact' })
      .limit(1);

    result.tables.document_links = !linksError;

    // Success if at least one table responds
    result.success = result.tables.timeline_schedules || result.tables.document_links;

    if (!result.success) {
      result.error = 'All tables failed to respond';
    }

  } catch (error: any) {
    result.success = false;
    result.error = error.message;
  } finally {
    result.responseTime = Date.now() - startTime;
  }

  return result;
}

// Auto-ping on module import (optional, can be disabled)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Ping once on app load in production
  keepSupabaseAwake()
    .then((result) => {
      if (result.success) {
        console.log('✅ Supabase keep-alive ping successful');
      }
    })
    .catch((error) => {
      console.warn('⚠️ Supabase keep-alive ping failed:', error);
    });
}

export default keepSupabaseAwake;