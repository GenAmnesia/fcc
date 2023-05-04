const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongo = require("mongodb");
const mongoose = require("mongoose");
require("dotenv").config();

//Basic Config
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const Schema = mongoose.Schema;

//DB Schemas
const userSchema = new Schema({
  username: { type: String, required: true },
});
const User = mongoose.model("user", userSchema);
const exerciseSchema = new Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date },
});
const Exercise = mongoose.model("exercise", exerciseSchema);

//DB Funcs
const createUser = (username, next) => {
  const user = new User({ username: username });
  user.save((err, data) => {
    if (err) console.log(err);
    next(null, data);
  });
};

const findUsers = (next) => {
  User.find((err, data) => {
    if (err) console.log(err);
    next(null, data);
  });
};

const findOneUser = (uid, next) => {
  User.findOne({ _id: uid })
    .select({ __v: 0 })
    .exec((err, data) => {
      if (err) console.log(err);
      next(null, data);
    });
};

const createExercise = (exercise, next) => {
  const myexercise = new Exercise(exercise);
  myexercise.save((err, data) => {
    if (err) console.log(err);
    next(null, data);
  });
};

const findExercisesByUserId = (
  uid,
  from = new Date(1970 - 01 - 01),
  to = new Date(),
  limit = 0,
  next
) => {
  Exercise.find({
    userId: uid,
    date: { $gt: new Date(from), $lt: new Date(to) },
  })
    .limit(limit)
    .select({ __v: 0 })
    .exec((err, data) => {
      if (err) console.log(err);
      next(null, data);
    });
};

//Controllers
app
  .route("/api/users")
  .post((req, res) => {
    const username = req.body.username;
    createUser(username, (err, data) => {
      if (err) console.log(err);
      res.json({ _id: data._id, username: data.username });
    });
  })
  .get((req, res) => {
    findUsers((err, data) => {
      if (err) console.log(err);
      res.json(data);
    });
  });

app.route("/api/users/:_id/exercises").post((req, res) => {
  const { _id, description, duration } = req.body;
  const date = req.body.date ? new Date(req.body.date) : new Date();
  const newExercise = {
    userId: req.params._id,
    description: description,
    duration: duration,
    date: date,
  };
  createExercise(newExercise, (err, data) => {
    if (err) console.log(err);
    findOneUser(data.userId, (err, userData) => {
      if (err) console.log(err);
      res.json({
        _id: userData._id,
        username: userData.username,
        description: data.description,
        duration: data.duration,
        date: data.date.toDateString(),
      });
    });
  });
});

app.route("/api/users/:_id/logs").get((req, res) => {
  findExercisesByUserId(
    req.params._id,
    req.query.from,
    req.query.to,
    req.query.limit,
    (err, data) => {
      if (err) console.log(err);
      const cleanedData = data.map((datum) => ({
        description: datum.description,
        duration: datum.duration,
        date: datum.date.toDateString(),
      }));
      findOneUser(req.params._id, (err, userData) => {
        if (err) console.log(err);
        res.json({
          username: userData.username,
          count: data.length,
          _id: userData._id,
          log: cleanedData,
        });
      });
    }
  );
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
