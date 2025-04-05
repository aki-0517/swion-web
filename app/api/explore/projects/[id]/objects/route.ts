import { NextRequest, NextResponse } from 'next/server';

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

    // DBからprojectIdに紐づくObject一覧を取得 (例)
    // const objects = await db.nFTObject.findMany({
    //   where: { projectId },
    // });
    const objects = [
      {
        id: 101,
        name: 'Sample NFT Object',
        image: 'https://example.com/nft.png',
        mintFlag: 'example-flag',
      },
      // ...その他のObjects
    ];

    return NextResponse.json({ data: objects }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
