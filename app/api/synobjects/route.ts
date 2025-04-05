import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/collections/synobjects
 * 複数のobject情報を受け取り、OpenAI API等を使って新規SynObjectを生成
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // body.objects: 複数のobject情報が入っていると想定
    // OpenAI APIを呼び出し、画像や名前を生成するロジックを実装する

    // 例: DBにSynObjectを作成
    const newSynObject = {
      id: 999,
      attached_objects: body.objects,
      image: 'https://example.com/generated-image.png',
      mintFlags: [
        {
          package: '0xPackageID',
          module: 'ModuleName',
          function: 'functionName',
        },
      ],
      isPublic: false,
    };

    return NextResponse.json({ data: newSynObject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/collections/synobjects
 * 公開されているSynObject(isPublic=true)を一覧取得
 */
export async function GET() {
  try {
    // DBからisPublic = true のSynObject一覧を取得 (例)
    const synObjects = [
      {
        id: 1,
        attached_objects: [101, 102],
        image: 'https://example.com/syn1.png',
        mintFlags: [
          {
            package: '0xPackageID',
            module: 'ModuleName',
            function: 'functionName',
          },
        ],
        isPublic: true,
      },
      {
        id: 2,
        attached_objects: [103],
        image: 'https://example.com/syn2.png',
        mintFlags: [
          {
            package: '0xPackageID',
            module: 'ModuleName',
            function: 'functionName',
          },
          {
            package: '0xAnotherPackageID',
            module: 'AnotherModule',
            function: 'anotherFunction',
          },
        ],
        isPublic: true,
      },
    ];

    return NextResponse.json({ data: synObjects }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
