# Sketchfab GLB Viewer

Sketchfab APIを使用してGLBファイルをダウンロード・表示するNext.jsアプリケーション。

## 概要

このプロジェクトは、Sketchfab APIを利用して3DモデルをGLB形式でダウンロードし、ブラウザ上でThree.jsを使って表示するWebアプリケーションです。

## 技術スタック

- **Next.js 16** - React フレームワーク
- **React Three Fiber** - React用Three.jsラッパー
- **@react-three/drei** - Three.js用便利コンポーネント集
- **Tailwind CSS** - スタイリング
- **next-intl** - 国際化対応
- **next-themes** - ダークモード対応

## アーキテクチャ

### セキュリティを考慮した設計

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Client       │────▶│   Next.js API   │────▶│  Sketchfab API  │
│   (Browser)     │     │    (Server)     │     │                 │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        │                                               │
        │           ┌─────────────────┐                │
        │           │                 │                │
        └──────────▶│   S3 (GLB)      │◀───────────────┘
                    │  署名付きURL     │
                    │                 │
                    └─────────────────┘
```

1. **クライアント** → Next.js APIにモデルUIDをリクエスト
2. **Next.js API** → Sketchfab APIにAPIトークンを使ってダウンロードURLを取得
3. **Sketchfab API** → 署名付きS3 URLを返す
4. **Next.js API** → クライアントに署名付きURLを返す
5. **クライアント** → S3から直接GLBをダウンロード・表示

### なぜこの設計？

- **APIトークンの保護**: Sketchfab APIトークンはサーバーサイドでのみ使用され、クライアントには露出しない
- **効率的なデータ転送**: GLBファイルはサーバーを経由せず、直接S3からクライアントへ転送される
- **署名付きURLの安全性**: S3の署名付きURLは一時的（数分で期限切れ）で、特定ファイルへのアクセスのみ許可

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SKETCHFAB_API_TOKEN=your_sketchfab_api_token_here
```

Sketchfab APIトークンは [Sketchfab Settings](https://sketchfab.com/settings/password) から取得できます。

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000/ja/viewer でビューワーにアクセスできます。

## 使い方

1. ビューワーページにアクセス
2. Sketchfab Model UIDを入力（URLの末尾部分）
3. 「Load Model」ボタンをクリック
4. 3Dモデルが表示される

### Model UIDの取得方法

Sketchfab URLからUIDを取得:
```
https://sketchfab.com/3d-models/model-name-0db8365fd0c44938b666345ef0f99d6d
                                            └─────────────────────────────────┘
                                                          UID
```

### 操作方法

- **左クリック + ドラッグ**: 回転
- **右クリック + ドラッグ**: パン
- **スクロール**: ズーム

## API エンドポイント

### GET /api/sketchfab/download

GLBダウンロードURLを取得。

**パラメータ:**
- `uid` (required): Sketchfab Model UID
- `proxy` (optional): `true`にするとサーバー経由でファイルを返す

**レスポンス:**
```json
{
  "url": "https://sketchfab-prod-media.s3.amazonaws.com/...",
  "size": 1004808,
  "expires": 300,
  "formats": {
    "glb": { "url": "...", "size": 1004808 },
    "gltf": { "url": "...", "size": 7258551 },
    "usdz": { "url": "...", "size": 1644780 }
  }
}
```

### GET /api/sketchfab/model

モデル情報を取得。

**パラメータ:**
- `uid` (required): Sketchfab Model UID

**レスポンス:**
```json
{
  "uid": "0db8365fd0c44938b666345ef0f99d6d",
  "name": "Model Name",
  "description": "...",
  "isDownloadable": true,
  "thumbnails": { ... }
}
```

## プロジェクト構造

```
src/
├── app/
│   ├── api/
│   │   └── sketchfab/
│   │       ├── download/route.ts  # GLBダウンロードAPI
│   │       └── model/route.ts     # モデル情報API
│   └── [locale]/
│       ├── layout.tsx
│       ├── page.tsx
│       └── viewer/
│           └── page.tsx           # GLBビューワーページ
├── components/
│   ├── GLBViewer.tsx              # 3Dビューワーコンポーネント
│   └── layout/
└── ...
```

## 注意事項

- ダウンロード可能なモデルのみ対応（作者が「downloadable」に設定したモデル）
- 署名付きURLは数分で期限切れになるため、長時間放置後は再読み込みが必要

## ライセンス

MIT
