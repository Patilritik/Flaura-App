# Florify 🌱

**Florify** (formerly Flaura/PlantApp) is a premium, feature-rich React Native mobile application designed for plant enthusiasts. It combines a seamless plant e-commerce store with an interactive AI-powered plant scanner and detailed care guides.

---

## 🚀 Key Features

* 🌿 **Curated Plant Catalog:** Browse plants grouped by categories (Indoor, Outdoor, Accessories).
* 🔍 **Smart Product Search:** Instant search functionality to quickly find specific plants.
* 📸 **AI Plant Scanner:** Capture leaf photos using the device's camera for instant identification and care advice.
* 💧 **Interactive Care Guides:** Detailed information on light requirements, watering cycles, soil, and temperature tolerance.
* 🛒 **Complete Shopping Cart:** Manage items, adjust quantities, and experience a smooth checkout flow.
* 👤 **User Profiles:** Customize account details, update profile avatars, and securely manage active sessions.

---

## 🛠️ Technology Stack

* **Frontend:** React Native (v0.79.1) & JavaScript (ES6+)
* **Navigation:** React Navigation (Stack & Custom Bottom Tabs)
* **Local Storage:** AsyncStorage (for session persistence)
* **API Client:** Axios
* **Backend Database Node:** Hosted MongoDB Instance

---

## 📖 In-Depth Technical Documentation

For details regarding system architecture, component folder structure, navigation flows, database schemas, and API documentation, please refer to the detailed guide:
👉 **[ARCHITECTURE.md](./ARCHITECTURE.md)**

---

## ⚡ Quick Start Guide

### 1. Prerequisites
Ensure you have Node.js, Android SDK, and CocoaPods (for iOS) installed.

### 2. Installation
Install the project dependencies from the root directory:
```bash
npm install
```

### 3. Run on Emulator / Connected Device

* **Step 1: Start the Metro Server**
  ```bash
  npm start
  ```
* **Step 2: Compile & Run on Android**
  ```bash
  npm run android
  ```
* **Step 3: Compile & Run on iOS (macOS only)**
  ```bash
  cd ios && pod install && cd ..
  npm run ios
  ```

## 🗄️ Database Configuration

To run the backend server, you must set up the database connection via environment variables:

1. Create a `.env` file inside the `Server/` directory.
2. Add your MongoDB connection string:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/database_name
   PORT=5000
   ```

> [!WARNING]
> Never expose or commit database credentials, connection strings, or passwords directly to Git or markdown files. Always use ignored `.env` files for security.
