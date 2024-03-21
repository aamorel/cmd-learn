# `cmd-learn`

![](/app/public/logo.png)

`cmd-learn` is a tool that helps you make use of your time while waiting for a command to finish.

- When launched in background in a terminal, it will monitor commands that take a long time (for now based on a threshold, not predictive).
- When such a command is issued in the SAME terminal, it will open a browser window
- When the command is finished. It can also notify you when the command is finished.

It can open several types of pages:

- A random Wikipedia article
- A custom URL
- The `cmd-learn-app`. This is a simple webapp that makes you answer quick problems on different topics. For now, I've created problems to learn some basic phrases in Italian, Spanish, and German.

## Platform

For now, it's only available for macOS.

## Dependencies

- Google Chrome
- If using the `cmd-learn-app`:
  - node.js
  - sqlite3

## Installation

- Clone the repository
- If using the `cmd-learn-app`:

  ```bash
  chmod +x install.sh
  ./install.sh
  ```

## Launch

```bash
chmod +x cmd-learn.sh

# To open random wikipedia articles
./cmd-learn.sh --random-wiki &

# To open the cmd learn app
./cmd-learn.sh --app &

# To open a custom URL
./cmd-learn.sh --url <url> &

# Example of command that gets caught
sleep 30
```

This launches the monitoring script in the background.

## Parameters

Required:

- `--app`: Launch the cmd learn app.

  or

- `--url <url>`: The URL to launch instead of the cmd learn app.

  or

- `--random-wiki`: Open a random Wikipedia article. Always notifies the user and doesn't close the browser.

Optional:

- `--mode <closeandnotify|notify|close>`: The mode to use. Default is `close`. `close` just closes the opened browser window. `notify` just notifies the user. `closeandnotify` does both (can be useful if you are distracted and moved to another window).
- `--threshold <threshold>`: The threshold in seconds after a command is considered long. Default is 3 seconds.

## `cmd-learn-app`

### Architecture

The app is composed of 3 parts:

- The sqlite3 database that contains the problems.
- The server that serves the problems.
- The react app that displays the problems.

### DB Schema

The database contains 1 table: `problems`.

    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    description TEXT NOT NULL,
    answer TEXT NOT NULL,
    answered BOOLEAN NOT NULL DEFAULT 0,
    answer_date TEXT

- `domain`: The domain of the problem (e.g. `italian`).
- `category`: The category of the problem (e.g. `language`).
- `subcategory`: The subcategory of the problem (e.g. `at the hotel`).
- `description`: The description of the problem. For example, for language problems, it's the phrase to translate.
- `answer`: The answer to the problem.
- `answered`: A boolean that indicates if the problem has been answered.
- `answer_date`: The date when the problem was answered.

### Adding new problems

You can add new problems by creating a new `js` script in the `problems` folder. It should insert the problems in the database (see `problems/languages.js` for an example).

The parent script will automatically run all the scripts in the `problems` folder if the db does not exist.

## Future work and contributions

This is a project for fun. Any idea, comments and critics are welcome. If you want to contribute, feel free to open a PR.
