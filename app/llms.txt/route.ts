import { getAllPosts, getAllSeriesNames } from '@/lib/blog'

export const dynamic = 'force-static'

// llms.txt — a curated site map for AI crawlers and answer engines.
// Spec: https://llmstxt.org
export async function GET() {
  const posts = getAllPosts()
  const series = getAllSeriesNames()
  const listicles = posts.filter(p => p.type === 'listicle')

  const lines: string[] = [
    '# Faithful Kids',
    '',
    '> Faithful Kids (faithfulkids.app) is a video learning platform that teaches kids ages 5-15 the Bible through short narrated video lessons, comprehension quizzes, and reflections. It covers the full biblical narrative from Genesis to Revelation across 20 series and 200 episodes. The blog offers free, parent-friendly retellings of every Bible story plus practical guides for Christian families.',
    '',
    'Key facts:',
    '- Every Bible story is retold in simple language for kids, with age guidance, discussion questions, key verses, and a parent guide',
    '- Content is written for parents, teachers, and homeschool families',
    '- The app pairs each story with a 60-second video lesson and quiz (7-day free trial at https://faithfulkids.app/quiz)',
    '',
    '## Main pages',
    '',
    '- [Home](https://faithfulkids.app): What Faithful Kids is and how it works',
    '- [Blog index](https://faithfulkids.app/blog): All Bible stories and family guides',
    '- [Start free trial](https://faithfulkids.app/quiz): Personalized quiz and 7-day free trial',
    '',
    '## Guides for Christian families',
    '',
    ...listicles.map(p => `- [${p.title}](https://faithfulkids.app/blog/${p.slug}): ${p.metaDescription}`),
    '',
    '## Bible story series (kid-friendly retellings)',
    '',
    ...series.map(s => `- [${s.name}](https://faithfulkids.app/blog/series/${s.slug}): ${s.count} stories explained for kids`),
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
