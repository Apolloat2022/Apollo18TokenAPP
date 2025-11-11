export default {
  expo: {
    name: "Apollo18",
    slug: "apollo18",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    scheme: "apollo18",
    newArchEnabled: true,
    splash: {
      backgroundColor: "#6200EE",
      resizeMode: "contain"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#6200EE"
      }
    },
    web: {
      bundler: "metro"
    },
    plugins: [
      "expo-router"
    ],
    extra: {
      eas: {
        projectId: "your-eas-project-id"
      }
    }
  }
};