# cmd-learn

## Platform

macOS

## Dependencies

- Google Chrome
- If using the cmd learn app:
  - node.js
  - sqlite3

## Installation

- Clone the repository
- If using the cmd learn app, install the different npm packages:

```bash
cd app
npm install
cd ..
cd problems
npm install
cd ..
cd server
npm install
cd ..
```

## Launch

```bash
chmod +x cmd-learn.sh
./cmd-learn.sh <parameters> &
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
