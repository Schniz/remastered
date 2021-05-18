module.exports = {
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc-node/jest"],
  },
};
