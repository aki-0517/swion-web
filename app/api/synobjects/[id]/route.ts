import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * GET /api/collections/synobjects/[id]
 * 特定のSynObject情報を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const synObjectId = Number(params.id);

    const { data: synObject, error } = await supabase
      .from('syn_objects')
      .select('*')
      .eq('id', synObjectId)
      .single();

    if (error) throw error;

    if (!synObject) {
      return NextResponse.json(
        { error: 'SynObject not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: synObject }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
