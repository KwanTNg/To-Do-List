const PORT = process.env.PORT ?? 8000;
const express = require("express");
const mongoose = require("mongoose");
const Todo = require("./models/todoModel.js");
const User = require("./models/userModel.js");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const app = express();
const pool = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());

const DB = process.env.MONGODB.replace("<PASSWORD>", process.env.MONGODB_PW);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log("DB connection successful!");
  });

// get all todos by email (SQL)
// app.get("/todos/:userEmail", async (req, res) => {
//   const { userEmail } = req.params;
//   try {
//     const todos = await pool.query(
//       "SELECT * FROM todos WHERE user_email = $1",
//       [userEmail]
//     );
//     res.json(todos.rows);
//   } catch (err) {
//     console.log(err);
//   }
// });

//get all todos by email (MONGO)
app.get("/todos/:userEmail", async (req, res) => {
  const { userEmail } = req.params;
  try {
    const todo = await Todo.find({ user_email: userEmail });
    return res.json(todo);
  } catch (err) {
    console.log(err);
  }
});

// create a new todo (SQL)
// app.post("/todos", async (req, res) => {
//   const { user_email, title, progress, date } = req.body;
//   console.log(user_email, title, progress, date);
//   const id = uuidv4();
//   try {
//     const newToDo = await pool.query(
//       `INSERT INTO todos(id, user_email, title, progress, date) VALUES($1, $2, $3, $4, $5)`,
//       [id, user_email, title, progress, date]
//     );
//     res.json(newToDo);
//   } catch (err) {
//     console.error(err);
//   }
// });

// create a new todo (MONGO)
app.post("/todos", async (req, res) => {
  const { user_email, title, progress, date } = req.body;
  try {
    const newToDo = await Todo.create({ user_email, title, progress, date });
    res.json(newToDo);
  } catch (err) {
    console.error(err);
  }
});
// edit a new todo (SQL)
// app.put("/todos/:id", async (req, res) => {
//   const { id } = req.params;
//   const { user_email, title, progress, date } = req.body;
//   try {
//     const editTodo = await pool.query(
//       "UPDATE todos SET user_email = $1, title = $2, progress = $3, date = $4 WHERE id = $5;",
//       [user_email, title, progress, date, id]
//     );
//     res.json(editTodo);
//   } catch (err) {
//     console.error(err);
//   }
// });
// edit a new todo(MONGO)
app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { user_email, title, progress, date } = req.body;
  try {
    const editTodo = await Todo.findByIdAndUpdate(id, req.body);
    res.json(editTodo);
  } catch (err) {
    console.error(err);
  }
});

// delete a todo (SQL)
// app.delete("/todos/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deleteToDo = await pool.query("DELETE FROM todos WHERE id = $1", [
//       id,
//     ]);
//     res.json(deleteToDo);
//   } catch (err) {
//     console.error(err);
//   }
// });

// delete a todo (MONGO)
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteToDo = await Todo.findByIdAndDelete(id);
    res.json(deleteToDo);
  } catch (err) {
    console.error(err);
  }
});

// signup (SQL)
// app.post("/signup", async (req, res) => {
//   const { email, password } = req.body;
//   const salt = bcrypt.genSaltSync(10);
//   const hashedPassword = bcrypt.hashSync(password, salt);
//   try {
//     const signUp = await pool.query(
//       `INSERT INTO users (email, hashed_password) VALUES($1, $2)`,
//       [email, hashedPassword]
//     );
//     const token = jwt.sign({ email }, "secret", { expiresIn: "1hr" });
//     res.json({ email, token });
//   } catch (err) {
//     console.error(err);
//     if (err) {
//       res.json({ detail: err.detail });
//     }
//   }
// });

// signup (MONGO)
app.post("/signup", async function (req, res) {
  const { email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  try {
    const newUser = new User({
      email: email,
      hashed_password: hashedPassword,
    });
    const signUp = await User.create(newUser);
    const token = jwt.sign({ email }, "secret", { expiresIn: "1hr" });
    res.json({ email, token });
  } catch (err) {
    console.log(err.message);
    res.send({ detail: err.message });
  }
});

// login (SQL)
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const users = await pool.query("SELECT * FROM users WHERE email = $1", [
//       email,
//     ]);
//     if (!users.rows.length) return res.json({ detail: "User does not exist!" });
//     const success = await bcrypt.compare(
//       password,
//       users.rows[0].hashed_password
//     );
//     const token = jwt.sign({ email }, "secret", { expiresIn: "1hr" });
//     if (success) {
//       res.json({ email: users.rows[0].email, token });
//     } else {
//       res.json({ detail: "Login failed" });
//     }
//   } catch (err) {
//     console.error(err);
//   }
// });

// login (MONGO)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const users = await User.findOne({ email });
    if (!users) return res.json({ detail: "User does not exist!" });
    const success = await bcrypt.compare(password, users.hashed_password);
    const token = jwt.sign({ email }, "secret", { expiresIn: "1hr" });
    if (success) {
      res.json({ email: users.email, token });
    } else {
      res.json({ detail: "Login failed" });
    }
  } catch (err) {
    console.error(err);
  }
});

app.listen(PORT, () => `Server running on PORT ${PORT}`);
