const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

export function parseYouTubeVideoId(input: string) {
  const value = input.trim()
  if (!value) return null
  if (/[<>]/.test(value)) return null
  if (YOUTUBE_ID_PATTERN.test(value)) return value

  try {
    const url = new URL(value)
    const hostname = url.hostname.replace(/^www\./, '').toLowerCase()

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      const watchId = url.searchParams.get('v')
      if (watchId && YOUTUBE_ID_PATTERN.test(watchId)) return watchId

      const parts = url.pathname.split('/').filter(Boolean)
      if ((parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') && parts[1] && YOUTUBE_ID_PATTERN.test(parts[1])) {
        return parts[1]
      }
    }

    if (hostname === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      if (id && YOUTUBE_ID_PATTERN.test(id)) return id
    }
  } catch {
    return null
  }

  return null
}

export function getYouTubeEmbedUrl(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
}

export function isValidYouTubeVideoId(videoId: string) {
  return YOUTUBE_ID_PATTERN.test(videoId)
}
