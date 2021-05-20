const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./app/**/*.tsx"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            pre: {
              color: null,
              backgroundColor: null,
            },
          },
        },
      },
      colors: {
        orange: colors.orange,
      },
    },
  },
  variants: {
    extend: {
      padding: ["first"],
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
