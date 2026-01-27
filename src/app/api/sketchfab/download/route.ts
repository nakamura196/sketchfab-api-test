import { NextRequest, NextResponse } from 'next/server';

const SKETCHFAB_API_BASE = 'https://api.sketchfab.com/v3';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const modelUid = searchParams.get('uid');
  const proxy = searchParams.get('proxy'); // ?proxy=true でプロキシモードに切り替え

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
    // Get download URL from Sketchfab API
    const downloadResponse = await fetch(
      `${SKETCHFAB_API_BASE}/models/${modelUid}/download`,
      {
        headers: {
          Authorization: `Token ${apiToken}`,
        },
      }
    );

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      return NextResponse.json(
        { error: `Sketchfab API error: ${errorText}` },
        { status: downloadResponse.status }
      );
    }

    const downloadData = await downloadResponse.json();

    if (!downloadData.glb || !downloadData.glb.url) {
      return NextResponse.json(
        { error: 'GLB not available for this model' },
        { status: 404 }
      );
    }

    // プロキシモードでない場合はURLを返す（クライアントが直接ダウンロード）
    if (proxy !== 'true') {
      return NextResponse.json({
        url: downloadData.glb.url,
        size: downloadData.glb.size,
        expires: downloadData.glb.expires,
        // 他のフォーマットも返す
        formats: {
          glb: downloadData.glb,
          gltf: downloadData.gltf,
          usdz: downloadData.usdz,
          source: downloadData.source,
        },
      });
    }

    // プロキシモード: サーバー経由でダウンロード（CORS問題がある場合用）
    const glbResponse = await fetch(downloadData.glb.url);

    if (!glbResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch GLB file' },
        { status: 500 }
      );
    }

    const glbBuffer = await glbResponse.arrayBuffer();

    return new NextResponse(glbBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Content-Disposition': `attachment; filename="${modelUid}.glb"`,
        'Content-Length': glbBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Sketchfab download error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
