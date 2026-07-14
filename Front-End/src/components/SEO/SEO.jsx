import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'ThinkEasy';
const DEFAULT_DESCRIPTION = 'Discover profitable business opportunities in India — real market data, investment ranges, growth rates, and ROI scoring, ranked live.';
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://thinkeasy.example.com';

// One shared component every page uses instead of hand-rolling <head>
// tags — keeps title format, OG defaults, and JSON-LD structure
// consistent across the app.
export default function SEO({
  title, description = DEFAULT_DESCRIPTION, path = '', image, noIndex = false, jsonLd,
}) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Discover Profitable Businesses`;
  const canonical = `${SITE_URL}${path}`;
  const ogImage = image || `${SITE_URL}/og-default.png`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* OpenGraph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}

export function businessJsonLd(biz, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: biz.name,
    description: biz.overview || undefined,
    category: biz.category || undefined,
    url,
    ...(biz.investment ? { offers: { '@type': 'Offer', price: biz.investment, priceCurrency: 'INR' } } : {}),
  };
}

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
