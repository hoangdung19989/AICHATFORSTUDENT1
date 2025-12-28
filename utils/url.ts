
/**
 * Checks if a URL points to a direct video file.
 * Updated to handle query parameters (e.g., ?X-Amz-Algorithm=...)
 */
export const isDirectVideoUrl = (url: string): boolean => {
  if (!url) return false;
  // Cho phép đuôi file mp4/webm/ogg theo sau là kết thúc dòng ($) hoặc dấu chấm hỏi (?)
  return /\.(mp4|webm|ogg)($|\?)/i.test(url);
};

/**
 * Checks if a string is a YouTube URL or just a YouTube video ID.
 */
export const isYoutubeContent = (urlOrId: string): boolean => {
  if (!urlOrId) return false;
  const urlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  const idRegex = /^[a-zA-Z0-9_-]{11}$/;
  return urlRegex.test(urlOrId) || idRegex.test(urlOrId);
};

/**
 * Transforms a Google Drive sharing URL into an embeddable URL.
 */
export const transformGoogleDriveUrl = (url: string): string => {
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }
  return url;
};

/**
 * Transforms various YouTube URL formats or a direct video ID into a standard embed URL.
 */
export const transformYoutubeUrl = (urlOrId: string): string => {
    let videoId: string | null = null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    const match = urlOrId.match(regex);
    
    if (match && match[1]) {
        videoId = match[1];
    } else if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
        videoId = urlOrId;
    }

    if (videoId) {
        const params = new URLSearchParams({
            autoplay: '1',
            rel: '0',
            modestbranding: '1',
            iv_load_policy: '3',
            playsinline: '1',
        });
        return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }
    
    return urlOrId;
};
