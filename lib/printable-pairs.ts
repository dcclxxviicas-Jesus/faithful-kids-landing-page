/**
 * Which printables are about the same story, and which blog post tells it.
 *
 * The two printable sets shipped as separate silos: a coloring detail page
 * linked only to other coloring pages, a word search only to other word
 * searches, and the word searches linked to no blog post at all. So the Noah
 * coloring sheet and the Noah word search -- the two most obviously related
 * pages on the site -- had no connection between them.
 *
 * That matters twice over. It wastes the strongest contextual link each page
 * could have, and it makes a visitor who wants more of the same story hunt for
 * it through a hub.
 *
 * Every blog slug here is verified to exist in content/blog. A guessed slug is
 * how three broken links shipped before check-links.py existed.
 */

/** Coloring scene -> the word search covering the same story. */
export const COLORING_TO_WORDSEARCH: Record<string, string> = {
  'noahs-ark': 'noahs-ark',
  'david-and-goliath': 'david-and-goliath',
  'armor-of-god': 'armor-of-god',
  'daniel-lions-den': 'daniel',
  'moses-red-sea': 'moses',
  'jesus-calms-the-storm': 'jesus-miracles',
  // Christmas scenes all feed the one nativity-vocabulary puzzle.
  'nativity-scene': 'christmas',
  'baby-jesus-manger': 'christmas',
  'journey-to-bethlehem': 'christmas',
  'angel-visits-mary': 'christmas',
  'shepherds-and-angels': 'christmas',
  'wise-men-star': 'christmas',
  // Holy Week and resurrection scenes feed the Easter puzzle.
  'the-empty-tomb': 'easter',
  'resurrection-morning': 'easter',
  'the-cross': 'easter',
  'palm-sunday': 'easter',
  'the-last-supper': 'easter',
  'road-to-emmaus': 'easter',
}

/**
 * Word search -> the single best matching coloring scene.
 * Not simply the inverse: six Christmas scenes map to one puzzle, so coming
 * back the other way has to choose one. Left out where no scene fits, rather
 * than forcing a loose pair (fruit-of-the-spirit and books-of-the-bible have
 * no coloring equivalent).
 */
export const WORDSEARCH_TO_COLORING: Record<string, string> = {
  'noahs-ark': 'noahs-ark',
  'christmas': 'nativity-scene',
  'easter': 'the-empty-tomb',
  'david-and-goliath': 'david-and-goliath',
  'moses': 'moses-red-sea',
  'daniel': 'daniel-lions-den',
  'armor-of-god': 'armor-of-god',
  'jesus-miracles': 'jesus-calms-the-storm',
}

/**
 * Word search -> the blog post that tells the story.
 * The coloring pages already carry this (`story` in lib/coloring-pages.ts);
 * the word searches had no equivalent.
 */
export const WORDSEARCH_STORY: Record<string, string> = {
  'noahs-ark': 'noah-and-the-great-flood-for-kids',
  'christmas': 'the-christmas-story-for-kids',
  'easter': 'the-empty-tomb-for-kids',
  'david-and-goliath': 'david-and-goliath-for-kids',
  'fruit-of-the-spirit': 'the-fruit-of-the-spirit-for-kids',
  'books-of-the-bible': 'books-of-the-bible-for-kids',
  'moses': 'crossing-the-red-sea-for-kids',
  'jesus-miracles': 'feeding-the-five-thousand-for-kids',
  'daniel': 'daniel-in-the-lions-den-for-kids',
  'armor-of-god': 'the-armor-of-god-for-kids',
}
