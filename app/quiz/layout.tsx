import type { Metadata } from 'next'

// The quiz page itself is a client component and cannot export metadata,
// so its canonical/title live here (it was inheriting the homepage canonical).
export const metadata: Metadata = {
  title: 'Find Your Child’s Bible Learning Plan',
  description:
    'Answer a few quick questions and get a personalized Bible video learning plan for your child. 300+ narrated stories, quizzes, and a 3-day free trial.',
  alternates: {
    canonical: 'https://faithfulkids.app/quiz',
  },
  openGraph: {
    title: 'Find the Perfect Bible Learning Plan for Your Child',
    description:
      'Answer a few quick questions and get a personalized Bible video learning plan for your child.',
    url: 'https://faithfulkids.app/quiz',
    siteName: 'Faithful Kids',
    type: 'website',
  },
}

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children
}
