import { NextRequest, NextResponse } from 'next/server';

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

    // DBからobjectIdに該当するNFT Objectを取得 (例)
    // mintFlagをオブジェクト型に変更
    const nftObject = {
      id: objectId,
      name: 'Sample NFT Object',
      image: 'https://example.com/nft.png',
      mintFlag: {
        package: '0xPackageID',
        module: 'ModuleName',
        function: 'functionName',
      },
    };

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
