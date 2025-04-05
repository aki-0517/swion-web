import { NextRequest, NextResponse } from 'next/server';

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

    // DBからsynObjectIdに該当するSynObjectを取得 (例)
    const synObject = {
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
      isPublic: false,
    };

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
