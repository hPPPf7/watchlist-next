# 🎬 Watchlist – 影視紀錄網站

這是一個使用 **Next.js + Firebase + TMDB API** 所開發的影視紀錄網站，可搜尋電影/影集、查看詳情、儲存收藏清單。

---

## 🚀 功能特色

- 🔍 關鍵字搜尋電影/影集（中文也支援）
- 🖼 顯示封面圖、背景圖與劇情資訊（來自 TMDB）
- 🔐 Firebase 登入驗證（支援 Google 登入）
- 💾 Watchlist 收藏儲存至個人帳號

---

## 🛠 技術使用

| 技術        | 功能 |
|-------------|------|
| Next.js 14  | 前端框架（App Router） |
| Tailwind CSS | UI 樣式 |
| Firebase    | 認證 / 資料儲存 |
| TMDB API    | 影視資料來源 |

---

## ⚙️ 環境變數設定

請先複製 `.env.example` 為 `.env`，再填入你的金鑰與服務資訊：

```bash
cp .env.example .env
