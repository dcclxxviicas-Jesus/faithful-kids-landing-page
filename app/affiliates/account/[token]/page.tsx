import { redirect } from 'next/navigation'

/* Older private links (/affiliates/account/<token>) still work: they sign
   the affiliate in and open the dashboard. */
export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  redirect(`/affiliates/signin?k=${encodeURIComponent(token)}`)
}
