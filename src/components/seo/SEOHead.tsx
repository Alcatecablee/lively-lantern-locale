import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = 'NeuroLint - AI-powered code analysis and optimization tool',
  keywords = ['code analysis', 'AI', 'optimization', 'developer tools'],
  ogImage = '/og-image.png',
  ogType = 'website',
  twitterCard = 'summary_large_image'
}) => {
  const siteUrl = window.location.origin;
  const canonicalUrl = window.location.href;

  return (
    <Helmet>
      <title>{title} | NeuroLint</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content="NeuroLint" />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
};