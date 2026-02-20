const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const readingRoutes = require("./routes/readings.js");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", readingRoutes);

// Connect to local MongoDB Atlas
mongoose.connect("mongodb+srv://poolUser:poolUser123@poolcluster.brghuqk.mongodb.net/poolmonitor?appName=PoolCluster")
  .then(() => console.log("Atlas Database Connected Successfully..."))
  .catch(err => console.log(err));

const port = 8080;
app.listen(port, () => console.log(`Dashboard API running at http://localhost:${port}`));