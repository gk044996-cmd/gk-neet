import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description }) {
  return (
    <Helmet>
      <title>{title} | GK NEET MOCK</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
}
