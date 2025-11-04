import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://at-mobiler-reifenservice.de';

  const serviceAreas = [
    'landshut',
    'ergolding',
    'altdorf',
    'essenbach',
    'moosburg-ad-isar',
  ];

  const cityPages = serviceAreas.map((city) => ({
    url: `${baseUrl}/service/${city}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/preise`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...cityPages,
  ];
}
