import triviaVideos from '@/lib/trivia-videos.json'

/**
 * Pick the course-preview video for the trivia game end screen.
 *
 * Matched per-post in build-trivia-videos.py, from the book the trivia is
 * actually about. This used to return one of only TWO videos for all 81
 * trivia pages, so Ruth trivia showed a Creation video. Now 38 distinct
 * videos; run that script after adding trivia posts.
 *
 * Lives in lib/ rather than in the blog page so the embed route can reach it
 * too — a page file can only export Next's own conventions.
 */
export function getTriviaVideo(slug: string): { videoSrc: string; videoTitle: string } {
  const hit = (triviaVideos as Record<string, { videoSrc: string; videoTitle: string }>)[slug]
  if (hit) return hit
  return {
    videoSrc: 'https://d3g07v1w0lehiv.cloudfront.net/bible/genesis-series/01-in-the-beginning-creation/lesson-video.mp4',
    videoTitle: 'In the Beginning: Creation',
  }
}
