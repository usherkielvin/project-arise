/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        system: {
          blue:   "#818CF8",    // Indigo-violet — primary SL System color
          cyan:   "#22D3EE",    // Cyan — XP bars / progress
          violet: "#A78BFA",    // Soft violet — secondary accent
          dark:   "#07091C",    // Midnight indigo — background
          surface:"#0D1235",    // Deep navy — cards
          glass:  "rgba(129, 140, 248, 0.10)",
          red:    "#F87171",    // Penalty color (soft rose)
        },
      },
      fontFamily: {
        // We'll link these later, but setting them here now
        system: ["Orbitron", "sans-serif"], 
      },
    },
  },
  plugins: [],
};
