# 🚀 MCE Club Letter Generator

An automated, premium-styled permission letter generator built for **The Malnad Technical Club (MTC)** at Malnad College of Engineering, Hassan. 

This tool helps members draft, customize, and download official, beautifully aligned A4 permission letters using the **Google Gemini API** directly from the browser.

---

## ✨ Features

- **🤖 Client-Side AI Generation**: Direct browser-side integration with Google Gemini (via Gemini 2.5 Flash), offering formal, urgent, persuasive, and polite request tones.
- **✨ Premium UI/UX Aesthetics**: Features a modern, responsive dashboard with a lightweight particle network background canvas that interacts with the user's cursor.
- **🌗 Native Light/Dark Mode**: Smooth theme toggling that changes style variables and interactive particle colors seamlessly.
- **🔍 Viewport Zoom Controls**: Scale, fit, or reset the A4 paper canvas inside your browser viewport without breaking layout constraints.
- **✍️ Inline Manual Editor**: Edit generated contents directly on the paper canvas before exporting.
- **🖨️ Pixel-Perfect A4 Export**: Advanced print stylesheets enforce page margin suppression, dynamic background-image scaling, custom physical typography (`12.5pt`/`14pt`), and precise column alignment when saving to PDF.

---

## 🛠️ Tech Stack

- **Frontend**: Standard-compliant semantic HTML5, Vanilla JavaScript (ES6+), CSS Custom Variables (Themes & Print Media)
- **Local Dev Server**: Zero-dependency native Node.js HTTP/FS module server
- **AI Core**: Google Gemini 2.5 Flash Web API (direct browser fetching)

---

## 🚀 Local Development Setup

To run and preview the dashboard locally:

1. **Prerequisites**: Ensure you have [Node.js](https://nodejs.org/) installed.
2. **Launch Server**: Open your terminal in this directory and run:
   ```bash
   node server.js
   ```
3. **Open App**: Navigate to `http://localhost:3000` in your web browser.

---

## 🎨 Updating the Letter Headers

The generator supports both **Club Letterhead** and **Event Letterhead**:
1. Open the [`header/`](file:///c:/Users/CHINMAY/Desktop/COLLEGE/CLUB/website/Letters/header) folder.
2. **`header.png`**: Replace with your normal club header image.
3. **`event.png`**: Replace with your event/fest header image when ready.
4. Whenever opening the website, users are prompted to choose between the Club and Event letterheads. You can also switch anytime using the **Switch Letterhead** button in the top navigation bar.

---

## 🔑 Configure API Key

1. When opening the app, a welcoming modal prompts configuration. Click **Configure API Key**.
2. Visit [Google AI Studio](https://aistudio.google.com/) (Sign up/log in is free and takes seconds).
3. Generate or copy your API Key and paste it into the **AI Engine Setup** panel settings.
4. Your key is stored locally in your browser's private `localStorage` and is never sent to third-party servers.

---

## 📦 Pushing to GitHub & Hosting (GitHub Pages)

Since this is a fully static project (relying on client-side requests), it can be hosted for **free** on GitHub Pages:

```bash
# 1. Rename the default branch to 'main'
git branch -M main

# 2. Add your GitHub remote URL
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# 3. Push the files
git push -u origin main
```
Once pushed:
1. Go to your repository settings on GitHub.
2. In the sidebar under **Code and automation**, click **Pages**.
3. Select **main** branch and **`/ (root)`** folder, then hit **Save**.
4. Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/`!

---

*Made with 💜 for **The Malnad Technical Club**.*
