import express from "express";

const app = express();

const PORT = "3000";

app.listen(PORT, () => {
  console.log(`This app is running on port ${PORT}`);
});
