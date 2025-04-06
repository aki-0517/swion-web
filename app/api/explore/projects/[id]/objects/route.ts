import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * GET /api/explore/projects/[id]/objects
 * 特定のProjectに紐づくNFT Objectの一覧を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = Number(params.id);

    const { data: objects, error } = await supabase
      .from('nft_objects')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;

    return NextResponse.json({ data: objects }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
