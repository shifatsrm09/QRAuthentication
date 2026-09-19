// Compatibility entry point for the shared local Express server.
require("../backend/server").listen(process.env.API_PORT || process.env.PORT || 5000, "0.0.0.0");
