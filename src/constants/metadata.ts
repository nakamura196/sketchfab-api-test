export const SITE_CONFIG = {
  name: {
    ja: 'Sketchfab GLB Viewer',
    en: 'Sketchfab GLB Viewer',
  },
  description: {
    ja: 'Sketchfab APIを使用してGLBファイルをダウンロード・表示するWebアプリ',
    en: 'A web app to download and view GLB files using the Sketchfab API',
  },
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  ogImage: {
    ja: '/ogp-ja.svg',
    en: '/ogp-en.svg',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@yoursite',
    creator: '@yourcreator',
  },
} as const;

export const getMetadata = (locale: 'ja' | 'en') => {
  const title = SITE_CONFIG.name[locale];
  const description = SITE_CONFIG.description[locale];
  const ogImage = SITE_CONFIG.ogImage[locale];

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    metadataBase: new URL(SITE_CONFIG.url),
    openGraph: {
      title,
      description,
      url: SITE_CONFIG.url,
      siteName: title,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'ja' ? 'ja_JP' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: SITE_CONFIG.twitter.card,
      title,
      description,
      site: SITE_CONFIG.twitter.site,
      creator: SITE_CONFIG.twitter.creator,
      images: [ogImage],
    },
    alternates: {
      canonical: SITE_CONFIG.url,
      languages: {
        'ja': `${SITE_CONFIG.url}/ja`,
        'en': `${SITE_CONFIG.url}/en`,
      },
    },
  };
};

export const getPageMetadata = (
  locale: 'ja' | 'en',
  page: {
    title: string;
    description?: string;
    ogImage?: string;
  }
) => {
  const siteTitle = SITE_CONFIG.name[locale];
  const defaultDescription = SITE_CONFIG.description[locale];
  const defaultOgImage = SITE_CONFIG.ogImage[locale];

  return {
    title: `${page.title} | ${siteTitle}`,
    description: page.description || defaultDescription,
    openGraph: {
      title: `${page.title} | ${siteTitle}`,
      description: page.description || defaultDescription,
      images: [
        {
          url: page.ogImage || defaultOgImage,
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
    },
    twitter: {
      card: SITE_CONFIG.twitter.card,
      title: `${page.title} | ${siteTitle}`,
      description: page.description || defaultDescription,
      images: [page.ogImage || defaultOgImage],
    },
  };
};
