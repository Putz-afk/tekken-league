// postcss.config.mjs
const config = {
  plugins: [
    "@tailwindcss/postcss", // Tailwind CSS v4 plugin
    "autoprefixer",         // Autoprefixer for vendor prefixes
  ],
};

export default config;