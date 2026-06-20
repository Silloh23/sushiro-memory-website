# Omoide Sushi (思い出寿司) — 3D Anniversary Gift Website

A beautiful, single-page, fully interactive 3D souvenir website styled after the Sushiro sushi chain, created as a heartfelt 6-month anniversary gift for my beautiful girlfriend.

The application transports the viewer into a warm, cozy virtual restaurant where they can browse a touchscreen menu of color-coded "memory dishes," order them to arrive on a spinning 3D conveyor belt, and tap them to reveal curated letters, photos, and memories inside.

---

## Features & Aesthetic Themes

Our interactive design pairs nostalgic Japanese restaurant traits with romantic personal interests:
* **Authentic Sushiro Theme**: Red and white awning banners, wooden textures, price divisions (e.g. `¥108`, `¥168`, `¥198`), and continuous revolving plate lines.
* **Disney Whimsy**: Sparkling visual bursts, soft magenta color codes, and elegant editorial layouts.
* **Minion Tim Touches**: Bubbly typography, warm brown plate options, cute teddy-bear illustrations, and floating emojis.
* **Sakura Atmosphere**: Serene floating cherry blossom petals drifting slowly over the wooden diner counter-table.
* **Thermal Receipt Printer**: Automatically triggers and prints out a scrolling realistic receipt list of all shared memories with a final typewriter-written love confession once all dishes are consumed.

---

## Tech Stack

* **Framework**: React 19 + TypeScript + Vite
* **3D Graphics Engine**: Three.js (Procedural geometries, custom textures, low-poly plates, and particle systems)
* **Styling**: Tailwind CSS v4 (Pure utility classes)
* **Animations**: Motion (formerly Framer Motion)

---

## Running Locally

### Prerequisite (Crucial)
This project uses **Tailwind CSS v4** (`@tailwindcss/vite`), which introduces high-performance Rust-compiled native bindings via `@tailwindcss/oxide`. 
* **You MUST use Node.js version 20 or higher** (e.g., `v20.x` or `v22.x`).
* If you run Node 18 or lower, you will see a `Cannot find native binding` crash on starting the dev server.

### Setup Instructions

1. **Clone the repository** (and enter the folder):
   ```bash
   cd sushiro-memory-website
   ```

2. **Verify your Node version**:
   ```bash
   node -v
   # If this is below v20, update your Node via nvm:
   # nvm install 20 && nvm use 20
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Now open your browser to `http://localhost:3000` to start eating!

---

## Customizing Your Own Memories

All memories, titles, pricing, and color parameters are held inside a single, easy-to-configure dataset file. 

Open **`src/data/memories.ts`** and edit the variables with your own moments:

```typescript
export const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: 1,
    category: "memories",
    emoji: "🌸",
    title: "The day we met",
    price: "¥108",
    plateColor: "#F7C5C5",
    rimColor: "#D0021B",
    memory: "Your custom message goes here..."
  },
  // Add or modify up to 8 items!
];
```

---

## ☁️ Deploying to Vercel

This app is a client-side Single Page Application (SPA) and can be deployed to Vercel in seconds for **free**:

1. Push your code folder to a **GitHub** repository.
2. Log into your [Vercel Dashboard](https://vercel.com).
3. Click **Add New** > **Project** and import your GitHub repository.
4. Vercel will automatically detect **Vite** as your build framework:
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Click **Deploy**, and your digital gift will be online!

---

*Made with love, virtual sushi, and code. Happy Anniversary! 💕*
