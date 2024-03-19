const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

// Connect to SQLite database
const db = new sqlite3.Database(
  "../db/mydatabase.db",
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Connected to the SQLite database.");
  }
);

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/problems", (req, res) => {
  const domain = req.query.domain;
  const sql = "SELECT * FROM problems WHERE domain = ?";
  db.all(sql, [domain], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

app.get("/domains", (req, res) => {
  const sql = "SELECT DISTINCT domain, category FROM problems";

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

app.get("/subcategories", (req, res) => {
  const domain = req.query.domain;
  const sql = "SELECT DISTINCT subcategory FROM problems WHERE domain = ?";
  db.all(sql, [domain], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

// Tick a problem as solved
app.put("/problems/:id", (req, res) => {
  const id = req.params.id;
  const date = new Date().toISOString();
  const sql = "UPDATE problems SET answered = 1, answer_date = ? WHERE id = ?";
  db.run(sql, [date, id], (err) => {
    if (err) {
      throw err;
    }
    res.json({ id: id, solved: true });
  });
});

// Close the database connection when the server is stopped
app.on("close", () => {
  db.close();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
