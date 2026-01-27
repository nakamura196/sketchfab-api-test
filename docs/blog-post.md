# Sketchfab APIでGLBファイルをダウンロード・表示するWebアプリを作る

Sketchfab APIを使って3DモデルをGLBファイルとしてダウンロードし、ブラウザ上でThree.jsで表示するWebアプリを作成しました。本記事では、セキュリティを考慮したアーキテクチャ設計から実装まで解説します。

## やりたかったこと

- Sketchfab上の3DモデルをGLB形式でダウンロードしたい
- ダウンロードしたGLBをブラウザ上で3D表示したい
- APIトークンを安全に管理したい

## 技術スタック

- Next.js 16（App Router）
- React Three Fiber / @react-three/drei
- TypeScript

## 最初に試したこと：クライアントサイドのみで実装

最初はシンプルにHTML + JavaScriptだけで実装しようとしました。

```javascript
// Sketchfab APIからダウンロードURLを取得
const response = await fetch(
  `https://api.sketchfab.com/v3/models/${modelUid}/download`,
  {
    headers: {
      'Authorization': `Token ${apiToken}`
    }
  }
);
const data = await response.json();
console.log(data.glb.url); // 署名付きS3 URL
```

これ自体は動作しましたが、2つの問題がありました。

### 問題1: APIトークンの露出

クライアントサイドでAPIトークンを使用すると、ブラウザの開発者ツールから簡単に確認できてしまいます。APIトークンが漏洩すると、他人があなたのアカウントでAPIを利用できてしまうため、これは避けるべきです。

### 問題2: CORSエラー（場合による）

ブラウザのセキュリティ制限により、異なるオリジンへのリクエストが制限されることがあります。今回のケースでは、Sketchfab APIへのリクエスト自体はCORSが許可されていましたが、環境によっては問題になる可能性があります。

## 解決策：サーバーサイドAPIを経由する設計

Next.jsのAPI Routesを使って、サーバーサイドでSketchfab APIと通信する設計にしました。

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Client       │────▶│   Next.js API   │────▶│  Sketchfab API  │
│   (Browser)     │     │    (Server)     │     │                 │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        │           ┌─────────────────┐
        │           │                 │
        └──────────▶│   S3 (GLB)      │
                    │  署名付きURL     │
                    └─────────────────┘
```

### ポイント：署名付きURLの活用

Sketchfab APIは、GLBファイルの実体ではなく「署名付きS3 URL」を返します。

```json
{
  "glb": {
    "url": "https://sketchfab-prod-media.s3.amazonaws.com/archives/.../model.glb?AWSAccessKeyId=...&Signature=...&Expires=1769553560",
    "size": 1004808,
    "expires": 300
  }
}
```

この署名付きURLには以下の特徴があります：

- **有効期限付き**（数分で無効化）
- **特定ファイルへのアクセスのみ許可**
- **読み取り専用**

つまり、この署名付きURLをクライアントに渡しても安全です。クライアントはこのURLから直接S3にアクセスしてGLBをダウンロードできます。

### なぜサーバー経由でGLBを転送しないのか？

サーバー経由でGLBファイル全体を転送する方法もありますが、以下の理由から署名付きURLを返す方式を採用しました：

| 方式 | メリット | デメリット |
|------|----------|------------|
| サーバー経由でGLB転送 | CORSを完全に回避 | サーバー負荷大、転送速度低下 |
| 署名付きURLを返す | 高速、サーバー負荷なし | CORSに依存（今回は問題なし） |

Sketchfab S3は `Access-Control-Allow-Origin: *` を返すため、クライアントから直接アクセス可能でした。

## 実装

### 1. 環境変数の設定

```env
# .env.local
SKETCHFAB_API_TOKEN=your_api_token_here
```

APIトークンはサーバーサイドでのみ使用するため、`NEXT_PUBLIC_` プレフィックスは付けません。

### 2. API Route（サーバーサイド）

```typescript
// src/app/api/sketchfab/download/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const modelUid = request.nextUrl.searchParams.get('uid');
  const apiToken = process.env.SKETCHFAB_API_TOKEN;

  // Sketchfab APIからダウンロードURLを取得
  const response = await fetch(
    `https://api.sketchfab.com/v3/models/${modelUid}/download`,
    {
      headers: {
        Authorization: `Token ${apiToken}`,
      },
    }
  );

  const data = await response.json();

  // 署名付きURLをクライアントに返す
  return NextResponse.json({
    url: data.glb.url,
    size: data.glb.size,
    expires: data.glb.expires,
  });
}
```

### 3. GLBビューワーコンポーネント（クライアントサイド）

```typescript
// src/components/GLBViewer.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Center } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function Model({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url);
  return (
    <Center>
      <primitive object={gltf.scene} />
    </Center>
  );
}

export default function GLBViewer({ modelUid }: { modelUid: string }) {
  const [glbUrl, setGlbUrl] = useState<string | null>(null);

  useEffect(() => {
    // サーバーAPIから署名付きURLを取得
    fetch(`/api/sketchfab/download?uid=${modelUid}`)
      .then(res => res.json())
      .then(data => setGlbUrl(data.url));
  }, [modelUid]);

  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7.5]} />

      <Suspense fallback={null}>
        {glbUrl && <Model url={glbUrl} />}
        <Environment preset="studio" />
      </Suspense>

      <OrbitControls />
    </Canvas>
  );
}
```

### 4. ビューワーページ

```typescript
// src/app/[locale]/viewer/page.tsx
'use client';

import dynamic from 'next/dynamic';

// SSR無効で読み込み（Three.jsはブラウザAPIに依存）
const GLBViewer = dynamic(() => import('@/components/GLBViewer'), {
  ssr: false,
});

export default function ViewerPage() {
  const [modelUid, setModelUid] = useState('0db8365fd0c44938b666345ef0f99d6d');

  return (
    <main>
      <input
        value={modelUid}
        onChange={(e) => setModelUid(e.target.value)}
      />
      <GLBViewer modelUid={modelUid} />
    </main>
  );
}
```

## セキュリティまとめ

| 情報 | 露出 | 理由 |
|------|------|------|
| Sketchfab APIトークン | ❌ 非公開 | サーバーサイドの環境変数で管理 |
| 署名付きS3 URL | ✅ 公開OK | 有効期限付き、特定ファイルのみ、読み取り専用 |

## 注意点

- **ダウンロード可能なモデルのみ対応**: Sketchfab上で作者が「downloadable」に設定したモデルのみAPIからダウンロードできます
- **署名付きURLの有効期限**: 数分で期限切れになるため、長時間放置後は再取得が必要です

## まとめ

Sketchfab APIを使ったGLBダウンロード・表示機能を、セキュリティを考慮して実装しました。

- APIトークンはサーバーサイドで管理し、クライアントには露出させない
- Sketchfabが返す署名付きURLを活用し、効率的にファイルを転送
- React Three Fiberで簡単に3Dビューワーを構築

ソースコードは以下で公開しています：
https://github.com/nakamura196/sketchfab-api-test
