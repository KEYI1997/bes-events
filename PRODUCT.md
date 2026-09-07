# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

活動主辦方與採購人員，評估活動設備、選擇規格與加購項目，並送出活動需求諮詢。

## Product Purpose

境曜有限公司官網提供活動服務與設備資訊，讓訪客依商品內容、圖片、規格及加購項目建立訂單諮詢。

## Operating Context

產品資訊、圖片、價格選項與加購項目由後台「產品管理」維護；前台須將選擇內容帶入諮詢與後台紀錄。

## Capabilities and Constraints

- Next.js、TypeScript 與 Supabase 網站。
- 商品圖片、規格、加購及選購商品必須沿用後台資料，不能為版面改動而改寫商品內容。
- 產品諮詢需保留服務類型、商品規格、加購選項、活動日期與活動地點。

## Brand Commitments

- 境曜有限公司／BES Events。
- 使用暖白留白、深灰文字與焦糖棕／暖金色重點色。
- 呈現專業活動服務公司，而非大型購物商城。

## Evidence on Hand

- 現有商品與圖片資料由 Supabase 產品表提供。
- `src/app/products/detail/[id]/page.tsx` 為產品詳情頁；`src/components/ContactModal.tsx` 為訂單諮詢入口。

## Product Principles

- 商品圖片與規格必須優先易讀。
- 後台可維護內容是前台唯一資料來源。
- 選購流程簡潔，且不遺失使用者選擇。
