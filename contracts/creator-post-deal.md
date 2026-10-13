---
id: creator-post-deal
title: Creator Content Agreement
version: 1
# One `field:` line per variable, pipe-delimited:
#   field: key | type | label | default | required
# Types: text, textarea, money, number, date, bool, select:a;b;c
# Keep this list and the body in sync — a placeholder with no field renders
# as an empty string, which in a contract is a blank term, not a typo.
field: signing_party | select:Pixidon LLC;Christian Alexander | We sign as | Pixidon LLC | required
field: talent_name | text | Creator's full legal name | | required
field: talent_handle | text | Primary handle | |
field: signer_name | text | Who signs (same as creator unless an agency) | | required
field: signer_email | text | Signer's email | | required
field: signer_capacity | text | Signing capacity (blank if the creator signs for themselves) | |
field: payee_name | text | Who gets paid, if not the creator | |
field: platforms | text | Platforms | TikTok and Instagram | required
field: posts | number | Number of posts | 1 | required
field: post_type | select:a standalone post;an integrated mention inside a longer video | Post type | a standalone post | required
field: fee_base | money | Guaranteed fee | 150 | required
field: payment_split_pct | number | % of the guarantee paid on signature | 50 | required
field: payment_method | text | Payment method | PayPal | required
field: bonus_basis | select:none;verified views;attributed signups | Performance bonus basis | verified views | required
field: fee_per_1k | money | Bonus per 1,000 views | 5 |
field: fee_cap | money | Total cap including bonus | 500 |
field: promo_code | text | Promo code | |
field: commission_pct | number | Commission on first payments (%) | |
field: non_cash | textarea | Non-cash consideration (gift subscriptions, giveaway prizes) | |
field: min_views | number | Minimum view commitment (leave blank under a $300 guarantee) | |
field: post_deadline_days | number | Days to post, counted from access | 21 | required
field: approval_hours | number | Hours we have to review a rough cut | 48 | required
field: live_days | number | Days the post stays live | 90 | required
field: usage_a_months | number | Organic reuse licence, months after the term | 12 | required
field: usage_b | bool | Include paid-media rights (priced separately) | false |
field: usage_b_fee | money | Paid-media fee | |
field: usage_b_months | number | Paid-media licence, months from first use | 12 |
field: exclusivity_days | number | Category exclusivity, days either side of each post | 30 | required
---

## Creator Content Agreement

This agreement is made on {{sent_date}} between **{{signing_party_full}}** ("Faithful Kids", "we") and **{{talent_name}}**{{#if talent_handle}} ({{talent_handle}}){{/if}} ("you").

**You keep your content.** You own everything you create under this agreement. What you are giving us is permission to use it, for the time and the fee set out below, and nothing here transfers ownership of anything you make.

### 1. What you'll make

You'll create and publish {{posts_phrase}} on {{platforms}}, as {{post_type}}.

Each post needs to:

- show the Faithful Kids app on screen within the first 15 seconds, for at least 2 continuous seconds, with the wordmark visible — we'll send you a screen recording so you don't have to film this yourself;
- say or show the name "Faithful Kids" at least once;
- carry a pinned comment naming Faithful Kids{{#if promo_code}}, with your code **{{promo_code}}**{{/if}}, and a link in your bio while the post is live;
- be disclosed as an ad: "#ad" or "#sponsored" in the first line of the caption, and the platform's own paid-partnership or commercial-content setting switched on. This is a legal requirement for both of us, not a preference;
- contain no other brand's sponsored content and no political content.

You have full creative control over everything else. We're not going to send you a script.

### 2. Timing and approval

You'll post within **{{post_deadline_days}} days of us giving you account access** — the clock starts at access, not at signature, because you can't make anything until you can see the app.

If you want us to look at a rough cut first, send it and we'll reply within **{{approval_hours}} hours**. If we don't reply in that window, treat it as approved and post it. We're not going to hold your work up.

Please keep each post live for at least **{{live_days}} days**. If a platform removes your post or your account for reasons outside your control, that's not a breach of this agreement and you keep everything you've been paid.

### 3. What we'll pay

{{fee_block}}

{{#if non_cash}}In addition: {{non_cash}}.{{/if}}

{{#if min_views}}This deal carries a minimum of **{{min_views}} views** across the deliverables, measured 30 days after posting. If it falls short, you'll make one additional post of the same kind at no extra fee. There's no refund and no clawback — we'd rather have another post than your money back.{{/if}}

{{#if commission_pct}}Separately and for as long as you'd like to use it, your code **{{promo_code}}** pays you **{{commission_pct}}%** of the first payment from anyone who subscribes with it, for 12 months from their signup. That's independent of the fees above and doesn't expire with this agreement.{{/if}}

### 4. How you may use your content, and how we may

You may always use the content you make here however you like, including in your own portfolio and reel.

**Organic use.** You're giving us permission to repost the finished video as you published it on our own accounts (YouTube, TikTok, Instagram, Facebook and any later equivalent), to embed it on faithfulkids.app, and to include it in our emails. We may also use a single still frame as a thumbnail. We'll credit you by name or handle wherever the platform allows it. This permission lasts while the post is live and for **{{usage_a_months}} months** afterwards.

**Editing.** So the content fits those placements, you're allowing us to trim it, caption or subtitle it, add our own graphics and wordmark, and cut it to a shorter version. We won't change what you actually said, we won't edit it to suggest you endorse anything other than Faithful Kids, and we won't sell it to anyone else.

**Your name and image.** We may use your name, handle and likeness in connection with this content, and not for anything else.

**If your children appear** in the content, your signature on this agreement is your consent as their parent or guardian for them to appear in the uses described here.

**Taking it down.** After the term, if you'd rather we stopped using a piece of content on our own accounts, email us and we'll take it down within 14 days. No reason needed.

{{usage_b_block}}

### 5. Exclusivity

For **{{exclusivity_days}} days before and {{exclusivity_days}} days after** each post you make under this agreement, please don't run sponsored content for an app, subscription or streaming service whose main purpose is Bible or Christian faith content for children.

That's the whole restriction. It doesn't cover Christian brands generally, your church, homeschool curriculum, or anything else you work with, and it doesn't apply outside those windows.

### 6. What you're confirming

By signing, you're confirming that: the content is your own original work; you have the rights to any music or footage in it{{#if usage_b}}, and because this deal includes paid advertising, the audio is either original or separately licensed for commercial use — the free sounds built into TikTok and Instagram are **not** cleared for paid ads{{/if}}; you're free to enter this agreement{{#if signer_capacity}}; and that you are authorised to sign it on behalf of {{talent_name}}{{/if}}.

### 7. The ordinary legal parts

You're an independent contractor, not an employee or partner, and you're responsible for your own taxes. If we pay you $600 or more in a calendar year we'll need a completed W-9 from you before the final payment, and we'll issue a 1099-NEC.

Either of us may end this agreement in writing before you've posted. If we end it after you've started work, you keep the portion of the guarantee already paid. If you end it, you return it.

This agreement is governed by the laws of the **State of Michigan**, and any dispute will be heard in the state or federal courts sitting in Michigan.

This is the entire agreement between us on this subject and replaces anything discussed before it. Any change has to be in writing and agreed by both of us. We're both agreeing to sign this electronically and to receive records about it electronically.

### Signatures

**{{signing_party_full}}**
By: Christian Alexander
{{sent_date}}

**{{signer_name}}**{{#if signer_capacity}}
{{signer_capacity}}, signing on behalf of {{talent_name}}{{/if}}{{#if payee_name}}
Payment to: {{payee_name}}{{/if}}
