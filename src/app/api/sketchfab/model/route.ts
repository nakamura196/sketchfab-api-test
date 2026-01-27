import { NextRequest, NextResponse } from 'next/server';

const SKETCHFAB_API_BASE = 'https://api.sketchfab.com/v3';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const modelUid = searchParams.get('uid');

  const apiToken = process.env.SKETCHFAB_API_TOKEN;

  if (!apiToken) {
    return NextResponse.json(
      { error: 'SKETCHFAB_API_TOKEN is not configured' },
      { status: 500 }
    );
  }

  if (!modelUid) {
    return NextResponse.json(
      { error: 'Missing uid parameter' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${SKETCHFAB_API_BASE}/models/${modelUid}`, {
      headers: {
        Authorization: `Token ${apiToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Sketchfab API error: ${errorText}` },
        { status: response.status }
      );
    }

    const modelData = await response.json();

    return NextResponse.json({
      uid: modelData.uid,
      name: modelData.name,
      description: modelData.description,
      isDownloadable: modelData.isDownloadable,
      thumbnails: modelData.thumbnails,
      viewerUrl: modelData.viewerUrl,
    });
  } catch (error) {
    console.error('Sketchfab model info error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
