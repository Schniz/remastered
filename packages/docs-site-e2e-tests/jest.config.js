module.exports = {
  testRegex: "(\\.|/)(test|spec)\\.tsx?$",
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc-node/jest"],
  },
};
