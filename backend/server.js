const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 8080;
const user_auth = require("./routes/api/user-auth");
const db = require("./config/keys").mongo_uri;

// body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set Static Folder
// app.use(express.static(path.join(__dirname, "../frontend")));

// test api call
// app.get("/api/hello", (req, res) => {
// 	console.log("called");
// 	res.send({ express: "Hello From Express" });
// });

// use api
app.use("/", user_auth);

// connect to mmlab
mongoose
	.connect(
		db,
		{
			useNewUrlParser: true
		}
	)
	.then(() => console.log("Mongodb Connected..."))
	.catch(err => console.error(err));

// Start Express Server
app.listen(port, () => console.log(`Server started on port ${port}`));
