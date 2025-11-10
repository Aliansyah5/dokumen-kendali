/**
 * Keep-Alive Endpoint for Supabase
 * 
 * Simple endpoint that can be pinged by cron jobs to keep Supabase active
 * Place in: api/keep-alive.ts (for Vercel)
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set cache headers to prevent caching
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const startTime = Date.now();

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Ping both tables with minimal queries
    const [timelineResult, linksResult] = await Promise.allSettled([
      supabase.from('timeline_schedules').select('id', { head: true, count: 'exact' }).limit(1),
      supabase.from('document_links').select('id', { head: true, count: 'exact' }).limit(1),
    ]);

    const responseTime = Date.now() - startTime;

    const timelineOk = timelineResult.status === 'fulfilled' && !timelineResult.value.error;
    const linksOk = linksResult.status === 'fulfilled' && !linksResult.value.error;

    const response = {
      status: timelineOk && linksOk ? 'awake' : 'partial',
      timestamp: new Date().toISOString(),
      responseTime,
      tables: {
        timeline_schedules: timelineOk ? 'ok' : 'error',
        document_links: linksOk ? 'ok' : 'error',
      },
      message: '👋 Supabase is awake and responsive',
    };

    console.log(`[KEEP-ALIVE] ${response.status} - ${responseTime}ms`);

    res.status(200).json(response);
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    console.error('[KEEP-ALIVE] Error:', error.message);

    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      responseTime,
      error: error.message,
      message: '❌ Failed to wake Supabase',
    });
  }
}