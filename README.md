# Omoide Sushi (思い出寿司) — 3D Anniversary Gift Website

A beautiful, single-page, fully interactive 3D souvenir website styled after the Sushiro sushi chain, created as a heartfelt 6-month anniversary gift for my amazing girlfriend.

The application transports the viewer into a warm, cozy, vibrantly lit virtual restaurant where they can browse a touchscreen menu of color-coded "memory dishes," order them to arrive on a spinning 3D conveyor belt, and tap them to reveal curated letters, photos, and memories inside.

---

## Features & Aesthetic Themes

Our interactive design pairs nostalgic Japanese restaurant traits with romantic personal interests:
* **Authentic Sushiro Theme**: Red and white awning banners, wooden textures, price divisions (e.g. `¥108`, `¥168`, `¥198`), and continuous revolving plate lines.
* **🎵 Vintage Vinyl Record Player (Interactive BGM)**: A beautifully physical, retro golden wood-grained record player resting right on the table in the corner:
  - **Dynamic Swiveling Tonearm**: Tapping the record platter physically swings the stylus arm onto the grooved vinyl, initiating smooth audio playback. Pause swings it back to its rest.
  - **Fluid Rotational Spin**: The vinyl disc features realistic grooved reflections and spins continuously in real-time when music plays, matching the track's status.
  - **LED Status Indicators**: Incorporates a retro glowing vacuum-tube style LED (Green for actively spinning audio, Red for paused).
   - **Multi-Track Playlists & Queue (⚙️)**: Click the tiny gear button on the player to open the Queue manager. You can label and add multiple direct streaming MP3 links or local public-folder MP3 paths.
   - **Playback Controller**: Control playback with standard playback buttons (⏮, Play/Pause, ⏭) and easily remove songs or switch tracks directly inside the scrollable visual queue. Tracks will automatically advance to the next queued item at completion!
  - **Persistent Memory**: The entire custom playlist and the active track position are automatically persisted across browser refreshes using `localStorage` sync.
* **Animated Culinary Chef Tim**: An adorable 3D honey bear cook standing proudly at his cutting board in the background behind the conveyor belt. Tim bobs and breathes naturally while actively slicing ingredients and laying down garnishes under dedicated spotlight illumination.
* **Custom Photos & Drawings (No Emojis Required!)**: Supports uploading personal illustrations or memorable pictures. These load asynchronously onto floating circular souvenir-pin badges right above the plates in 3D, and transition into stunning Polaroid photograph cards once clicked.
* **Disney Whimsy**: Sparkling visual bursts, soft magenta color codes, and elegant editorial layouts.
* **Sakura Atmosphere**: Serene floating cherry blossom petals drifting slowly over the wooden diner counter-table.
* **Thermal Receipt Printer**: Automatically triggers and prints out a scrolling realistic receipt list of all shared memories with a final typewriter-written love confession once all dishes are consumed.

---

## 🛠️ Tech Stack

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

## Customizing Your Own Memories, Photos & BGM

All memories, titles, pricing, custom picture paths, and the default background soundtrack are held inside a single, easy-to-configure dataset file.

### 🎵 Configuring the Default Background Music (BGM)
To change the background music that plays by default when your visitor enters the website:
1. Open **`src/data/memories.ts`**.
2. Change the `DEFAULT_BGM_URL` variable to any online direct streaming audio URL, or place an MP3 file into the `/public` directory (e.g., `/public/background.mp3`) and reference it as `"/background.mp3"`:
```typescript
// src/data/memories.ts
export const DEFAULT_BGM_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";
```

### Replacing Emojis with Personal Photos or Drawings
To replace standard emojis with **personal drawings, doodles, or romantic couple photos**:
1. Save your photos or drawings in the project's **`/public`** directory (e.g., as `/public/photos/first_date.jpg`).
2. Open **`src/data/memories.ts`** and edit the variables, providing the absolute web path in the `imageUrl` property:

```typescript
export const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: 1,
    category: "memories",
    emoji: "🌸",
    // 📸 Just add your custom image path here!
    imageUrl: "/photos/first_date.jpg", 
    title: "The day we met",
    price: "¥108",
    plateColor: "#F7C5C5",
    rimColor: "#D0021B",
    memory: "Your custom letter message goes here..."
  },
  // Add or modify up to 8 items!
];
```

*Note: You can also use direct web URLs (such as image links from Imgur, Discord, or public Google Drive storage) in the `imageUrl` field!*

---

## Deploying to Vercel

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
