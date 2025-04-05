import { NextRequest, NextResponse } from 'next/server';

/**
 * PATCH /api/collections/synobjects/[id]/publish
 * 特定のSynObjectのisPublicをtrueに更新
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const synObjectId = Number(params.id);

    // DBで対象SynObjectを検索 (例)
    // 対象が存在しない場合は404を返す処理を実装する

    // DBで対象SynObjectのisPublicをtrueに更新 (例)
    const updatedSynObject = {
      id: synObjectId,
      attached_objects: [101, 102],
      image: 'https://example.com/syn.png',
      mintFlags: [
        {
          package: '0xPackageID',
          module: 'ModuleName',
          function: 'functionName',
        },
      ],
      isPublic: true,
    };

    return NextResponse.json({ data: updatedSynObject }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
