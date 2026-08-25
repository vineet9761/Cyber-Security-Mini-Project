const express = require("express");
const path = require("path");

const scannerRoute = require("./routes/scanner");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", scannerRoute);


 app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
 });