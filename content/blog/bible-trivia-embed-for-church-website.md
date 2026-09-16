---
title: "Embed a Free Bible Trivia Game on Your Church or School Website (Copy-Paste, No Plugin)"
metaTitle: "Embed a Free Bible Trivia Game on Your Website (No Plugin)"
slug: "bible-trivia-embed-for-church-website"
type: "listicle"
metaDescription: "Add a free 100-question Bible trivia game to any website with one iframe. Works on WordPress, Squarespace, Wix, Google Sites. No plugin, no account, no ads."
keywords: ["embed bible trivia game website", "bible trivia widget", "bible trivia wordpress plugin", "bible trivia iframe embed", "embeddable bible quiz for website", "church website bible quiz"]
datePublished: "2026-09-16"
dateModified: "2026-09-16"
---

You can put a free, playable Bible trivia game on any website by pasting one block of HTML. There is no WordPress plugin to install, no account to create, and no ads inside the game. Copy this and paste it wherever your site lets you add custom HTML:

```html
<iframe id="fk-bible-trivia" src="https://faithfulkids.app/embed/bible-trivia" width="100%" height="780" style="border:0;border-radius:16px;max-width:640px" title="Bible Trivia for Kids" loading="lazy"></iframe>
<script>window.addEventListener("message",function(e){if(e.origin!=="https://faithfulkids.app")return;var d=e.data;if(!d||d.type!=="fk-trivia-height")return;var f=document.getElementById("fk-bible-trivia");if(f)f.height=d.height;});</script>
<p style="font-size:14px"><a href="https://faithfulkids.app/bible-trivia">Free Bible Trivia game by Faithful Kids</a></p>
```

That is the whole job. The rest of this page covers what the game contains, the exact clicks for WordPress, Squarespace, Wix, Google Sites and plain HTML, how to embed trivia for one specific Bible story instead of the general game, and the honest answers to the questions people ask before pasting code from a stranger onto their church site.

You can [play the game first](/bible-trivia) to see what your visitors will get.

## What the embedded game includes

- **100 questions** in three difficulty levels: easy (ages 5 to 8), medium (ages 9 to 12), and hard (teens and adults), plus a mixed mode for family play.
- **Ten-question rounds.** A player picks a difficulty and gets ten random questions from that pool, so repeat plays are different.
- **The verse behind every answer.** Each question shows its Bible reference after the answer, so the game teaches rather than just tests.
- **Scoring with streaks and a rank** at the end of each round, from Brave Beginner up to Bible Master.
- **No sign-up, no email, no ads.** A visitor plays immediately.
- **Phone-friendly.** The game auto-resizes inside the frame; that is what the small script in the snippet does.
- **Free for churches, schools, homeschool co-ops, and ministry blogs.** The only thing we ask is the credit line under the game, which is included in the snippet.

The game is the same one at [faithfulkids.app/bible-trivia](/bible-trivia), served from our site, so you never have to update anything. When we fix a question or add one, your embed updates with it.

## How to add it, site by site

### WordPress

There is no plugin, and you do not need one. WordPress has a built-in block for exactly this.

1. Open the page or post in the editor.
2. Click the **+** to add a block and search for **Custom HTML**.
3. Paste the snippet above into the block.
4. Click **Preview** in the block toolbar to see the game, then **Update** or **Publish**.

If your site uses the Classic editor instead of blocks, switch the editor tab from **Visual** to **Text** (or **Code**) and paste the snippet there. On WordPress.com, custom HTML embeds require a plan that allows custom code; on self-hosted WordPress it works on every plan.

### Squarespace

1. Edit the page and click **Add Block**.
2. Choose **Code**.
3. Paste the snippet. Leave the block set to **HTML**, and uncheck "Display Source" if it is checked.
4. Save.

Squarespace's Code block is available on Business plans and above.

### Wix

1. In the editor, click **Add Elements**, then **Embed Code**.
2. Choose **Embed HTML** (sometimes labelled "HTML iframe").
3. Paste the snippet into the box and click **Update**.
4. Drag the element to size. Give it at least 640 pixels of width and 800 of height so the game is not cramped; the auto-resize script adjusts the height after it loads.

### Google Sites

1. Click **Insert**, then **Embed**.
2. Choose the **Embed code** tab (not "By URL").
3. Paste the snippet and click **Next**, then **Insert**.

### Weebly, Webflow, Ghost, and plain HTML

Every one of these has an "Embed code" or "Custom HTML" element. Paste the snippet into it. On a plain HTML page, paste the snippet anywhere inside `<body>`.

## Embed trivia for one specific Bible story

If your lesson this week is Noah's Ark or the Christmas story, you can embed a shorter game with only questions about that story. Every story or topic on our site with ten or more trivia questions has its own embeddable version at:

```
https://faithfulkids.app/embed/trivia/<post-slug>
```

Swap the `src` in the snippet above for one of these and change the `id` to match. A few ready to use:

| Trivia set | Embed URL |
|---|---|
| Christmas Bible trivia | `https://faithfulkids.app/embed/trivia/christmas-bible-trivia-for-kids` |
| Easter Bible trivia | `https://faithfulkids.app/embed/trivia/easter-bible-trivia-for-kids` |
| Old Testament trivia | `https://faithfulkids.app/embed/trivia/old-testament-bible-trivia-for-kids` |
| New Testament trivia | `https://faithfulkids.app/embed/trivia/new-testament-bible-trivia-for-kids` |
| General Bible trivia (50 questions) | `https://faithfulkids.app/embed/trivia/bible-trivia-for-kids` |

Browse the full list of trivia sets, one per Bible book and holiday, on our [Bible trivia for kids](/blog/bible-trivia-for-kids) page. Each one that has a playable game shows the embed code under the game.

## Printable version instead?

If you want paper rather than a screen, the same questions are available as a [free Bible trivia PDF](/blog/bible-trivia-for-kids) with answer keys, and there are [printable Bible word searches](/printables/bible-word-search) for younger kids. No sign-up for any of them.

## Frequently Asked Questions

### Is there a Bible trivia WordPress plugin?

You do not need one. WordPress's built-in **Custom HTML** block accepts the snippet above and the game runs inside it. A plugin would add code to your site that you then have to keep updated; the iframe puts nothing on your server. If you have seen quiz plugins that require you to type in every question, this is the alternative: the questions, scoring, and verse references are already done.

### Can I use it in H5P, Moodle, or a school LMS?

Yes, anywhere that accepts an iframe. H5P has an "Iframe Embedder" content type; Moodle, Canvas, and Google Classroom all let you paste an iframe into a page or assignment. Use the snippet above, or just the `<iframe>` line if the platform strips scripts (the game still works; it just will not auto-resize, so set `height="900"`).

### Can I change or add questions?

Not in the embed. It runs the same 100 questions as the game on our site, which is what keeps it free and maintenance-free for you. If you want your own set, the [50-question printable PDF](/blog/bible-trivia-for-kids) is easy to edit, and every Bible book has its own trivia post you can copy from.

### Can I remove the "Free Bible Trivia game by Faithful Kids" line?

We ask that you keep it. It is how people who like the game find where it came from, and it is the only thing that pays for the game staying free with no ads. You can style it to match your site; you can also move it below or beside the frame.

### Does it work on phones?

Yes. The game is built for touch, and the snippet's small script resizes the frame to fit the game's height so there is no inner scrollbar. On a narrow screen the frame fills the width of its container.

### Is it free for a church, a school, or a homeschool co-op?

Yes, for all of them, with no limit on visitors or plays. The whole [Faithful Kids app is also free for churches](/churches), if you want the video lessons and quizzes behind the trivia for your kids' ministry.

### Does the game collect anything from the people who play?

No sign-up, no email, and no account. Nobody playing on your site is asked for anything. The game is served from faithfulkids.app under our [privacy policy](/privacy).

### What if the frame shows up blank?

Two usual causes. Your platform stripped the code: make sure you pasted into an HTML or Code block, not a normal text block. Or a content-security setting on your site blocks frames from other domains: ask whoever manages the site to allow `faithfulkids.app`. If you are still stuck, email [christian@faithfulkids.app](mailto:christian@faithfulkids.app) with the page link and we will look.

---

**Want more than trivia?** Faithful Kids is a Bible video app for kids ages 5 to 15: more than 300 short lessons from Genesis to Revelation, each followed by a quiz and a reflection question. [Start your free trial](/quiz), or [get it free for your church](/churches).
