export function convertGoogleDriveUrl(url: string): string {
  if (!url) return '';

  // Extract file ID from various Google Drive URL formats
  let fileId = '';

  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=drive_link
  // Format: https://drive.google.com/file/d/FILE_ID/view
  const shareMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (shareMatch) {
    fileId = shareMatch[1];
  }

  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  if (openMatch) {
    fileId = openMatch[1];
  }

  if (fileId) {
    // Use the direct file access URL for videos - this should work better for video streaming
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  // If not a Google Drive URL, return as is
  return url;
}

export function getGoogleDriveEmbedUrl(url: string): string {
  if (!url) return '';

  // Extract file ID from various Google Drive URL formats
  let fileId = '';

  // Format: https://drive.google.com/file/d/FILE_ID/view
  const shareMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (shareMatch) {
    fileId = shareMatch[1];
  }

  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  if (openMatch) {
    fileId = openMatch[1];
  }

  if (fileId) {
    // Convert to embeddable preview URL
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  return url;
}

export function isGoogleDriveUrl(url: string): boolean {
  return Boolean(url && url.includes('drive.google.com'));
}

export function isVideoFile(url: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const lowerUrl = url.toLowerCase();
  return (
    videoExtensions.some(ext => lowerUrl.includes(ext)) || lowerUrl.includes('drive.google.com')
  );
}
