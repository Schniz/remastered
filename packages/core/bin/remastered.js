#!/usr/bin/env node

require = require("esm")(module, { force: true });
require("../dist/src/cli");
