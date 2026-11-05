import '../../home.css'
import '../../v2-pages.css'
import '../bible-literacy/research.css'
import d from '@/lib/research/video.json'
import { Bars, CDN, Finding, Honest, Method, StudyPage, Takeaways, fmt, pctOf, rd, studyMetadata, type Study } from '../ui'

/* Figures from lib/research/video.json. Starts Sep 1, 2026 because the player
   changed on Aug 31. Unit is one person on one story. No em-dashes. */
const MIN = 15
const p = d.pairs
const done = pctOf(p.complete, p.players), half = pctOf(p.half, p.players)
const name = (slug: string) => slug.replace(/-for-kids$/, '').split('-').map((w, i) => (i && /^(the|of|and|a|an|in|for|from|to|his)$/.test(w) ? w : w[0].toUpperCase() + w.slice(1))).join(' ')
const rated = d.stories.filter(x => x.players >= MIN).map(x => ({ ...x, rate: pctOf(x.complete, x.players) })).sort((a, b) => b.rate - a.rate)
const row = (x: (typeof rated)[number]) => ({ label: name(x.slug), sub: `${x.players} viewers${x.seconds ? `, ${Math.floor(x.seconds / 60)}:${String(x.seconds % 60).padStart(2, '0')} long` : ''}`, pct: x.rate, n: x.players })
const L = d.by_length as Record<string, { stories: number; players: number; complete: number }>
const devices = (d.devices as unknown as [string, number, number][]).filter(x => x[0] && x[1] >= 30)

const s: Study = {
  path: '/research/bible-video-completion',
  title: 'Do People Finish a Bible Story Video?',
  h1: `Do People Finish a Two-Minute Bible Story? ${rd(done)}% Do.`,
  description: `${fmt(d.people)} people pressed play on our free Bible story videos. ${rd(half)}% reached halfway and ${rd(done)}% reached the end. Results by story, length and device.`,
  updated: 'November 4, 2026', updatedIso: '2026-11-04', dataLabel: 'Sep 1 to Nov 4, 2026', temporal: '2026-09-01/2026-11-04',
  datasetName: 'Bible Video Completion',
  datasetDescription: `Play, halfway and completion events from ${fmt(d.people)} people across ${d.stories.length} free Bible story videos on faithfulkids.app. Each video starts only when a visitor presses play.`,
  measured: ['people who pressed play', 'people reaching halfway', 'people reaching the end', 'video length'],
  art: `${CDN}/blog-images/in-the-beginning-creation-for-kids-hero.webp?v=3`, artAlt: 'An illustration of the creation of the world',
}
export const metadata = studyMetadata(s)

export default function Page() {
  return (
    <StudyPage s={s}
      lede={<>We publish free Bible story videos, each about two minutes long, on our story pages. {fmt(d.people)} people pressed play this fall. Of each person who started a story, {rd(half)}% reached the halfway point and {rd(done)}% reached the end. Length made little difference within this narrow range. The story itself seems to matter more.</>}
      cap={<><b>{rd(done)}%</b> reached the end ({fmt(p.players)} person and story pairs)</>}
      stats={[
        { value: fmt(d.people), label: 'people pressed play' },
        { value: fmt(d.plays), label: 'total plays' },
        { value: `${rd(half)}%`, label: 'reached halfway' },
        { value: `${rd(done)}%`, label: 'reached the end' },
      ]}>
      <Honest title="What this does and does not measure">
        <p>These viewers chose to press play on a Bible story page, so they already wanted the story. The videos do not autoplay. We cannot tell who is watching: a parent previewing, a teacher, or a child. Reaching the end means the video played to its last moments, not that anyone was paying attention.</p>
        <p>Many stories have only a few viewers, so differences between single stories could be chance. The story charts only show stories with at least {MIN} viewers.</p>
      </Honest>
      <Finding id="findings" num="Finding 1" title="Most drop-off comes in the first half" intro={<>Of the people who started, {rd(100 - half)}% were gone before halfway. Those who made it to halfway mostly stayed: {rd(pctOf(p.complete, p.half))}% of them finished.</>}>
        <div className="rs-chart-grid">
          <Bars title="How far viewers got" sub={`${fmt(p.players)} person and story pairs`} rows={[{ label: 'Pressed play', pct: 100, n: p.players }, { label: 'Reached halfway', pct: half, n: p.players }, { label: 'Reached the end', pct: done, n: p.players }]} />
          <Bars title="Reached the end, by video length" sub="All these videos are short, so the range tested is narrow" rows={['under 2:00', '2:00 to 2:29', '2:30 and over'].filter(k => L[k]).map(k => ({ label: k, sub: `${L[k].stories} stories, ${fmt(L[k].players)} viewers`, pct: pctOf(L[k].complete, L[k].players), n: L[k].players }))} />
        </div>
      </Finding>
      <Finding alt="is-alt" num="Finding 2" title="Some stories hold people far better than others" intro={<>Among stories with at least {MIN} viewers, the share reaching the end ran from {rd(rated[rated.length - 1].rate)}% to {rd(rated[0].rate)}%. With samples this small, treat the order as a lead for further study rather than a ranking.</>}>
        <div className="rs-chart-grid">
          <Bars title="Held viewers best" rows={rated.slice(0, 6).map(row)} />
          <Bars title="Held viewers least" rows={rated.slice(-6).reverse().map(row)} />
        </div>
      </Finding>
      <Finding num="Finding 3" title="Phones and computers look similar" intro="Viewers on phones finished at least as often as viewers on computers.">
        <div className="rs-chart-grid">
          <Bars title="People who reached the end of any story, by device" sub="Share of people who pressed play on that device" rows={devices.map(x => ({ label: x[0], sub: `${fmt(x[1])} people`, pct: pctOf(x[2], x[1]), n: x[1] }))} />
        </div>
      </Finding>
      <Takeaways items={[
        <>The first minute is where a Bible story is won or lost in this data. If you tell a story to a child, spend your effort on the opening.</>,
        <>Going from about 90 seconds to about three minutes made little difference here. That does not mean length never matters. We have not tested anything longer.</>,
        <>We cannot say from this whether watching taught anyone anything. Completion is attention at best, and learning needs its own measure.</>,
      ]} />
      <Method cards={[
        { h: 'What was counted', p: <>Play, halfway and completion events on the free story videos at faithfulkids.app, from September 1 to November 4, 2026. The window starts there because our video player changed on August 31 and earlier figures are not comparable.</> },
        { h: 'The unit', p: <>One person on one story, counted once however many times they replayed it. {fmt(d.people)} people produced {fmt(p.players)} of these pairs. A browser counts as a person, so someone on two devices counts twice.</> },
        { h: 'What was removed', p: <>Visitors who arrived from paid ads, because some ad traffic was low quality. Halfway is capped at the number of starters for each story.</> },
        { h: 'Video length', p: <>Measured directly from the video files. {d.stories.length} stories had at least one viewer in the window, and only stories with at least {MIN} viewers appear in the story charts.</> },
      ]} />
    </StudyPage>
  )
}
