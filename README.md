# Rio Translate🌐

A real-time multilingual speech translation application that combines **Gladia
AI** for speech recognition with **Google Translate** for accurate translations.
Built with React Native (Expo) and NestJS, transLingua provides seamless
real-time translation across multiple languages with an intuitive carousel-based
interface.

## ✨ Features

- 🎤 **Real-time Speech Recognition** - Powered by Gladia AI
- 🌍 **Multi-language Translation** - Google Translate integration
- 📱 **Cross-platform Mobile App** - React Native with Expo
- 🎠 **Carousel Interface** - Smooth translation browsing
- ⚡ **Real-time Processing** - WebSocket-based communication
- 🎨 **Modern UI** - NativeWind styling with smooth animations
- 🔧 **Configurable Settings** - Customizable language preferences

## 🏗️ Architecture

```
transLingua/
├── mobile/          # React Native (Expo) mobile app
├── backend/         # NestJS API server
└── README.md
```

## 🛠️ Tech Stack

### Mobile App (React Native + Expo)

- **Framework**: React Native 0.76.7 with Expo 52
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Hooks
- **Audio Processing**: @siteed/expo-audio-studio
- **Animations**: react-native-reanimated + react-native-gesture-handler
- **UI Components**:
  - react-native-reanimated-carousel
  - @expo/vector-icons
  - react-native-toast-message
- **Networking**: Socket.IO client

### Backend (NestJS)

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Translation**: Google Cloud Translate API
- **Real-time Communication**: Socket.IO
- **Architecture**: Modular with dependency injection

### AI Services

- **Speech Recognition**: [Gladia AI](https://gladia.io/) - Real-time
  speech-to-text
- **Translation**: Google Cloud Translate API - Multi-language translation

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd transLingua
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Google Cloud Translate API
GOOGLE_TRANSLATE_PROJECT_ID=your-project-id
GOOGLE_TRANSLATE_PROJECT_KEY_ID=your-key-id
GOOGLE_TRANSLATE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_TRANSLATE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_TRANSLATE_CLIENT_ID=your-client-id
```

#### Start Backend Server

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### 3. Mobile App Setup

```bash
cd mobile
npm install
```

#### Environment Variables

Create a `.env` file in the `mobile` directory:

```env
# Gladia AI Configuration
EXPO_PUBLIC_GLADIA_API_URL=https://api.gladia.io
EXPO_PUBLIC_GLADIA_API_KEY=your-gladia-api-key

# Backend API (if using local development)
EXPO_PUBLIC_API_URL=http://localhost:3000
```

#### Start Mobile App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## 🔧 Configuration

### Gladia AI Setup

1. Sign up at [Gladia.io](https://gladia.io/)
2. Get your API key from the dashboard
3. Add the API key to your mobile app's `.env` file

### Google Cloud Translate Setup

1. Create a Google Cloud Project
2. Enable the Cloud Translation API
3. Create a service account with Translation API permissions
4. Download the service account JSON key
5. Add the credentials to your backend's `.env` file

### Language Configuration

The app supports up to 4 languages simultaneously:

- Primary language (auto-detected)
- Secondary language
- Tertiary language
- Fourth language

Configure languages in the app settings.

## 📱 Usage

1. **Start the App**: Launch the mobile application
2. **Configure Languages**: Go to settings and select your target languages
3. **Begin Recording**: Tap the record button to start speech recognition
4. **View Translations**: Swipe through the carousel to see translations in
   different languages
5. **Stop Recording**: Tap stop when finished

## 🎯 Key Features Explained

### Real-time Speech Recognition

- Uses Gladia AI for high-accuracy speech-to-text
- Supports multiple languages with auto-detection
- Real-time audio streaming via WebSocket

### Multi-language Translation

- Google Cloud Translate integration
- Simultaneous translation to multiple languages
- High-quality translation with context awareness

### Carousel Interface

- Each translation section is a separate carousel item
- Smooth horizontal swiping between languages
- Auto-scroll to latest translations
- Page indicator showing current position

### Audio Processing

- High-quality audio recording (16kHz, 16-bit PCM)
- Real-time audio analysis and streaming
- Background audio support

## 🔌 API Endpoints

### Backend API

- `POST /google-translate` - Translate text to multiple languages
- `WebSocket /transcription` - Real-time speech processing

### Mobile App

- Real-time WebSocket connection to Gladia AI
- REST API calls to backend for additional translations

## 🧪 Development

### Code Structure

```
mobile/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── pages/              # App screens
├── config/             # App configuration
├── types/              # TypeScript type definitions
└── assets/             # Images and static assets

backend/
├── src/
│   ├── google-translate/    # Translation service
│   ├── transcription/       # Speech processing
│   └── app.module.ts        # Main app module
└── dist/                    # Compiled JavaScript
```

### Available Scripts

#### Mobile App

```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator
npm run web        # Run in web browser
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

#### Backend

```bash
npm run start:dev  # Start development server with hot reload
npm run build      # Build for production
npm run start      # Start production server
npm run test       # Run tests
npm run lint       # Run ESLint
```

## 🚀 Deployment

### Mobile App (EAS Build)

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

### Backend (Vercel)

The backend is configured for Vercel deployment with `vercel.json`.

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 🙏 Acknowledgments

- [Gladia AI](https://gladia.io/) for speech recognition capabilities
- [Google Cloud Translate](https://cloud.google.com/translate) for translation
  services
- [Expo](https://expo.dev/) for React Native development platform
- [NestJS](https://nestjs.com/) for the backend framework

## 📞 Support

For support, email edwardphyo115@gmail.com or create an issue in this
repository.

---

**Made with ❤️ for seamless multilingual communication**
