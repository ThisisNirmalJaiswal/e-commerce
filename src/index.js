const express = require("express");
const route = require("./routes/routes");
const mongoose = require("mongoose");
const multer = require("multer");
const app = express();

app.use(express.json());
app.use(multer().any())

mongoose
  .connect(
    "mongodb+srv://Pankaj_:66Pbd7EVzng1k4jK@cluster0.wn2mrjr.mongodb.net/group58Database?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));


app.use("/", route);

app.listen(3000, function () {
  console.log("Express app running on port 3000")
});
