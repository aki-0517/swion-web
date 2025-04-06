import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * PATCH /api/collections/synobjects/[id]/publish
 * 特定のSynObjectのis_publicをtrueに更新
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const synObjectId = Number(params.id);

    const { data: updatedSynObject, error } = await supabase
      .from('syn_objects')
      .update({ is_public: true })
      .eq('id', synObjectId)
      .select()
      .single();

    if (error) throw error;

    if (!updatedSynObject) {
      return NextResponse.json(
        { error: 'SynObject not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updatedSynObject }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
