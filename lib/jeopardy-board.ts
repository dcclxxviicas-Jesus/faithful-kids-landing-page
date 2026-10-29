// The /bible-jeopardy board: 6 categories x 5 clues, $100-$500.
// Target: "bible jeopardy" — 3,600/mo ads, 2,548/mo clickstream, KD 0
// (DataForSEO, Oct 29 2026). Page 1 is jeopardylabs.com user-made template
// boards and YouTube — artifact-shaped SERP, no strong incumbent.
//
// Every clue is resolved FROM lib/trivia-game-questions.ts by exact question
// text, so the question bank stays the single source of truth for wording,
// answers, distractors, and verse refs. A clue that stops matching (someone
// edits the bank) throws at build time rather than silently vanishing.

import { ALL_QUESTIONS, type GameQuestion } from '@/lib/trivia-game-questions'

export type JeopardyClue = GameQuestion & { value: number }
export type JeopardyCategory = { name: string; clues: JeopardyClue[] }

function pick(q: string, value: number): JeopardyClue {
  const found = ALL_QUESTIONS.find(x => x.q === q)
  if (!found) throw new Error(`jeopardy-board: question not in bank: "${q}"`)
  return { ...found, value }
}

export const CATEGORIES: JeopardyCategory[] = [
  {
    name: 'In the Beginning',
    clues: [
      pick('Who were the first man and woman?', 100),
      pick('What sign did God put in the sky as a promise never to flood the whole earth again?', 200),
      pick('What did Esau trade his birthright for?', 300),
      pick('What new name did God give Jacob after he wrestled with God?', 400),
      pick('What mysterious priest-king brought out bread and wine and blessed Abram?', 500),
    ],
  },
  {
    name: 'Moses & the Exodus',
    clues: [
      pick('What baby was hidden in a basket on the Nile River?', 100),
      pick('What sea did God part so the Israelites could walk through on dry ground?', 200),
      pick('What was the first of the ten plagues on Egypt?', 300),
      pick('What did the Israelites put on their doorframes so the final plague would pass over their homes?', 400),
      pick('Which two Hebrew midwives bravely disobeyed Pharaoh’s order to kill baby boys?', 500),
    ],
  },
  {
    name: 'Kings & Prophets',
    clues: [
      pick('What did David use to defeat the giant Goliath?', 100),
      pick('Which king asked God for wisdom instead of money or long life?', 200),
      pick('What city was the giant Goliath from?', 300),
      pick('What did Elisha ask Elijah for before Elijah was taken up to heaven?', 400),
      pick('How many people in Israel did God say had never bowed to Baal, when Elijah thought he was the only one left?', 500),
    ],
  },
  {
    name: 'The Life of Jesus',
    clues: [
      pick('In what town was Jesus born?', 100),
      pick('Who baptized Jesus in the Jordan River?', 200),
      pick('What did Jesus tell Nicodemus a person must be to see the kingdom of God?', 300),
      pick('What job did the prodigal son end up doing in the far country when his money ran out?', 400),
      pick('Who appeared with Jesus at the transfiguration?', 500),
    ],
  },
  {
    name: 'Miracles',
    clues: [
      pick('What did Jesus turn water into at a wedding — his very first miracle?', 100),
      pick('How many loaves and fish did Jesus use to feed more than 5,000 people?', 200),
      pick('How did four friends get their paralyzed friend to Jesus in a packed house?', 300),
      pick('What amazing thing happened in the sky during the battle at Gibeon?', 400),
      pick('Where did Jesus tell Peter to find a coin to pay the temple tax?', 500),
    ],
  },
  {
    name: 'Tricky & True',
    clues: [
      pick('How many commandments did God give Moses?', 100),
      pick('What swallowed Jonah when he ran away from God?', 200),
      pick('What fruit did Adam and Eve eat in the Garden of Eden?', 300),
      pick('How many wise men does the Bible say visited Jesus?', 400),
      pick('When did God change Saul’s name to Paul?', 500),
    ],
  },
]

// Shown after the board is cleared — a table-wide bonus reveal, no scoring,
// so multi-team play needs no wagering mechanics.
export const FINAL_CLUE: GameQuestion = (() => {
  const q = 'Exactly how many fish were in the net when the risen Jesus met the disciples at the shore?'
  const found = ALL_QUESTIONS.find(x => x.q === q)
  if (!found) throw new Error('jeopardy-board: final clue missing from bank')
  return found
})()

export const CLUE_COUNT = CATEGORIES.reduce((n, c) => n + c.clues.length, 0)
