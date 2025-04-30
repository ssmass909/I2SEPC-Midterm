const path = require("path");

module.exports = {
  entry: {
    background: "./src/background/background.ts",
    content: "./src/content/content.ts",
    popup: "./src/popup/Popup.tsx",
  },
  output: {
    path: path.resolve(__dirname),
    filename: ({ chunk }) => {
      if (chunk.name === "background") return "background/background.js";
      if (chunk.name === "content") return "content/content.js";
      if (chunk.name === "popup") return "popup/popup.js";
      return "[name].js";
    },
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
  mode: "production",
};
