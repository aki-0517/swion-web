import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/explore/projects
 * Projectを一覧取得
 */
export async function GET(req: NextRequest) {
  try {
    // DBからProject一覧を取得する処理 (例)
    const projects = [
      {
        id: 1,
        name: 'Sample Project',
        logoImage: 'https://example.com/logo.png',
        url: 'https://example.com',
        description: 'Project description',
      },
      // ...その他のProject
    ];

    return NextResponse.json({ data: projects }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
