// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add this line to enable the @env module
      ["module:react-native-dotenv", {
        "envName": "APP_ENV",
        "moduleName": "@env",
        "path": ".env",
        "safe": false, // Set to true if you want to allow missing variables
        "allowUndefined": true,
        "verbose": false
      }]
    ]
  };
};
