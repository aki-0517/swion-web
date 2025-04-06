// app/api/explore/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * GET /api/explore/projects
 * Supabaseからprojectsテーブルの全データを取得して返す
 */
export async function GET(req: NextRequest) {
  // Supabaseからprojectsテーブルの全件取得
  const { data, error } = await supabase.from('projects').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}
