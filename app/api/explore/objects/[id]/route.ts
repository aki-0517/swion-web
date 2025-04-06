import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * GET /api/explore/objects/[id]
 * 特定のNFT Object情報を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const objectId = Number(params.id);

    const { data: nftObject, error } = await supabase
      .from('nft_objects')
      .select('id, name, image, mint_flag, created_at, updated_at')
      .eq('id', objectId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!nftObject) {
      return NextResponse.json(
        { error: 'NFT Object not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: nftObject }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
