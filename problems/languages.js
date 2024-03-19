const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

console.log("Languages insert script");
console.log(process.cwd());
console.log(process.argv);

// Assuming the JSON file is in the same directory as this script
const jsonDataPath = "./languages.json";
const dbPath = process.argv[2]; // The path to the SQLite database file is expected as an argument
const correctedDbPath = "." + dbPath;

// Function to insert data into the database
function insertData(db, domain, category, subcategory, description, answer) {
  const query = `INSERT INTO problems (domain, category, subcategory, description, answer) VALUES (?, ?, ?, ?, ?)`;
  db.run(
    query,
    [domain, category, subcategory, description, answer],
    function (err) {
      if (err) {
        return console.error(err.message);
      }
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    }
  );
}

// Read the JSON file and parse it
fs.readFile(jsonDataPath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading JSON file:", err);
    return;
  }
  const phrases = JSON.parse(data);

  // Connect to the SQLite database
  let db = new sqlite3.Database(
    correctedDbPath,
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) {
        console.error("Error connecting to the database:", err.message);
        return;
      }
      console.log("Connected to the SQLite database.");

      // Iterate over the JSON object and insert each phrase into the database
      Object.keys(phrases).forEach((subcategory) => {
        phrases[subcategory].forEach((phrase) => {
          insertData(
            db,
            "italian",
            "language",
            subcategory,
            phrase.english,
            phrase.italian
          );
          insertData(
            db,
            "spanish",
            "language",
            subcategory,
            phrase.english,
            phrase.spanish
          );
          insertData(
            db,
            "german",
            "language",
            subcategory,
            phrase.english,
            phrase.german
          );
        });
      });

      // Close the database connection
      db.close((err) => {
        if (err) {
          console.error(err.message);
        }
        console.log("Closed the database connection.");
      });
    }
  );
});
