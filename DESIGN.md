# BES Events Preview Homepage Design System

## Intent

首頁是一份「現場執行節奏表」。每個滿版章節是一種活動決策：先理解整合價值，再挑選需求方向、瀏覽實際現場，最後提交需求。這是測試分支的首頁基準，不改變既有服務頁或後台。

## Visual roles

| Role | Value | Use |
|---|---|---|
| Night | `#111111` | 深色章節、主要深色文字 |
| Paper | `#F4F5F0` | 淺色文字與表單閱讀底色 |
| Signal orange | `#FF8126` | 首屏與第一個決策章節 |
| Sky | `#4DB3FF` | 整合價值與案例章節 |
| Lime | `#C5F53D` | 活動需求定位器與行動區 |
| Crimson | `#DE194B` | 每個章節唯一的主要 CTA |

每個章節只使用一個完整平面底色，段落以色塊轉場而不是框線、陰影或漸層分隔。

## Typography

- One family: `Noto Sans TC`, with 400 / 500 / 700 weights.
- Display: `clamp(3.75rem, 11vw, 10.5rem)`, 700, `letter-spacing: -0.055em`, `line-height: 0.86`.
- Section display: `clamp(2.7rem, 7vw, 7.5rem)`, 700, `line-height: 0.92`.
- Body: 16–20px, 1.55 line-height, high contrast.
- Headlines stay at two authored lines or fewer. No eyebrow labels, all-caps tracking, decorative numbering or styled accent words.

## Layout and interaction

- Shared outer gutter: `clamp(1rem, 3vw, 3rem)`.
- Full-bleed colour chapters, usually at least one viewport high on desktop; mobile uses a separate vertical composition.
- Square image crop and square-cornered controls.
- Header is an uncluttered text bar. One primary action.
- Buttons are filled blocks. Hover and keyboard focus give high-contrast colour inversion; active state uses a small scale transform.
- Motion: hero lines reveal upward; each chapter’s text and media rise in sequence; images drift slowly; `prefers-reduced-motion` shows all content without movement.

## Content rules

- Use existing BES service descriptions, real case photos and CMS-managed client logos only.
- The interactive activity selector is an information guide only; it does not write or claim to calculate a quote.
- Keep SEO metadata, JSON-LD and the working contact form intact.
