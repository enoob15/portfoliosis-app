import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lwqzfqvigvqcigijrggc.supabase.co';
const SERVICE_KEY = process.env.PINPOINT_SERVICE_KEY || '';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Always log to console for debugging
    console.log('[Pinpoint Report]', JSON.stringify({
      type: body.type,
      url: body.url,
      pin: body.pin?.comment || null,
      errors: body.errors?.length || 0,
      console: body.console?.length || 0,
    }));

    // Send to Supabase if we have the key
    if (SERVICE_KEY) {
      const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

      // Look up project by API key
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('api_key', body.projectId || 'portfoliosis')
        .single();

      if (project) {
        const { error } = await supabase.from('reports').insert({
          project_id: project.id,
          type: body.type || 'feedback',
          url: body.url || '',
          timestamp: body.timestamp || new Date().toISOString(),
          pin_x: body.pin?.x || null,
          pin_y: body.pin?.y || null,
          pin_selector: body.pin?.selector || null,
          pin_comment: body.pin?.comment || null,
          pin_screenshot: body.pin?.screenshot || null,
          environment: body.environment || {},
          console_entries: body.console || [],
          network_entries: body.network || [],
          error_entries: body.errors || [],
          session_duration: body.session?.duration || null,
          scroll_depth: body.session?.scrollDepth || null,
          idle_time: body.session?.idleTime || null,
          exit_type: body.session?.exitType || null,
          rage_clicks: body.session?.rageClicks || [],
          dead_clicks: body.session?.deadClicks || [],
          session_id: body.sessionId || null,
          user_agent: body.environment?.browser || null,
        });

        if (error) {
          console.error('[Pinpoint] Supabase insert error:', error.message);
        } else {
          console.log('[Pinpoint] Report stored in Supabase');
        }
      } else {
        console.warn('[Pinpoint] No matching project for key:', body.projectId);
      }
    }

    return NextResponse.json({ status: 'ok' }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('[Pinpoint] Ingest error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
