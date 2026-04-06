const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Import D.1 + D.2 routes
const downloadRoutes = require("./downloadRoutes");
app.use("/api", downloadRoutes);

// Optional: serve static files if needed
app.use("/comics", express.static(path.join(__dirname, "comics")));

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
