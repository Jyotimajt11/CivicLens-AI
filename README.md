# 🚀 CivicLens AI

**CivicLens AI** is a smart civic issue reporting platform that enables citizens to report local problems (like potholes, garbage, or broken infrastructure) and visualize them on an interactive map.

It combines modern web technologies with AI-driven insights to improve urban problem tracking and awareness.

---

## 🌟 Features

- 📸 Upload images of civic issues
- 📝 Add descriptions and location (area-based input)
- 🗺️ Interactive Google Maps with issue markers
- 📊 Real-time issue statistics (High / Medium / Low)
- 📍 Area-based reporting (user-friendly, no coordinates required)
- ⚡ Clean, responsive UI (mobile-friendly)

---

## 🧠 Upcoming Enhancements

- 🤖 AI-based issue classification (severity + category)
- 🔥 Heatmap visualization of problem density
- ☁️ Firebase integration for real-time data storage
- 📈 Analytics dashboard for insights
- 👤 User authentication system

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS
- **Maps:** Google Maps JavaScript API
- **State Management:** React Hooks
- **AI (Planned):** Gemini API
- **Backend (Planned):** Firebase

---

## 📂 Project Structure

```
first-app/
│── src/
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── DashboardPage.jsx
│   ├── services/
│   ├── hooks/
│   ├── utils/
│── public/
│── .env
│── package.json
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```
git clone https://github.com/YOUR_USERNAME/civiclens-ai.git
cd civiclens-ai
```

---

### 2. Install dependencies

```
npm install
```

---

### 3. Setup environment variables

Create a `.env` file in the root directory:

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

### 4. Run the development server

```
npm run dev
```

---

## 🗺️ How It Works

1. User submits an issue with image + description
2. Selects or enters location
3. Issue appears on dashboard and map
4. (Upcoming) AI classifies severity and category
5. (Upcoming) Data stored and visualized using Firebase

---

## 🎯 Use Case

CivicLens AI helps:

- Citizens report local issues easily
- Authorities identify problem hotspots
- Communities improve accountability

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repo and submit a pull request.

---

## 📜 License

This project is open-source and available under the MIT License.

---

## 👩‍💻 Author

**Jyotima Tomar**

- GitHub: https://github.com/Jyotimajt11

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
