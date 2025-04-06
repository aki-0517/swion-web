import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * POST /api/collections/synobjects
 * 複数のobject情報を受け取り、OpenAI API等を使って新規SynObjectを生成
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Supabaseにデータを挿入
    const { data: newSynObject, error } = await supabase
      .from('syn_objects')
      .insert({
        attached_objects: body.objects,
        image: 'https://example.com/generated-image.png', // OpenAI生成後の画像URLを設定
        mint_flags: [
          {
            package: '0xPackageID',
            module: 'ModuleName',
            function: 'functionName',
          },
        ],
        is_public: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: newSynObject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/collections/synobjects
 * 公開されているSynObject(is_public=true)を一覧取得
 */
export async function GET() {
  try {
    const { data: synObjects, error } = await supabase
      .from('syn_objects')
      .select('*')
      .eq('is_public', true);

    if (error) throw error;

    return NextResponse.json({ data: synObjects }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
