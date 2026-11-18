'use client'

import { StoreBadge, useMobileStore } from '@/app/components/AppStore'

/* App plans on /pricing: an iPhone or iPad sees the App Store badge, an
   Android phone the Google Play badge, desktop sees nothing (it cannot
   install the app). Owner request, Nov 17, 2026. Device detection lives in
   useMobileStore only, which already excludes Fire tablets and catches
   iPadOS reporting a Mac user agent. */
export default function StoreRow() {
  const store = useMobileStore()
  if (!store) return null
  return (
    <div className="pr-store">
      <p>{store === 'apple' ? 'Get the app on your iPhone or iPad:' : 'Get the app on your Android phone:'}</p>
      <StoreBadge store={store} location="pricing_app_plans" height={48} />
    </div>
  )
}
