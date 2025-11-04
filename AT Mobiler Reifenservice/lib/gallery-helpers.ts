import type { GalleryImage } from './types';

export function sanitizeGalleryImage(data: Partial<GalleryImage>): Partial<GalleryImage> {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function toTags(str: string): string[] {
  if (!str || !str.trim()) return [];
  return str
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

export function fromTags(tags: string[]): string {
  return tags.join(', ');
}

export function validateImgurUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'i.imgur.com';
  } catch {
    return false;
  }
}

export async function uploadToImgur(file: File, clientId: string): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: {
      'Authorization': `Client-ID ${clientId}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Imgur upload fehlgeschlagen');
  }

  const data = await response.json();
  return data.data.link;
}
