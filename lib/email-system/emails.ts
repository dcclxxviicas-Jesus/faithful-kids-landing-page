// Generated once from the approved copy (Nov 2026); hand-edited source since
// Nov 16, 2026 (nothing regenerates it). Edit the copy here; keep the
// {{tokens}}: buildEmail() refuses to send while one is unfilled.
import type { Block, EmailStyle } from './render'

export interface EmailDef {
  path: string
  step: string
  from: 'brand' | 'christian'
  style: EmailStyle
  /** Billing email: sent even to people who unsubscribed, no unsubscribe link. */
  billing: boolean
  reason: string
  subjects: string[]
  pre: string
  tokens: string[]
  blocks: Block[]
}

export const EMAILS = {
 "printable/1": {
  "path": "printable",
  "step": "1",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You requested a free resource from Faithful Kids.",
  "subjects": [
   "{{magnet_subject}}",
   "25 nights your kids won’t forget",
   "Start this on December 1"
  ],
  "pre": "{{magnet_pre}}",
  "tokens": [
   "magnet_headline",
   "magnet_img",
   "magnet_line",
   "magnet_pre",
   "magnet_short",
   "magnet_subject",
   "magnet_tip",
   "magnet_url",
   "source"
  ],
  "blocks": [
   [
    "eyebrow",
    "Your free printable"
   ],
   [
    "h",
    "{{magnet_headline}}"
   ],
   [
    "p",
    "{{magnet_line}}"
   ],
   [
    "img",
    "{{magnet_img}}",
    "Preview of the Advent Readings printable",
    "{{magnet_url}}utm_source=email&utm_medium=printable&utm_campaign=printable-1&utm_content={{source}}",
    false,
    "sheet"
   ],
   [
    "btn",
    "Open my {{magnet_short}}",
    "{{magnet_url}}utm_source=email&utm_medium=printable&utm_campaign=printable-1&utm_content={{source}}"
   ],
   [
    "h3",
    "Make it easy on yourself"
   ],
   [
    "p",
    "{{magnet_tip}}"
   ],
   [
    "p",
    "Over the next nine days, we’ll send a few more free things for your family, and a short introduction to our app."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "printable/2": {
  "path": "printable",
  "step": "2",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You requested a free resource from Faithful Kids.",
  "subjects": [
   "Too tired for bedtime stories?",
   "Tonight’s bedtime, done for you",
   "The 5 minutes before lights out"
  ],
  "pre": "A short story, a simple prayer and one good question for each night.",
  "tokens": [
   "source"
  ],
  "blocks": [
   [
    "eyebrow",
    "Another free printable"
   ],
   [
    "h",
    "Bedtime, already planned for you"
   ],
   [
    "p",
    "Bedtime is when kids finally slow down and want to talk. It’s also when you’re most tired."
   ],
   [
    "p",
    "So we did the planning. The Bedtime Bible Kit gives you seven nights: a short story, a simple prayer and one question to talk about together."
   ],
   [
    "img",
    "page--bedtime-bible-kit",
    "Preview of the Bedtime Bible Kit",
    "https://faithfulkids.app/printables/bedtime-bible-kit?utm_source=email&utm_medium=printable&utm_campaign=printable-2&utm_content={{source}}",
    false,
    "sheet"
   ],
   [
    "btn",
    "Get the Bedtime Bible Kit",
    "https://faithfulkids.app/printables/bedtime-bible-kit?utm_source=email&utm_medium=printable&utm_campaign=printable-2&utm_content={{source}}"
   ],
   [
    "p",
    "Try night one tonight. It only takes about five minutes."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "printable/3": {
  "path": "printable",
  "step": "3",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You requested a free resource from Faithful Kids.",
  "subjects": [
   "What’s your child’s Goliath?",
   "Every child has a giant",
   "When your child feels small"
  ],
  "pre": "Watch David and Goliath together, then ask the one question below.",
  "tokens": [
   "source"
  ],
  "blocks": [
   [
    "eyebrow",
    "A free story for tonight"
   ],
   [
    "h",
    "A story for when something feels too big"
   ],
   [
    "p",
    "A new school. A hard test. The dark. Every child has a giant."
   ],
   [
    "p",
    "A whole army looked at Goliath and saw someone too big to fight. David looked at the same giant and remembered how big God is."
   ],
   [
    "img",
    "david-and-goliath",
    "Watch the David and Goliath Bible story",
    "https://faithfulkids.app/blog/david-and-goliath-for-kids?utm_source=email&utm_medium=printable&utm_campaign=printable-3&utm_content={{source}}",
    true,
    "wide"
   ],
   [
    "btn",
    "Watch David and Goliath",
    "https://faithfulkids.app/blog/david-and-goliath-for-kids?utm_source=email&utm_medium=printable&utm_campaign=printable-3&utm_content={{source}}"
   ],
   [
    "h3",
    "Ask this afterwards"
   ],
   [
    "p",
    "“What feels like a giant to you right now?” Then just listen. You may hear something new."
   ],
   [
    "p",
    "This story is from the Faithful Kids app, where Jesus tells kids the Bible in about two minutes, with a short quiz after each story."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "printable/4": {
  "path": "printable",
  "step": "4",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You requested a free resource from Faithful Kids.",
  "subjects": [
   "For the child who hates waiting",
   "“Are we there yet?” Try Noah",
   "Why God made the rainbow"
  ],
  "pre": "A free two-minute story about trusting God when things take a long time.",
  "tokens": [
   "source"
  ],
  "blocks": [
   [
    "eyebrow",
    "Another free story"
   ],
   [
    "h",
    "The hardest part of Noah’s story was the waiting"
   ],
   [
    "p",
    "Kids remember the animals and the giant boat. What’s easy to miss is how long Noah’s family waited inside it for the water to go down."
   ],
   [
    "p",
    "Then God put a rainbow in the sky as a promise. It’s a gentle way to talk with your child about trusting God when something takes a long time."
   ],
   [
    "img",
    "noah-and-the-great-flood",
    "Watch Noah and the Great Flood",
    "https://faithfulkids.app/blog/noah-and-the-great-flood-for-kids?utm_source=email&utm_medium=printable&utm_campaign=printable-4&utm_content={{source}}",
    true,
    "wide"
   ],
   [
    "btn",
    "Watch Noah’s story",
    "https://faithfulkids.app/blog/noah-and-the-great-flood-for-kids?utm_source=email&utm_medium=printable&utm_campaign=printable-4&utm_content={{source}}"
   ],
   [
    "p",
    "Faithful Kids has 300+ short Bible stories like this one. Each is about two minutes, with a quiz afterwards and no ads."
   ],
   [
    "link",
    "Find the right stories for your child",
    "https://faithfulkids.app/quiz?utm_source=email&utm_medium=printable&utm_campaign=printable-4&utm_content={{source}}"
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "printable/5": {
  "path": "printable",
  "step": "5",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You requested a free resource from Faithful Kids.",
  "subjects": [
   "Screen time without the guilt",
   "A Bible story in 2 minutes a day",
   "Everything we sent, in one place"
  ],
  "pre": "The four free things from this week, and an easy way to keep going.",
  "tokens": [
   "gift_short",
   "gift_url",
   "magnet_short",
   "magnet_url",
   "source"
  ],
  "blocks": [
   [
    "h",
    "A Bible story a day, in two minutes"
   ],
   [
    "p",
    "Over the past week we sent you four free things. Here they are in one place:"
   ],
   [
    "list",
    [
     "<a href=\"{{magnet_url}}utm_source=email&utm_medium=printable&utm_campaign=printable-5&utm_content={{source}}\">{{magnet_short}}</a>",
     "<a href=\"{{gift_url}}utm_source=email&utm_medium=printable&utm_campaign=printable-5&utm_content={{source}}\">{{gift_short}}</a>",
     "<a href=\"https://faithfulkids.app/blog/david-and-goliath-for-kids?utm_source=email&utm_medium=printable&utm_campaign=printable-5&utm_content={{source}}\">David and Goliath</a>",
     "<a href=\"https://faithfulkids.app/blog/noah-and-the-great-flood-for-kids?utm_source=email&utm_medium=printable&utm_campaign=printable-5&utm_content={{source}}\">Noah and the Great Flood</a>"
    ]
   ],
   [
    "p",
    "If your kids enjoyed them, the Faithful Kids app gives them a new Bible story every day. Jesus tells each one in about two minutes, and a short quiz helps it stick."
   ],
   [
    "p",
    "300+ stories, a profile for each child, and no ads, ever."
   ],
   [
    "btn",
    "See the plans",
    "https://faithfulkids.app/checkout?utm_source=email&utm_medium=printable&utm_campaign=printable-5&utm_content={{source}}"
   ],
   [
    "p",
    "$12.99 a month, or $97 a year with your first seven days free. Every web plan has a 30-day money-back guarantee."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "quiz/1": {
  "path": "quiz",
  "step": "1",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You asked us to email your quiz plan.",
  "subjects": [
   "We saved your child’s plan",
   "Your child’s Bible plan is ready",
   "Open your child’s Bible plan"
  ],
  "pre": "Saved, so you never have to start over. It begins with a free story.",
  "tokens": [
   "safe_plan_payload",
   "source"
  ],
  "blocks": [
   [
    "eyebrow",
    "Your plan"
   ],
   [
    "h",
    "Your child’s Bible plan is ready"
   ],
   [
    "p",
    "You told us about your child, and we built a plan around your answers. It’s saved here, so you never have to start over."
   ],
   [
    "recap",
    [
     "Age range selected: 6 to 8",
     "Bible hero selected: David",
     "Your goal: make Bible time a habit by Christmas"
    ]
   ],
   [
    "btn",
    "See my child’s plan",
    "https://faithfulkids.app/quiz?rp={{safe_plan_payload}}&utm_source=email&utm_medium=quiz&utm_campaign=quiz-1&utm_content={{source}}"
   ],
   [
    "p",
    "It begins with Creation, a two-minute story you can watch together today, free."
   ],
   [
    "small",
    "The child’s name entered in the quiz is not stored or included in this email."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "quiz/2": {
  "path": "quiz",
  "step": "2",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You asked us to email your quiz plan.",
  "subjects": [
   "Let your child decide",
   "Watch this together tonight",
   "Don’t take our word for it"
  ],
  "pre": "No account and no card. Then ask them one question.",
  "tokens": [
   "source"
  ],
  "blocks": [
   [
    "eyebrow",
    "Day one of your plan"
   ],
   [
    "h",
    "Let your child decide"
   ],
   [
    "p",
    "You don’t have to take our word for it. Sit down together and watch Creation, the first story. It’s two minutes, and it’s free."
   ],
   [
    "img",
    "in-the-beginning-creation",
    "Watch the Creation Bible story",
    "https://faithfulkids.app/blog/in-the-beginning-creation-for-kids?utm_source=email&utm_medium=quiz&utm_campaign=quiz-2&utm_content={{source}}",
    true,
    "wide"
   ],
   [
    "btn",
    "Watch Creation free",
    "https://faithfulkids.app/blog/in-the-beginning-creation-for-kids?utm_source=email&utm_medium=quiz&utm_campaign=quiz-2&utm_content={{source}}"
   ],
   [
    "p",
    "No account and no card needed. When it ends, ask: “Do you want to watch another one?”"
   ],
   [
    "p",
    "Their answer will tell you more than we can."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "quiz/3": {
  "path": "quiz",
  "step": "3",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You asked us to email your quiz plan.",
  "subjects": [
   "What will your child be taught?",
   "Who checks our Bible stories?",
   "4 questions parents ask us"
  ],
  "pre": "Who reviews the stories, what’s in a lesson, the price and siblings.",
  "tokens": [
   "safe_plan_payload",
   "source"
  ],
  "blocks": [
   [
    "h",
    "Four questions worth asking"
   ],
   [
    "p",
    "You’re choosing what your child learns about God, so it’s right to ask. Here are the four questions we hear most."
   ],
   [
    "qa",
    [
     [
      "What will my child be taught?",
      "The stories of the Bible, told simply. Every story is reviewed by practicing Christians with theological training. You can read <a href=\"https://faithfulkids.app/beliefs?utm_source=email&amp;utm_medium=quiz&amp;utm_campaign=quiz-3&amp;utm_content={{source}}\">our statement of faith</a>."
     ],
     [
      "What’s in a lesson?",
      "A Bible story told by Jesus in about two minutes, then a short quiz in the app."
     ],
     [
      "What does it cost?",
      "$12.99 a month, or $97 a year with your first seven days free. Every web plan has a 30-day money-back guarantee."
     ],
     [
      "Can my other kids use it?",
      "Yes. One plan covers up to five kids, each with their own profile and progress."
     ]
    ]
   ],
   [
    "btn",
    "Go back to my child’s plan",
    "https://faithfulkids.app/quiz?rp={{safe_plan_payload}}&utm_source=email&utm_medium=quiz&utm_campaign=quiz-3&utm_content={{source}}"
   ],
   [
    "p",
    "Have a different question? Reply to this email and we’ll answer."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "quiz/4": {
  "path": "quiz",
  "step": "4",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You asked us to email your quiz plan.",
  "subjects": [
   "Last email about your plan",
   "No rush. Your plan will keep",
   "A free Bible story to keep"
  ],
  "pre": "Our last email about your plan, with a free story to keep.",
  "tokens": [
   "safe_plan_payload",
   "source"
  ],
  "blocks": [
   [
    "h",
    "No rush. Your plan will keep"
   ],
   [
    "p",
    "Life with kids is full. So we’ve saved your child’s Bible plan, and it will be here whenever you have a quiet minute."
   ],
   [
    "btn",
    "Open my child’s plan",
    "https://faithfulkids.app/quiz?rp={{safe_plan_payload}}&utm_source=email&utm_medium=quiz&utm_campaign=quiz-4&utm_content={{source}}"
   ],
   [
    "p",
    "Not ready for that? Creation is still free to watch together."
   ],
   [
    "link",
    "Watch Creation free",
    "https://faithfulkids.app/blog/in-the-beginning-creation-for-kids?utm_source=email&utm_medium=quiz&utm_campaign=quiz-4&utm_content={{source}}"
   ],
   [
    "p",
    "This is our last email about your plan. Thank you for thinking about Bible time for your child."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "nopay/1": {
  "path": "nopay",
  "step": "1",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You created a Faithful Kids account.",
  "subjects": [
   "Don’t pay yet. Watch this first",
   "One free story before you pay",
   "Your account is ready"
  ],
  "pre": "Your account is ready. One full story, free, before you choose a plan.",
  "tokens": [],
  "blocks": [
   [
    "eyebrow",
    "Almost there"
   ],
   [
    "h",
    "Try it before you pay anything"
   ],
   [
    "p",
    "Your Faithful Kids account is ready. But don’t choose a plan yet."
   ],
   [
    "p",
    "First, watch Creation with your child. It’s a full story, about two minutes, and it’s free. By the end you’ll know whether this is right for your family."
   ],
   [
    "btn",
    "Watch Creation free",
    "https://faithfulkids.app/blog/in-the-beginning-creation-for-kids?utm_source=email&utm_medium=nopay&utm_campaign=nopay-1&utm_content=signup-unpaid"
   ],
   [
    "p",
    "If it is, plans are $12.99 a month, or $97 a year with your first seven days free. Every web plan has a 30-day money-back guarantee."
   ],
   [
    "link",
    "See the plans",
    "https://faithfulkids.app/checkout?utm_source=email&utm_medium=nopay&utm_campaign=nopay-1&utm_content=signup-unpaid"
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "nopay/2": {
  "path": "nopay",
  "step": "2",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You created a Faithful Kids account.",
  "subjects": [
   "Will they remember it tomorrow?",
   "Forgotten by dinner?",
   "What happens after the story"
  ],
  "pre": "Why every story ends with a short quiz, and how you can see the result.",
  "tokens": [],
  "blocks": [
   [
    "h",
    "Watching is easy. Remembering is the point"
   ],
   [
    "p",
    "Kids can watch almost anything and forget it by dinner."
   ],
   [
    "p",
    "So every Faithful Kids story ends with a short quiz. It turns two minutes of watching into something your child can tell you about, and you can see how they did in your parent dashboard."
   ],
   [
    "p",
    "300+ stories. Up to five kids on one plan. No ads."
   ],
   [
    "btn",
    "Watch a free story",
    "https://faithfulkids.app/blog/in-the-beginning-creation-for-kids?utm_source=email&utm_medium=nopay&utm_campaign=nopay-2&utm_content=signup-unpaid"
   ],
   [
    "p",
    "Already paid but can’t get in? Reply and we’ll connect your access."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "nopay/3": {
  "path": "nopay",
  "step": "3",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You created a Faithful Kids account.",
  "subjects": [
   "Did something get in the way?",
   "One step left",
   "A Bible story every day?"
  ],
  "pre": "Your account is set up. Only a plan is missing.",
  "tokens": [],
  "blocks": [
   [
    "h",
    "One step left"
   ],
   [
    "p",
    "Your account is set up. The only thing missing is a plan, and then all 300+ stories open for your child."
   ],
   [
    "p",
    "Choose $12.99 a month, or $97 a year with your first seven days free. Either way, web plans come with a 30-day money-back guarantee."
   ],
   [
    "btn",
    "Choose my plan",
    "https://faithfulkids.app/checkout?utm_source=email&utm_medium=nopay&utm_campaign=nopay-3&utm_content=signup-unpaid"
   ],
   [
    "p",
    "Did something get in the way? Reply and tell us where you got stuck. This is our last note about getting started."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "nopay/1-native": {
  "path": "nopay",
  "step": "1-native",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You created a Faithful Kids account.",
  "subjects": [
   "Don’t choose a plan yet",
   "Watch one free story first",
   "Your account is ready"
  ],
  "pre": "One full story, free. Then choose a plan in the app if you like it.",
  "tokens": [],
  "blocks": [
   [
    "h",
    "Try it before you choose a plan"
   ],
   [
    "p",
    "Your account is ready. Before you choose a plan, watch Creation with your child on our site. It’s a full story, about two minutes, and it’s free."
   ],
   [
    "btn",
    "Watch Creation free",
    "https://faithfulkids.app/blog/in-the-beginning-creation-for-kids?utm_source=email&utm_medium=nopay&utm_campaign=nopay-1-native&utm_content=signup-unpaid"
   ],
   [
    "p",
    "If your child loves it, open Faithful Kids on your phone and choose a plan: $8.99 a month, or $79.99 a year with a three-day free trial for new subscribers."
   ],
   [
    "p",
    "Already subscribed? Tap Restore Purchases in the app, or reply and we’ll help."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "nopay/3-native": {
  "path": "nopay",
  "step": "3-native",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You created a Faithful Kids account.",
  "subjects": [
   "Pick this up on your phone",
   "Did something get in the way?",
   "One tap to the first story"
  ],
  "pre": "Open Faithful Kids on your phone to begin.",
  "tokens": [],
  "blocks": [
   [
    "h",
    "Pick up on your phone"
   ],
   [
    "p",
    "Everything is ready. Open Faithful Kids on your phone and choose a plan, and your child’s first story is one tap away."
   ],
   [
    "btn",
    "Open Faithful Kids",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=nopay&utm_campaign=nopay-3-native&utm_content=signup-unpaid"
   ],
   [
    "p",
    "Already subscribed through Apple or Google Play? Tap Restore Purchases. Still stuck? Reply and tell us what you see. This is our last note about getting started."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "monthly/0": {
  "path": "monthly",
  "step": "0",
  "from": "christian",
  "style": "home",
  "billing": true,
  "reason": "This is a billing email about your Faithful Kids subscription. Reply for help.",
  "subjects": [
   "Welcome! Your receipt is inside",
   "Welcome to Faithful Kids",
   "Your Faithful Kids receipt"
  ],
  "pre": "One quick step, and your child can watch their first story today.",
  "tokens": [
   "checkout_session_id",
   "next_payment_date"
  ],
  "blocks": [
   [
    "eyebrow",
    "Welcome"
   ],
   [
    "h",
    "Welcome to Faithful Kids"
   ],
   [
    "p",
    "Thank you for joining. We’re really glad your family is here."
   ],
   [
    "p",
    "There’s one quick step left: set up your account. Then your child can watch their first story today."
   ],
   [
    "btn",
    "Set up my account",
    "https://app.faithfulkids.app/activate?session_id={{checkout_session_id}}&utm_source=email&utm_medium=monthly&utm_campaign=monthly-0&utm_content=checkout-monthly"
   ],
   [
    "terms",
    [
     "Plan: Faithful Kids Monthly.",
     "Paid today: $12.99 USD.",
     "Renews at $12.99 USD each month until canceled.",
     "Next payment: {{next_payment_date}}.",
     "Manage or cancel your subscription in the parent dashboard.",
     "Web purchases have a 30-day money-back guarantee."
    ]
   ],
   [
    "link",
    "Open the parent dashboard",
    "https://app.faithfulkids.app/parent?utm_source=email&utm_medium=monthly&utm_campaign=monthly-0&utm_content=checkout-monthly"
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "monthly/1": {
  "path": "monthly",
  "step": "1",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Tonight: you, {{child}} and 2 minutes",
   "{{Child}}’s first story is ready",
   "One question to ask {{child}}"
  ],
  "pre": "Creation, about two minutes. Then one question to ask.",
  "tokens": [
   "Child",
   "child",
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "h",
    "Tonight, start with Creation"
   ],
   [
    "p",
    "{{Child}}’s profile is ready and the first story is waiting. It’s Creation. Jesus tells it in about two minutes, and a short quiz follows."
   ],
   [
    "btn",
    "Watch with {{child}}",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=monthly&utm_campaign=monthly-1&utm_content=checkout-monthly"
   ],
   [
    "p",
    "If you can, watch this first one together. Then ask {{child}}: “What was your favorite thing God made?”"
   ],
   [
    "p",
    "If anything isn’t working, reply to this email. It comes straight to our team."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "monthly/2": {
  "path": "monthly",
  "step": "2",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "You don’t need more time",
   "Where do 2 minutes fit?",
   "How to make Bible time stick"
  ],
  "pre": "Tie the story to something your family already does every day.",
  "tokens": [
   "child",
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "h",
    "Tie it to something you already do"
   ],
   [
    "p",
    "You don’t need to find extra time. Tie the story to a moment that already happens every day:"
   ],
   [
    "list",
    [
     "Right after breakfast",
     "In the car on the way to school",
     "Just before lights out"
    ]
   ],
   [
    "p",
    "Pick one and tell {{child}}: “This is our story time.” A story and its quiz take about five minutes."
   ],
   [
    "p",
    "Missed a day? There’s nothing to catch up on. Just play the next one."
   ],
   [
    "btn",
    "Watch the next story",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=monthly&utm_campaign=monthly-2&utm_content=checkout-monthly"
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "monthly/3": {
  "path": "monthly",
  "step": "3",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "{{stories_num}} {{child}} can tell you now",
   "Look how far {{child}} came",
   "{{Child}}’s first week"
  ],
  "pre": "{{Stories_phrase}} this week, and one thing to try tonight.",
  "tokens": [
   "Child",
   "Stories_phrase",
   "child",
   "parent",
   "stars",
   "stories",
   "stories_label",
   "stories_num",
   "stories_phrase",
   "streak"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "h",
    "{{Child}}’s first week"
   ],
   [
    "stats",
    [
     [
      "{{stories}}",
      "{{stories_label}}"
     ],
     [
      "{{stars}}",
      "quiz stars"
     ],
     [
      "{{streak}}",
      "day streak"
     ]
    ]
   ],
   [
    "p",
    "{{Stories_phrase}} from the Bible in one week. That’s {{stories_phrase}} {{child}} can now tell you about."
   ],
   [
    "p",
    "Try this tonight: “Tell me your favorite one like I’ve never heard it.”"
   ],
   [
    "btn",
    "See {{child}}’s progress",
    "https://app.faithfulkids.app/parent?utm_source=email&utm_medium=monthly&utm_campaign=monthly-3&utm_content=checkout-monthly"
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "monthly/4": {
  "path": "monthly",
  "step": "4",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "What does {{child}} think so far?",
   "Can we ask you something?",
   "One quick question"
  ],
  "pre": "Two quick questions. One sentence is plenty.",
  "tokens": [
   "child",
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "p",
    "You’ve had Faithful Kids for about three weeks now, so we’d love to ask you two things."
   ],
   [
    "p",
    "What does {{child}} love most? And what’s one thing you’d change?"
   ],
   [
    "p",
    "One sentence is plenty. Just hit reply. We read every message, and it helps us make this better for your family."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "trial/0": {
  "path": "trial",
  "step": "0",
  "from": "christian",
  "style": "home",
  "billing": true,
  "reason": "This is a billing email about your Faithful Kids subscription. Reply for help.",
  "subjects": [
   "Your 7 free days start now",
   "Your free week starts today",
   "Your trial is confirmed"
  ],
  "pre": "One quick step, and your child can watch their first story today.",
  "tokens": [
   "checkout_session_id",
   "trial_end_date"
  ],
  "blocks": [
   [
    "eyebrow",
    "Welcome"
   ],
   [
    "h",
    "Your seven free days start now"
   ],
   [
    "p",
    "Thank you for trying Faithful Kids. We’re really glad you’re here."
   ],
   [
    "p",
    "There’s one quick step left: set up your account and add your child’s profile. Then their first story is ready to play."
   ],
   [
    "btn",
    "Set up my account",
    "https://app.faithfulkids.app/activate?session_id={{checkout_session_id}}&utm_source=email&utm_medium=trial&utm_campaign=trial-0&utm_content=checkout-annual"
   ],
   [
    "terms",
    [
     "Plan: Faithful Kids Annual.",
     "Your first seven days are free. Charged today: $0.00 USD.",
     "Your trial ends on {{trial_end_date}}.",
     "Then your subscription automatically renews at $97 USD per year until canceled.",
     "Cancel before the trial ends in your parent dashboard to avoid the annual charge.",
     "Web purchases have a 30-day money-back guarantee."
    ]
   ],
   [
    "link",
    "Open the parent dashboard",
    "https://app.faithfulkids.app/parent?utm_source=email&utm_medium=trial&utm_campaign=trial-0&utm_content=checkout-annual"
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "trial/1": {
  "path": "trial",
  "step": "1",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Tonight: you, {{child}} and 2 minutes",
   "{{Child}}’s first story is ready",
   "How to spend day one"
  ],
  "pre": "Creation, about two minutes. Then one question to ask.",
  "tokens": [
   "Child",
   "child",
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "h",
    "Start tonight with Creation"
   ],
   [
    "p",
    "{{Child}}’s profile is ready. The best thing you can do with your free week is start tonight."
   ],
   [
    "p",
    "Watch Creation together. It’s about two minutes, with a short quiz after. Then ask {{child}}: “What was your favorite thing God made?”"
   ],
   [
    "btn",
    "Watch with {{child}}",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=trial&utm_campaign=trial-1&utm_content=checkout-annual"
   ],
   [
    "p",
    "Stuck signing in? Reply and tell us what you see. We’ll help."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "trial/2": {
  "path": "trial",
  "step": "2",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Let {{child}} tell you a story tonight",
   "Look what {{child}} has learned",
   "4 Bible stories already"
  ],
  "pre": "{{Stories_phrase}} so far. Here’s a lovely thing to try at bedtime.",
  "tokens": [
   "Stories_phrase",
   "child",
   "parent",
   "stars",
   "stories",
   "stories_label",
   "streak"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "h",
    "{{Stories_phrase}} so far"
   ],
   [
    "stats",
    [
     [
      "{{stories}}",
      "{{stories_label}}"
     ],
     [
      "{{stars}}",
      "quiz stars"
     ],
     [
      "{{streak}}",
      "day streak"
     ]
    ]
   ],
   [
    "p",
    "Here’s something worth trying tonight. Ask {{child}} to tell you their favorite story as if you’ve never heard it."
   ],
   [
    "p",
    "Telling it back helps it stick, and you get to hear what {{child}} took from it."
   ],
   [
    "btn",
    "Watch the next story",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=trial&utm_campaign=trial-2&utm_content=checkout-annual"
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "trial/3a": {
  "path": "trial",
  "step": "3a",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Thank you, {{parent}}",
   "3 ways to get more for {{child}}",
   "A year of Bible stories ahead"
  ],
  "pre": "Thank you for staying. Three things worth knowing.",
  "tokens": [
   "child",
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "p",
    "Thank you for staying with Faithful Kids. We’re so glad your family is here. Three things worth knowing:"
   ],
   [
    "list",
    [
     "Brothers and sisters can each have their own profile and progress, up to five kids.",
     "Your parent dashboard shows every story watched and every quiz score.",
     "There are 31 series to explore, so there is always a next story."
    ]
   ],
   [
    "btn",
    "Open Faithful Kids",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=trial&utm_campaign=trial-3a&utm_content=checkout-annual"
   ],
   [
    "p",
    "If anything could work better for your family, reply and tell us."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "trial/3b": {
  "path": "trial",
  "step": "3b",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Canceled. You won’t be charged",
   "Your trial is canceled",
   "Watch until {{trial_end_short}}"
  ],
  "pre": "You can keep using Faithful Kids until {{trial_end_short}}.",
  "tokens": [
   "parent",
   "trial_end_date",
   "trial_end_short"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "p",
    "Your trial is canceled, and you won’t be charged. You can keep using Faithful Kids until {{trial_end_date}}."
   ],
   [
    "p",
    "Thank you for giving it a try. If you’d like to tell us what didn’t fit, just reply. You don’t need to explain."
   ],
   [
    "link",
    "View my subscription",
    "https://app.faithfulkids.app/parent?utm_source=email&utm_medium=trial&utm_campaign=trial-3b&utm_content=checkout-annual"
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "trial/3c": {
  "path": "trial",
  "step": "3c",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Your free week has ended",
   "You weren’t charged",
   "A free Bible story to keep"
  ],
  "pre": "Creation is still free to watch any time.",
  "tokens": [
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "p",
    "Your free week has ended, and you haven’t been charged. Thank you for spending some of it with us."
   ],
   [
    "p",
    "If your kids ever want a Bible story, Creation is always free on our site."
   ],
   [
    "link",
    "Watch Creation free",
    "https://faithfulkids.app/blog/in-the-beginning-creation-for-kids?utm_source=email&utm_medium=trial&utm_campaign=trial-3c&utm_content=checkout-annual"
   ],
   [
    "p",
    "And if there’s something you’d like us to hear, just reply."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "gifted/1": {
  "path": "gifted",
  "step": "1",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Did you get our gift?",
   "Your gift is ready to open",
   "Your free account is ready"
  ],
  "pre": "A gift. No card, no trial and nothing to cancel.",
  "tokens": [],
  "blocks": [
   [
    "p",
    "Hi there,"
   ],
   [
    "p",
    "Your free Faithful Kids account is ready."
   ],
   [
    "p",
    "Inside are 300+ Bible stories for kids. Jesus tells each one in about two minutes, and a short quiz follows."
   ],
   [
    "p",
    "It’s a gift. No card, no trial and nothing to cancel."
   ],
   [
    "btn",
    "Sign in to Faithful Kids",
    "https://app.faithfulkids.app/login?utm_source=email&utm_medium=gifted&utm_campaign=gifted-1&utm_content=gifted-church"
   ],
   [
    "p",
    "Use the sign-in details from your invitation. Can’t find them? Reply and we’ll help."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "gifted/2": {
  "path": "gifted",
  "step": "2",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Almost there (one step left)",
   "Add a profile, press play",
   "One step to your first story"
  ],
  "pre": "Add a profile, and Creation is ready to play.",
  "tokens": [],
  "blocks": [
   [
    "p",
    "Hi there,"
   ],
   [
    "p",
    "The only thing between your kids and their first Bible story is a profile. Add one, and Creation is ready to play."
   ],
   [
    "p",
    "Each child can have their own, or a whole class can share one."
   ],
   [
    "btn",
    "Add a profile",
    "https://app.faithfulkids.app/profiles?utm_source=email&utm_medium=gifted&utm_campaign=gifted-2&utm_content=gifted-church"
   ],
   [
    "p",
    "Need a hand? Just reply."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "gifted/3": {
  "path": "gifted",
  "step": "3",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Got two minutes this week?",
   "Try just one story",
   "The easiest way to start"
  ],
  "pre": "Play Creation, then do the short quiz together out loud.",
  "tokens": [],
  "blocks": [
   [
    "p",
    "Hi there,"
   ],
   [
    "p",
    "If you haven’t had a chance to try Faithful Kids yet, here’s the easiest way in."
   ],
   [
    "p",
    "Play Creation. It’s two minutes. Then do the short quiz together, out loud."
   ],
   [
    "p",
    "That’s the whole plan. One story is plenty for a first try."
   ],
   [
    "btn",
    "Play Creation",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=gifted&utm_campaign=gifted-3&utm_content=gifted-church"
   ],
   [
    "p",
    "If something is in the way, reply and tell us. This is our last note about getting started."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "store/1": {
  "path": "store",
  "step": "1",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Welcome! {{Child}}’s story is ready",
   "Tonight: 2 minutes with {{child}}",
   "Welcome to Faithful Kids"
  ],
  "pre": "Open the app and start with Creation.",
  "tokens": [
   "Child",
   "child",
   "parent",
   "store_management_url"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "p",
    "Thank you for joining Faithful Kids. We’re really glad your family is here."
   ],
   [
    "p",
    "Tonight, open the app, choose {{child}}’s profile and start with Creation. It’s about two minutes, with a short quiz after."
   ],
   [
    "btn",
    "Open Faithful Kids",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=store&utm_campaign=store-1&utm_content=app-store"
   ],
   [
    "p",
    "Afterwards, ask {{child}}: “What was your favorite thing God made?”"
   ],
   [
    "small",
    "Your receipt comes from the store where you subscribed. Manage your plan there using the link below."
   ],
   [
    "link",
    "Manage my store subscription",
    "{{store_management_url}}"
   ],
   [
    "p",
    "Trouble getting in? Reply and we’ll help."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "store/2": {
  "path": "store",
  "step": "2",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Let {{child}} tell you a story tonight",
   "Look what {{child}} has learned",
   "3 Bible stories already"
  ],
  "pre": "{{Stories_phrase}} so far. Here’s a lovely thing to try at bedtime.",
  "tokens": [
   "Stories_phrase",
   "child",
   "parent",
   "stars",
   "stories",
   "stories_label",
   "streak"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "h",
    "A great first few days"
   ],
   [
    "stats",
    [
     [
      "{{stories}}",
      "{{stories_label}}"
     ],
     [
      "{{stars}}",
      "quiz stars"
     ],
     [
      "{{streak}}",
      "day streak"
     ]
    ]
   ],
   [
    "p",
    "Here’s something worth trying tonight. Ask {{child}} to tell you their favorite story as if you’ve never heard it."
   ],
   [
    "p",
    "The next story is waiting in the app whenever you’re ready."
   ],
   [
    "btn",
    "Watch the next story",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=store&utm_campaign=store-2&utm_content=app-store"
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "store/3": {
  "path": "store",
  "step": "3",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Thank you, {{parent}}",
   "It works on your computer too",
   "2 things about your plan"
  ],
  "pre": "Thank you for staying. It works on the web, and siblings are included.",
  "tokens": [
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "p",
    "Thank you for staying with Faithful Kids. Two things worth knowing:"
   ],
   [
    "list",
    [
     "Your plan works on the web too. Sign in with the same account on any computer or tablet.",
     "You can add up to five kids, and your parent dashboard shows every story and quiz score."
    ]
   ],
   [
    "btn",
    "Open Faithful Kids",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=store&utm_campaign=store-3&utm_content=app-store"
   ],
   [
    "p",
    "If anything could work better for your family, reply and tell us."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "store/expired": {
  "path": "store",
  "step": "expired",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Your access has ended",
   "Thank you for trying us",
   "A free Bible story to keep"
  ],
  "pre": "Thank you for trying Faithful Kids. A free story is still here for you.",
  "tokens": [
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "p",
    "Your subscription through the app store has ended. Thank you for trying Faithful Kids."
   ],
   [
    "p",
    "If your kids ever want a Bible story, Creation is always free on our site."
   ],
   [
    "link",
    "Watch Creation free",
    "https://faithfulkids.app/blog/in-the-beginning-creation-for-kids?utm_source=email&utm_medium=store&utm_campaign=store-expired&utm_content=app-store"
   ],
   [
    "p",
    "Think your subscription should still be active? Open Faithful Kids on your phone and tap Restore Purchases, or reply and we’ll help."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "dunning/1": {
  "path": "dunning",
  "step": "1",
  "from": "christian",
  "style": "home",
  "billing": true,
  "reason": "This is a billing email about your Faithful Kids subscription. Reply for help.",
  "subjects": [
   "Your payment didn’t go through",
   "A quick card update is needed",
   "Please update your card"
  ],
  "pre": "It usually takes a minute to fix. Here’s where.",
  "tokens": [
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "h",
    "A quick fix for your payment"
   ],
   [
    "p",
    "Your latest payment didn’t go through. This usually just means a card expired or was replaced, and it takes about a minute to fix."
   ],
   [
    "btn",
    "Update my payment",
    "https://app.faithfulkids.app/parent?utm_source=email&utm_medium=dunning&utm_campaign=dunning-1&utm_content=payment-failed"
   ],
   [
    "p",
    "Meant to cancel instead? You can do that in the same place. A failed payment doesn’t cancel your plan on its own."
   ],
   [
    "p",
    "Already updated it? Thank you. Reply if anything looks wrong."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "dunning/2": {
  "path": "dunning",
  "step": "2",
  "from": "christian",
  "style": "home",
  "billing": true,
  "reason": "This is a billing email about your Faithful Kids subscription. Reply for help.",
  "subjects": [
   "Your payment still needs a fix",
   "Reminder: update your card",
   "Your payment is still open"
  ],
  "pre": "Update your card, or reply and we’ll help.",
  "tokens": [
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "p",
    "Your Faithful Kids payment still hasn’t gone through. You can update your card in the parent dashboard."
   ],
   [
    "btn",
    "Update my payment",
    "https://app.faithfulkids.app/parent?utm_source=email&utm_medium=dunning&utm_campaign=dunning-2&utm_content=payment-failed"
   ],
   [
    "p",
    "If your details are right and it still won’t go through, reply and we’ll help you sort it out."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "dunning/3": {
  "path": "dunning",
  "step": "3",
  "from": "christian",
  "style": "home",
  "billing": true,
  "reason": "This is a billing email about your Faithful Kids subscription. Reply for help.",
  "subjects": [
   "One more payment attempt soon",
   "Please check your card",
   "Your payment needs attention"
  ],
  "pre": "The date of the next attempt is inside.",
  "tokens": [
   "parent",
   "retry_date",
   "verified_access_consequence"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "p",
    "Your payment still hasn’t gone through. We’ll try once more on {{retry_date}}."
   ],
   [
    "terms",
    [
     "{{verified_access_consequence}}"
    ]
   ],
   [
    "btn",
    "Update my payment",
    "https://app.faithfulkids.app/parent?utm_source=email&utm_medium=dunning&utm_campaign=dunning-3&utm_content=payment-failed"
   ],
   [
    "p",
    "Need help, or would you rather cancel? Reply, or manage your plan in the parent dashboard."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "cancel/1": {
  "path": "cancel",
  "step": "1",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Your cancellation is confirmed",
   "Your plan is set to end",
   "Watch until {{access_end_short}}"
  ],
  "pre": "You can keep using Faithful Kids until {{access_end_short}}.",
  "tokens": [
   "access_end_date",
   "access_end_short",
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "p",
    "Your cancellation is confirmed. Your monthly plan will end on {{access_end_date}}, and you can keep using Faithful Kids until then."
   ],
   [
    "p",
    "Thank you for being here. If you’re willing to tell us why you canceled, one sentence is plenty. Just reply."
   ],
   [
    "link",
    "View my subscription",
    "https://app.faithfulkids.app/parent?utm_source=email&utm_medium=cancel&utm_campaign=cancel-1&utm_content=monthly-cancel"
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "cancel/2": {
  "path": "cancel",
  "step": "2",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Your access has ended",
   "Thank you from Faithful Kids",
   "A free Bible story to keep"
  ],
  "pre": "Thank you. Creation is still free to watch any time.",
  "tokens": [
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "p",
    "Your monthly access has ended. Thank you for the time your family spent with Faithful Kids."
   ],
   [
    "p",
    "If your kids ever want a Bible story, Creation is always free on our site."
   ],
   [
    "link",
    "Watch Creation free",
    "https://faithfulkids.app/blog/in-the-beginning-creation-for-kids?utm_source=email&utm_medium=cancel&utm_campaign=cancel-2&utm_content=monthly-cancel"
   ],
   [
    "p",
    "Need help with your account? Just reply."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "winback/1": {
  "path": "winback",
  "step": "1",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You previously had a Faithful Kids plan.",
  "subjects": [
   "A small gift for bedtime",
   "7 calm bedtimes, on us",
   "A gift, no strings"
  ],
  "pre": "Seven nights of short stories, prayers and questions. No plan needed.",
  "tokens": [],
  "blocks": [
   [
    "eyebrow",
    "A gift"
   ],
   [
    "h",
    "Seven calm bedtimes, on us"
   ],
   [
    "p",
    "Here’s something for your family, with no strings: our free Bedtime Bible Kit."
   ],
   [
    "p",
    "It has a short story, a simple prayer and one question for each of seven nights. You don’t need a plan to use it."
   ],
   [
    "img",
    "page--bedtime-bible-kit",
    "Preview of the Bedtime Bible Kit",
    "https://faithfulkids.app/printables/bedtime-bible-kit?utm_source=email&utm_medium=winback&utm_campaign=winback-1&utm_content=churned",
    false,
    "sheet"
   ],
   [
    "btn",
    "Get the Bedtime Bible Kit",
    "https://faithfulkids.app/printables/bedtime-bible-kit?utm_source=email&utm_medium=winback&utm_campaign=winback-1&utm_content=churned"
   ],
   [
    "p",
    "We hope it gives you something good to share tonight."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "winback/2": {
  "path": "winback",
  "step": "2",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You previously had a Faithful Kids plan.",
  "subjects": [
   "The door is still open",
   "Bring back Bible time",
   "Your child’s next story awaits"
  ],
  "pre": "The door is open, and this is our last email about it.",
  "tokens": [],
  "blocks": [
   [
    "h",
    "The door is open"
   ],
   [
    "p",
    "Seasons change. If Bible time has slipped out of your family’s week, it only takes two minutes to bring it back."
   ],
   [
    "p",
    "Faithful Kids is still here: 300+ short Bible stories, a quiz after each one, and a profile for every child."
   ],
   [
    "btn",
    "Come back to Faithful Kids",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=winback&utm_campaign=winback-2&utm_content=churned"
   ],
   [
    "p",
    "This is the last email we’ll send about coming back."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "progress/weekly": {
  "path": "progress",
  "step": "weekly",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Ask {{child}} this at dinner tonight",
   "{{Child}}’s week: 5 Bible stories",
   "What {{child}} learned this week"
  ],
  "pre": "{{Stories_phrase}} this week, and one question for dinner.",
  "tokens": [
   "Child",
   "Stories_phrase",
   "child",
   "episode_title",
   "parent",
   "question",
   "stars",
   "stories",
   "stories_label",
   "streak"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "eyebrow",
    "{{Child}}’s week"
   ],
   [
    "h",
    "{{Stories_phrase}} this week"
   ],
   [
    "stats",
    [
     [
      "{{stories}}",
      "{{stories_label}}"
     ],
     [
      "{{stars}}",
      "quiz stars"
     ],
     [
      "{{streak}}",
      "day streak"
     ]
    ]
   ],
   [
    "h3",
    "Ask at dinner"
   ],
   [
    "p",
    "{{Child}} watched {{episode_title}} this week. Try asking: “{{question}}”"
   ],
   [
    "btn",
    "See {{child}}’s week",
    "https://app.faithfulkids.app/parent?utm_source=email&utm_medium=progress&utm_campaign=progress-weekly&utm_content=app-activity"
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "progress/series": {
  "path": "progress",
  "step": "series",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "{{Child}} finished {{series}}!",
   "10 Bible stories, done",
   "Celebrate with {{child}} tonight"
  ],
  "pre": "A whole series, start to finish. Here’s how to celebrate.",
  "tokens": [
   "Child",
   "child",
   "parent",
   "series"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "eyebrow",
    "A milestone"
   ],
   [
    "h",
    "{{Child}} finished the {{series}} series"
   ],
   [
    "p",
    "That’s every story in the series, each with its quiz. It’s a real achievement."
   ],
   [
    "p",
    "It’s worth a little fuss tonight. Ask: “Which story would you tell a friend first?”"
   ],
   [
    "btn",
    "See what’s next for {{child}}",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=progress&utm_campaign=progress-series&utm_content=app-activity"
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "progress/streak": {
  "path": "progress",
  "step": "streak",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Tell {{child}} you noticed",
   "7 days in a row for {{child}}!",
   "A habit is starting"
  ],
  "pre": "A story a day, {{streak}} days running. Worth a high five.",
  "tokens": [
   "Child",
   "Streak_word",
   "child",
   "parent",
   "streak",
   "streak_phrase"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "h",
    "{{Streak_word}} days in a row"
   ],
   [
    "p",
    "{{Child}} has watched a Bible story every day for {{streak_phrase}}. That’s how a habit starts."
   ],
   [
    "p",
    "Tell {{child}} you noticed. It means more coming from you than from an app."
   ],
   [
    "btn",
    "Open Faithful Kids",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=progress&utm_campaign=progress-streak&utm_content=app-activity"
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "progress/quiet": {
  "path": "progress",
  "step": "quiet",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Nothing to catch up on",
   "{{Child}}’s next story is ready",
   "2 minutes to start again"
  ],
  "pre": "Busy weeks happen. There’s nothing to catch up on.",
  "tokens": [
   "Child",
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "p",
    "Busy weeks happen in every family, and there’s nothing to catch up on."
   ],
   [
    "p",
    "{{Child}}’s next story is right where you left it. It takes two minutes."
   ],
   [
    "btn",
    "Watch the next story",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=progress&utm_campaign=progress-quiet&utm_content=app-activity"
   ],
   [
    "p",
    "If something in the app got in the way, reply and tell us."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "weekly/confirm": {
  "path": "weekly",
  "step": "confirm",
  "from": "brand",
  "style": "letter",
  "billing": false,
  "reason": "You requested Faithful Kids Weekly.",
  "subjects": [
   "Confirm your Weekly signup",
   "One tap to confirm",
   "Please confirm your email"
  ],
  "pre": "Tap once to start getting the letter.",
  "tokens": [
   "newsletter_confirmation_url"
  ],
  "blocks": [
   [
    "h",
    "One tap and you’re in"
   ],
   [
    "p",
    "You asked for Faithful Kids Weekly. When we publish a new essay, you’ll get it by email, with one practical idea and one thing to explore with your kids."
   ],
   [
    "btn",
    "Confirm my subscription",
    "{{newsletter_confirmation_url}}"
   ],
   [
    "p",
    "Please confirm within 14 days. If you didn’t ask for this, ignore this email and you won’t hear from us."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "weekly/welcome": {
  "path": "weekly",
  "step": "welcome",
  "from": "brand",
  "style": "letter",
  "billing": false,
  "reason": "You subscribed to our parenting essays at faithfulkids.app.",
  "subjects": [
   "Welcome. Start with this essay",
   "You’re in. Start here",
   "A first essay for you"
  ],
  "pre": "Thank you for subscribing. One essay to begin, and three more below.",
  "tokens": [],
  "blocks": [
   [
    "eyebrow",
    "Raising Faithful Kids"
   ],
   [
    "h",
    "Welcome. Here’s a good place to start"
   ],
   [
    "p",
    "Thank you for subscribing. We publish essays for Christian parents who want faith to feel real at home, and we’ll email you on occasion, when there’s a new one worth your time."
   ],
   [
    "img",
    "p-how-to-raise-children-to-have-god-in-their-hearts-and-minds",
    "A child in tall grass looks up at a sky full of stars, a parent’s hand on their shoulder",
    "https://faithfulkids.app/parenting/how-to-raise-children-to-have-god-in-their-hearts-and-minds?utm_source=email&utm_medium=weekly&utm_campaign=weekly-welcome&utm_content=parenting-newsletter",
    false,
    "wide"
   ],
   [
    "p",
    "<strong>How to Raise Children with God in Their Hearts and Minds</strong>. By Nas Aziz"
   ],
   [
    "p",
    "We tell children to fear God, then wonder why they picture him angry. Nas Aziz writes that the fear Scripture means is awe, and that a child who never stops learning never runs out of reasons to find him."
   ],
   [
    "btn",
    "Read the essay",
    "https://faithfulkids.app/parenting/how-to-raise-children-to-have-god-in-their-hearts-and-minds?utm_source=email&utm_medium=weekly&utm_campaign=weekly-welcome&utm_content=parenting-newsletter"
   ],
   [
    "h3",
    "More to read"
   ],
   [
    "link",
    "The Best Bible Question Is the One You Cannot Answer, by Mark Antonio",
    "https://faithfulkids.app/parenting/the-best-bible-question-is-the-one-you-cannot-answer?utm_source=email&utm_medium=weekly&utm_campaign=weekly-welcome&utm_content=parenting-newsletter"
   ],
   [
    "link",
    "The Five-Minute Family Devotion That Lasts All Year, by Zach Thomas",
    "https://faithfulkids.app/parenting/family-devotions-die-in-february?utm_source=email&utm_medium=weekly&utm_campaign=weekly-welcome&utm_content=parenting-newsletter"
   ],
   [
    "link",
    "What to Say When Your Child Says, “I Don’t Think I Believe”, by Shannon Michaels",
    "https://faithfulkids.app/parenting/what-to-say-when-your-child-says-i-dont-think-i-believe?utm_source=email&utm_medium=weekly&utm_campaign=weekly-welcome&utm_content=parenting-newsletter"
   ],
   [
    "p",
    "That’s all for now. There’s no schedule: you’ll only hear from us when we’ve published something new."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "weekly/issue": {
   "path": "weekly",
   "step": "issue",
   "from": "brand",
   "style": "letter",
   "billing": false,
   "reason": "You requested Faithful Kids Weekly.",
   "subjects": [
    "{{subject}}",
    "{{subject}}",
    "{{subject}}"
   ],
   "pre": "{{pre}}",
   "tokens": [
    "subject",
    "pre",
    "campaign",
    "headline",
    "summary",
    "image_key",
    "image_alt",
    "essay_title",
    "byline",
    "essay_url",
    "try_tonight",
    "link_label",
    "link_url",
    "story_title",
    "story_url"
   ],
   "blocks": [
    [
     "eyebrow",
     "Faithful Kids Weekly"
    ],
    [
     "h",
     "{{headline}}"
    ],
    [
     "p",
     "{{summary}}"
    ],
    [
     "img",
     "{{image_key}}",
     "{{image_alt}}",
     "{{essay_url}}",
     false,
     "wide"
    ],
    [
     "p",
     "<strong>{{essay_title}}</strong><br>By {{byline}}"
    ],
    [
     "btn",
     "Read the essay",
     "{{essay_url}}"
    ],
    [
     "h3",
     "Try tonight"
    ],
    [
     "p",
     "{{try_tonight}}"
    ],
    [
     "link",
     "{{link_label}}",
     "{{link_url}}"
    ],
    [
     "divider"
    ],
    [
     "p",
     "Faithful Kids makes short Bible story videos for kids. <a href=\"{{story_url}}\">Watch {{story_title}} free</a>."
    ],
    [
     "sign",
     "brand"
    ]
   ]
  },
 "writers/received": {
  "path": "writers",
  "step": "received",
  "from": "christian",
  "style": "letter",
  "billing": false,
  "reason": "You submitted a pitch to Raising Faithful Kids.",
  "subjects": [
   "We got your pitch",
   "Thank you for your pitch, Rachel",
   "We have your pitch"
  ],
  "pre": "What happens next, and when you’ll hear from us.",
  "tokens": [
   "parent",
   "topic"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "p",
    "Thank you for sending “{{topic}}” to Raising Faithful Kids. It reached us, and a real person will read it."
   ],
   [
    "p",
    "You’ll hear from us within about a week. If you don’t, just reply. It comes straight to our team."
   ],
   [
    "p",
    "If it’s a fit, we’ll agree on length and timing together, and you’ll see every edit before anything is published."
   ],
   [
    "link",
    "Read the submission guidelines",
    "https://faithfulkids.app/parenting/submission-guidelines?utm_source=email&utm_medium=writers&utm_campaign=writers-received&utm_content=parenting-pitch"
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "writers/published": {
  "path": "writers",
  "step": "published",
  "from": "christian",
  "style": "letter",
  "billing": false,
  "reason": "You submitted a pitch to Raising Faithful Kids.",
  "subjects": [
   "Your essay is live!",
   "You’re published",
   "Thank you for writing with us"
  ],
  "pre": "Here’s the link to share.",
  "tokens": [
   "parent",
   "published_article_url",
   "topic"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "p",
    "“{{topic}}” is now live on Raising Faithful Kids. Thank you for writing it."
   ],
   [
    "btn",
    "Read your essay",
    "{{published_article_url}}?utm_source=email&utm_medium=writers&utm_campaign=writers-published&utm_content=parenting-pitch"
   ],
   [
    "p",
    "That link goes straight to your piece, so it’s easy to share. If you spot anything to correct, just reply."
   ],
   [
    "p",
    "And whenever another idea comes to mind, we’d love to hear it."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "trial/1-noprofile": {
  "path": "trial",
  "step": "1-noprofile",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "One step before the first story",
   "Add a profile to begin",
   "Your first story is one step away"
  ],
  "pre": "Add a profile, and Creation is ready to play.",
  "tokens": [
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "h",
    "One step before the first story"
   ],
   [
    "p",
    "Your account is ready. The only thing left is a profile for your child, so their progress and quiz scores are saved under their own name."
   ],
   [
    "btn",
    "Add a profile",
    "https://app.faithfulkids.app/profiles?utm_source=email&utm_medium=trial&utm_campaign=trial-1-noprofile&utm_content=checkout-annual"
   ],
   [
    "p",
    "It takes about a minute. Then Creation, the first story, is ready to play."
   ],
   [
    "p",
    "Stuck signing in? Reply and tell us what you see. We’ll help."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "trial/1-engaged": {
  "path": "trial",
  "step": "1-engaged",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "A good first start",
   "You’ve begun",
   "The next story is ready"
  ],
  "pre": "The next story is waiting right where you left off.",
  "tokens": [
   "child",
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "h",
    "A good first start"
   ],
   [
    "p",
    "You’ve already begun, which is the hardest part. The next story is waiting right where you left off."
   ],
   [
    "btn",
    "Continue watching",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=trial&utm_campaign=trial-1-engaged&utm_content=checkout-annual"
   ],
   [
    "p",
    "After the next one, ask {{child}}: “What happened in that story?”"
   ],
   [
    "p",
    "If anything isn’t working, reply to this email. It comes straight to our team."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "monthly/1-noprofile": {
  "path": "monthly",
  "step": "1-noprofile",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "One step before the first story",
   "Add a profile to begin",
   "Your first story is one step away"
  ],
  "pre": "Add a profile, and Creation is ready to play.",
  "tokens": [
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "h",
    "One step before the first story"
   ],
   [
    "p",
    "Your account is ready. The only thing left is a profile for your child, so their progress and quiz scores are saved under their own name."
   ],
   [
    "btn",
    "Add a profile",
    "https://app.faithfulkids.app/profiles?utm_source=email&utm_medium=monthly&utm_campaign=monthly-1-noprofile&utm_content=checkout-monthly"
   ],
   [
    "p",
    "It takes about a minute. Then Creation, the first story, is ready to play."
   ],
   [
    "p",
    "Stuck signing in? Reply and tell us what you see. We’ll help."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "monthly/1-engaged": {
  "path": "monthly",
  "step": "1-engaged",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "A good first start",
   "You’ve begun",
   "The next story is ready"
  ],
  "pre": "The next story is waiting right where you left off.",
  "tokens": [
   "child",
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "h",
    "A good first start"
   ],
   [
    "p",
    "You’ve already begun, which is the hardest part. The next story is waiting right where you left off."
   ],
   [
    "btn",
    "Continue watching",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=monthly&utm_campaign=monthly-1-engaged&utm_content=checkout-monthly"
   ],
   [
    "p",
    "After the next one, ask {{child}}: “What happened in that story?”"
   ],
   [
    "p",
    "If anything isn’t working, reply to this email. It comes straight to our team."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "trial/2-noactivity": {
  "path": "trial",
  "step": "2-noactivity",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "One story to begin",
   "Two minutes, one story",
   "Start with Creation"
  ],
  "pre": "Start with Creation. It’s about two minutes.",
  "tokens": [
   "child",
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "h",
    "One story is a good start"
   ],
   [
    "p",
    "Start with Creation. It’s about two minutes, and a short quiz follows."
   ],
   [
    "p",
    "Watch it together if you can, then ask {{child}}: “What was your favorite thing God made?”"
   ],
   [
    "btn",
    "Play Creation",
    "https://app.faithfulkids.app/?utm_source=email&utm_medium=trial&utm_campaign=trial-2-noactivity&utm_content=checkout-annual"
   ],
   [
    "p",
    "If something got in the way, reply and tell us. We’ll help."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "trial/2-noprofile": {
  "path": "trial",
  "step": "2-noprofile",
  "from": "christian",
  "style": "home",
  "billing": false,
  "reason": "You have a Faithful Kids account.",
  "subjects": [
   "Your first story is still waiting",
   "Add a profile to begin",
   "One step left"
  ],
  "pre": "Add a profile, and Creation is ready to play.",
  "tokens": [
   "parent"
  ],
  "blocks": [
   [
    "p",
    "Hi {{parent}},"
   ],
   [
    "h",
    "Your first story is still waiting"
   ],
   [
    "p",
    "Your account is ready. Add a profile for your child, and Creation, the first story, is ready to play. It’s about two minutes."
   ],
   [
    "btn",
    "Add a profile",
    "https://app.faithfulkids.app/profiles?utm_source=email&utm_medium=trial&utm_campaign=trial-2-noprofile&utm_content=checkout-annual"
   ],
   [
    "p",
    "If something got in the way, reply and tell us. We’ll help."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 },
 "printable/2-trivia": {
  "path": "printable",
  "step": "2-trivia",
  "from": "brand",
  "style": "home",
  "billing": false,
  "reason": "You requested a free resource from Faithful Kids.",
  "subjects": [
   "Game night, already planned",
   "A Bible quiz for the car ride",
   "100 Bible questions for your kids"
  ],
  "pre": "100 Bible questions with the answers in the back.",
  "tokens": [
   "source"
  ],
  "blocks": [
   [
    "eyebrow",
    "Another free printable"
   ],
   [
    "h",
    "A Bible quiz for game night"
   ],
   [
    "p",
    "Car rides, dinner, a rainy Saturday. Kids love being asked what they know."
   ],
   [
    "p",
    "The Bible Trivia Pack gives you 100 questions to ask out loud, with the answers in the back."
   ],
   [
    "img",
    "page--bible-trivia-pack",
    "The Bible Trivia Pack",
    "https://faithfulkids.app/printables/bible-trivia-pack?utm_source=email&utm_medium=printable&utm_campaign=printable-2&utm_content={{source}}",
    false,
    "sheet"
   ],
   [
    "btn",
    "Open the Bible Trivia Pack",
    "https://faithfulkids.app/printables/bible-trivia-pack?utm_source=email&utm_medium=printable&utm_campaign=printable-2&utm_content={{source}}"
   ],
   [
    "p",
    "Try five questions at dinner tonight."
   ],
   [
    "sign",
    "brand"
   ]
  ]
 }
} as unknown as Record<string, EmailDef>

/** Sample values, used for previews and owner test sends only. */
export const SAMPLE_VARS: Record<string, string> = {
 "subject": "Your home is already teaching",
 "pre": "A new essay by Natalie Batan, plus one idea to try tonight.",
 "campaign": "weekly-sample",
 "headline": "Your kids are reading the house",
 "summary": "Long before children can read a verse, they read the way a home handles a spill, a guest and a long day.",
 "image_key": "p-the-best-bible-question-is-the-one-you-cannot-answer",
 "image_alt": "Illustration for the essay",
 "essay_title": "Every Home Is Teaching Something. Make Yours Teach Grace.",
 "byline": "Natalie Batan",
 "essay_url": "https://faithfulkids.app/parenting/every-home-is-teaching-something",
 "try_tonight": "Fold the laundry with your kids tonight and ask each child about their day.",
 "link_label": "The free Advent Readings",
 "link_url": "https://faithfulkids.app/printables/advent-readings",
 "story_title": "David and Goliath",
 "story_url": "https://faithfulkids.app/blog/david-and-goliath-for-kids",
 "parent": "Jordan",
 "child": "Sam",
 "Child": "Sam",
 "trial_end_date": "November 23, 2026",
 "trial_end_short": "November 23",
 "access_end_date": "December 16, 2026",
 "access_end_short": "December 16",
 "topic": "What My Kids Taught Me About Sabbath",
 "stories": "5",
 "stories_label": "stories watched",
 "stories_num": "5 stories",
 "stories_phrase": "five stories",
 "Stories_phrase": "Five stories",
 "stars": "14",
 "streak": "4",
 "episode_title": "Joseph Forgives His Brothers",
 "question": "Why do you think it was hard for Joseph to forgive them?",
 "series": "Genesis",
 "Streak_word": "Seven",
 "streak_phrase": "a week",
 "magnet_subject": "Here it is: your Advent Readings",
 "magnet_pre": "Print it tonight. One short reading for each night of December.",
 "magnet_headline": "Here are your Advent Readings",
 "magnet_short": "Advent Readings",
 "magnet_line": "25 short readings, one for each night of December. Night by night, your child follows the story from God’s first promise in Genesis to the manger in Bethlehem.",
 "magnet_tip": "Print it and leave it where you eat dinner. Each reading takes about five minutes. If you miss a night, just pick up where you left off.",
 "magnet_url": "https://faithfulkids.app/printables/advent-readings?",
 "magnet_img": "page--advent-readings",
 "gift_url": "https://faithfulkids.app/printables/bedtime-bible-kit?",
 "gift_short": "Bedtime Bible Kit",
 "source": "printable-gate",
 "safe_plan_payload": "eyJhIjp7ImFnZSI6IjYtOCIsImhlcm8iOiJkYXZpZCJ9LCJwIjoicGFyZW50In0",
 "checkout_session_id": "cs_test_sample",
 "next_payment_date": "December 16, 2026",
 "store_management_url": "https://apps.apple.com/account/subscriptions",
 "retry_date": "November 23, 2026",
 "verified_access_consequence": "If that attempt also fails, your plan will be canceled and access will end.",
 "newsletter_confirmation_url": "https://faithfulkids.app/parenting",
 "published_article_url": "https://faithfulkids.app/parenting/family-devotions-die-in-february"
}
