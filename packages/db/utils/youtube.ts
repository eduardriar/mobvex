/* YouTube link parsing/embedding + oEmbed lookup, shared by the trainer web
   app (fetches the preview at save time) and the mobile app (classifies
   Exercise.media_url as YouTube vs. image at render time). */

const YOUTUBE_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?(?:.*&)?v=|youtube\.com\/shorts\/|youtube\.com\/embed\/|youtu\.be\/)([\w-]{11})/,
];

/** Extracts the 11-char video ID from a watch/youtu.be/shorts/embed URL. Returns null for anything else, including image URLs. */
export function parseYouTubeVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1] ?? null;
  }
  return null;
}

/** Single detection point: is this exercise media link a YouTube video (vs. a direct image link)? */
export function isYouTubeUrl(url: string): boolean {
  return parseYouTubeVideoId(url) !== null;
}

type YouTubeOEmbedResult = {
  title: string;
  thumbnailUrl: string;
};

/** Fetches title + thumbnail from YouTube's public oEmbed endpoint (no API key, CORS-enabled). Call only when isYouTubeUrl(url) is true. */
export async function fetchYouTubeOEmbed(
  url: string,
): Promise<YouTubeOEmbedResult | null> {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;

  const response = await fetch(oembedUrl);
  if (!response.ok) return null;

  const data: unknown = await response.json();
  if (
    typeof data !== 'object' ||
    data === null ||
    typeof (data as Record<string, unknown>).title !== 'string' ||
    typeof (data as Record<string, unknown>).thumbnail_url !== 'string'
  ) {
    return null;
  }

  const { title, thumbnail_url: thumbnailUrl } = data as {
    title: string;
    thumbnail_url: string;
  };
  return { title, thumbnailUrl };
}
