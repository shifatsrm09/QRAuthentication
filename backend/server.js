const path = require("path");
const dotenv = require("dotenv");
// Existing shell variables win; backend configuration takes precedence locally.
for (const file of ["backend/.env.local", "backend/.env", ".env.local", ".env"]) {
  dotenv.config({ path: path.resolve(__dirname, "..", file), quiet: true });
}
const app = require("./app");
const port = process.env.API_PORT || process.env.PORT || 5000;
if (require.main === module) {
  app.listen(port, "0.0.0.0", () => console.log("API listening on port " + port));
}
module.exports = app;
