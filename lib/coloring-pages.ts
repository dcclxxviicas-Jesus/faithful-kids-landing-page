/**
 * The Bible coloring page set.
 *
 * Each scene gets its own page because each one is its own keyword, and every
 * single one came back at difficulty 0 with real volume (DataForSEO
 * clickstream, Aug 26 2026):
 *
 *   jesus coloring pages                     6,600/mo   KD 0
 *   christian easter coloring pages          1,900/mo   KD 0
 *   coloring page david and goliath          1,600/mo   KD 0
 *   coloring page for jonah and the whale    1,000/mo   KD 0
 *   days of creation coloring page           1,000/mo   KD 0
 *   coloring page adam and eve               1,000/mo   KD 0
 *   daniel and the lions den coloring page     880/mo   KD 0
 *   coloring page nativity scene               880/mo   KD 0
 *   armor of god coloring page                 720/mo   KD 0
 *   coloring page of moses                     590/mo   KD 0
 *
 * `keyword` below is the phrase that page is written to win. `blurb` is real
 * page content, not filler -- a scene page with one image and no text is thin,
 * and thin pages do not rank however low the difficulty.
 */

export type ColoringPage = {
  slug: string
  title: string
  keyword: string
  scripture: string
  ages: string
  blurb: string
  season?: 'easter' | 'christmas'
  story?: string   // matching blog post slug
}

export const COLORING_PAGES: ColoringPage[] = [
  {
    slug: 'creation',
    title: 'Creation',
    keyword: 'creation coloring page',
    scripture: 'Genesis 1',
    ages: 'Ages 4+',
    blurb: 'Sun, moon, stars, birds, fish and animals on one page — the whole of the first week in a single scene. Good for the youngest colorers because every shape is large and separate, and good for teaching because a child can point to each day as they work.',
    story: 'in-the-beginning-creation-for-kids',
  },
  {
    slug: 'adam-and-eve-garden',
    title: 'Adam and Eve in the Garden',
    keyword: 'adam and eve coloring page',
    scripture: 'Genesis 2',
    ages: 'Ages 4+',
    blurb: 'The garden before anything went wrong — a fruit tree, friendly animals, and two people at home in it. Worth coloring before you tell the harder half of the story, so children have the picture of what was lost.',
  },
  {
    slug: 'noahs-ark',
    title: "Noah's Ark",
    keyword: "noah's ark coloring page",
    scripture: 'Genesis 6–9',
    ages: 'Ages 3+',
    blurb: 'The ark on calm water with giraffes and elephants aboard, a dove with an olive branch, and the rainbow overhead. The most requested Bible coloring page there is, and the easiest place to start with a three-year-old.',
    story: 'noah-and-the-great-flood-for-kids',
  },
  {
    slug: 'moses-red-sea',
    title: 'Moses and the Red Sea',
    keyword: 'moses coloring page',
    scripture: 'Exodus 14',
    ages: 'Ages 5+',
    blurb: 'Moses with his staff raised and the sea standing in two walls with dry ground between. The two big blue shapes give a child something satisfying to fill, and the scale of it does the teaching without a word.',
  },
  {
    slug: 'david-and-goliath',
    title: 'David and Goliath',
    keyword: 'david and goliath coloring page',
    scripture: '1 Samuel 17',
    ages: 'Ages 5+',
    blurb: 'A small shepherd boy with a sling standing in front of an armored giant. The size difference is the entire point of the story, and it lands harder in a picture a child colors themselves than in any retelling.',
    story: 'david-and-goliath-for-kids',
  },
  {
    slug: 'daniel-lions-den',
    title: "Daniel in the Lions' Den",
    keyword: "daniel and the lions den coloring page",
    scripture: 'Daniel 6',
    ages: 'Ages 4+',
    blurb: 'Daniel praying calmly with three lions resting around him. Children usually expect this one to be frightening and are surprised that it is peaceful — which is a useful conversation to have while they color.',
    story: 'daniel-in-the-lions-den-for-kids',
  },
  {
    slug: 'the-fiery-furnace',
    title: 'The Fiery Furnace',
    keyword: 'fiery furnace coloring page',
    scripture: 'Daniel 3',
    ages: 'Ages 5+',
    blurb: 'Shadrach, Meshach and Abednego standing unharmed in the furnace with a fourth figure beside them. The flames are drawn as bold curves rather than detail, so they color in fast and look right.',
    story: 'the-fiery-furnace-for-kids',
  },
  {
    slug: 'jonah-and-the-big-fish',
    title: 'Jonah and the Big Fish',
    keyword: 'jonah and the whale coloring page',
    scripture: 'Jonah 1–2',
    ages: 'Ages 3+',
    blurb: 'A very large friendly fish with Jonah inside and a small boat on the horizon. One of the few Bible scenes children already know the shape of before you tell it, which makes it a good first page.',
  },
  {
    slug: 'baby-jesus-manger',
    title: 'Baby Jesus in the Manger',
    keyword: 'nativity coloring page',
    scripture: 'Luke 2',
    ages: 'Ages 3+',
    blurb: 'The manger with Mary, Joseph, a donkey and sheep, and the star above the stable. The Christmas page most families want, and simple enough that a preschooler can finish it in one sitting.',
    story: 'born-in-a-manger-for-kids',
  },
  {
    slug: 'jesus-and-the-children',
    title: 'Jesus and the Children',
    keyword: 'jesus coloring page',
    scripture: 'Mark 10:14',
    ages: 'Ages 3+',
    blurb: 'Jesus sitting outdoors with children gathered around him. If you only print one page, this is the one worth printing — it is the picture of Jesus most children carry longest, and it needs no explanation.',
  },
  {
    slug: 'jesus-calms-the-storm',
    title: 'Jesus Calms the Storm',
    keyword: 'jesus calms the storm coloring page',
    scripture: 'Mark 4',
    ages: 'Ages 5+',
    blurb: 'A small boat on rough water with a calm figure standing, one hand raised, and the clouds beginning to part. Useful for children who are frightened of storms, which is most of them at some point.',
    story: 'calming-the-storm-for-kids',
  },
  {
    slug: 'the-good-shepherd',
    title: 'The Good Shepherd',
    keyword: 'good shepherd coloring page',
    scripture: 'John 10',
    ages: 'Ages 3+',
    blurb: 'A shepherd carrying one lamb on his shoulders with the flock around him. Gentle enough for the very youngest, and the image behind Psalm 23 if you are teaching that alongside it.',
  },
  {
    slug: 'the-lost-sheep',
    title: 'The Lost Sheep',
    keyword: 'lost sheep coloring page',
    scripture: 'Luke 15',
    ages: 'Ages 4+',
    blurb: 'A shepherd with a lantern searching a dark hillside, one sheep found among the rocks. Ask a child why he left ninety-nine to find one while they are coloring and you will get a better answer than a lesson would produce.',
  },
  {
    slug: 'the-good-samaritan',
    title: 'The Good Samaritan',
    keyword: 'good samaritan coloring page',
    scripture: 'Luke 10',
    ages: 'Ages 5+',
    blurb: 'A traveler kneeling to help an injured man at the roadside with a donkey waiting. The parable children find easiest to act on, and this page gives them something to hold while you talk about it.',
    story: 'the-good-samaritan-for-kids',
  },
  {
    slug: 'the-empty-tomb',
    title: 'The Empty Tomb',
    keyword: 'easter coloring page christian',
    scripture: 'Matthew 28',
    ages: 'Ages 4+',
    blurb: 'The stone rolled away, the tomb open, sunrise behind it. The Easter page for families who want the resurrection rather than the rabbits, and it works for church, home or a class.',
    story: 'the-empty-tomb-for-kids',
  },
  // --- Christmas set. "nativity coloring pages" 1,632/mo KD 0,
  //     "christian christmas coloring pages" 880/mo KD 0, "advent" 880/mo KD 0
  {
    slug: 'angel-visits-mary',
    title: 'An Angel Visits Mary',
    keyword: 'angel gabriel coloring page',
    scripture: 'Luke 1:26-38',
    ages: 'Ages 4+',
    season: 'christmas',
    blurb: 'Gabriel speaking to Mary in a plain room with light coming through the window. The quietest page in the Christmas set, and the one that starts the whole story — worth printing first if you are working through Advent in order.',
    story: 'an-angel-visits-mary-for-kids',
  },
  {
    slug: 'journey-to-bethlehem',
    title: 'The Journey to Bethlehem',
    keyword: 'journey to bethlehem coloring page',
    scripture: 'Luke 2:1-5',
    ages: 'Ages 4+',
    season: 'christmas',
    blurb: 'Joseph leading the donkey with Mary along a night road, one large star ahead and the town in the distance. Children rarely picture how far they walked until they color the road.',
  },
  {
    slug: 'nativity-scene',
    title: 'The Nativity Scene',
    keyword: 'nativity scene coloring page',
    scripture: 'Luke 2:6-20',
    ages: 'Ages 3+',
    season: 'christmas',
    blurb: 'The full stable — manger, Mary and Joseph, shepherds kneeling, the ox and sheep, and the star above. The one page that holds the whole Christmas story, and the best choice for a class where everyone colors the same sheet.',
  },
  {
    slug: 'shepherds-and-angels',
    title: 'The Shepherds and the Angels',
    keyword: 'shepherds coloring page',
    scripture: 'Luke 2:8-14',
    ages: 'Ages 4+',
    season: 'christmas',
    blurb: 'Shepherds on the hillside looking up at angels in the night sky. The moment the news went to the least important people in the story first, which is worth saying out loud while they color it.',
    story: 'the-shepherds-for-kids',
  },
  {
    slug: 'wise-men-star',
    title: 'The Wise Men Follow the Star',
    keyword: 'wise men coloring page',
    scripture: 'Matthew 2:1-12',
    ages: 'Ages 4+',
    season: 'christmas',
    blurb: 'Three travelers on camels crossing the desert under one very large star, carrying gifts. Good for the end of Advent, since they arrived long after the night everyone pictures.',
  },
  // --- Easter set. "religious easter coloring pages" 1,900/mo KD 0,
  //     "palm sunday coloring page" 1,300/mo KD 0
  {
    slug: 'palm-sunday',
    title: 'Palm Sunday',
    keyword: 'palm sunday coloring page',
    scripture: 'Matthew 21:1-11',
    ages: 'Ages 4+',
    season: 'easter',
    blurb: 'Jesus riding a donkey through the city gate while children wave palm branches and lay cloaks on the road. The page most Sunday schools need one week a year, and it is the happiest scene in Holy Week.',
  },
  {
    slug: 'the-last-supper',
    title: 'The Last Supper',
    keyword: 'last supper coloring page',
    scripture: 'Luke 22:14-20',
    ages: 'Ages 5+',
    season: 'easter',
    blurb: 'A long table with bread and a cup, friends seated on both sides. Drawn simply rather than as the famous painting, so a child sees a meal among friends instead of a work of art.',
  },
  {
    slug: 'the-cross',
    title: 'The Cross',
    keyword: 'cross coloring page',
    scripture: 'Luke 23',
    ages: 'Ages 5+',
    season: 'easter',
    blurb: 'An empty cross on a hill with a folded cloth over one arm and light behind it. Deliberately gentle — the cross without the crucifixion, so it can be used with younger children whose parents are not ready for the rest.',
  },
  {
    slug: 'resurrection-morning',
    title: 'Resurrection Morning',
    keyword: 'resurrection coloring page',
    scripture: 'Matthew 28:1-10',
    ages: 'Ages 4+',
    season: 'easter',
    blurb: 'Two women arriving at the open tomb at sunrise with an angel seated on the stone. The page that carries Easter morning, and the one to pair with the empty tomb sheet.',
  },
  {
    slug: 'road-to-emmaus',
    title: 'The Road to Emmaus',
    keyword: 'road to emmaus coloring page',
    scripture: 'Luke 24:13-35',
    ages: 'Ages 6+',
    season: 'easter',
    blurb: 'Three travelers walking a country road at dusk, one of them talking. The story where nobody recognises him until supper, which older children find genuinely interesting once they notice it.',
  },
  {
    slug: 'armor-of-god',
    title: 'The Armor of God',
    keyword: 'armor of god coloring page',
    scripture: 'Ephesians 6',
    ages: 'Ages 5+',
    blurb: 'A child wearing the helmet, breastplate and belt, holding a shield and sword. Each piece is drawn separately so you can name them one at a time as they color — the rare page that is a lesson plan by itself.',
  },
]

export const CDN = 'https://d3g07v1w0lehiv.cloudfront.net/coloring-pages'
export const PDF_URL = `${CDN}/faithful-kids-bible-coloring-pages.pdf`

export function getColoringPage(slug: string) {
  return COLORING_PAGES.find(p => p.slug === slug)
}
