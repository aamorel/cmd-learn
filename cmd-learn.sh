#!/bin/bash

# Default
MODE="close"
URL="http://localhost:3000" # Default URL
THRESHOLD=3 # Set the threshold for command execution time in seconds
APP_DIR="./app"
DB_DIR="./db"
DB_FILE="$DB_DIR/mydatabase.db"
LAUNCH_OPTION="" # Tracks which launch option is selected


# Iterate over all arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app) LAUNCH_OPTION="app"; shift ;;
        --url) URL="$2"; LAUNCH_OPTION="url"; shift 2 ;;
        --random-wiki) URL="https://en.wikipedia.org/wiki/Special:Random"; LAUNCH_OPTION="random-wiki"; MODE="notify"; shift ;;

        --mode) MODE="$2"; shift ;;
        --threshold) THRESHOLD="$2"; shift 2 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Check that one of the required options is provided
if [ -z "$LAUNCH_OPTION" ]; then
    echo "Error: You must specify one of --app, --url <url>, or --random-wiki."
    exit 1
fi

# Check that MODE is either close, notify or closeandnotify
if [ "$MODE" != "close" ] && [ "$MODE" != "notify" ] && [ "$MODE" != "closeandnotify" ]; then
    echo "Error: MODE must be either 'close', 'notify' or 'closeandnotify'."
    exit 1
fi

echo "Mode: $MODE"
echo "URL: $URL"
echo "Threshold: $THRESHOLD"


############ Functions ############

# Function to initialize the database
initialize_db() {
    echo "Initializing database..."
    # Ensure the /db directory exists
    mkdir -p "$DB_DIR"
    
    # Initialize the database and create the 'problems' table
    sqlite3 "$DB_FILE" <<EOF
CREATE TABLE IF NOT EXISTS problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    description TEXT NOT NULL,
    answer TEXT NOT NULL,
    answered BOOLEAN NOT NULL DEFAULT 0,
    answer_date TEXT
);
EOF

    echo "Database initialized."

    # Enter the directory with the problems
    pushd ./problems > /dev/null

    # Assuming you have a directory ./jsons with JSON files to populate the database
    for insert_file in ./*.js; do
        # Run the JavaScript file with Node.js, passing the DB_FILE as an argument
        node "$insert_file" "$DB_FILE"
    done

    # Return to the original directory
    popd > /dev/null
}

# Function to start the React app server
start_app() {
    echo "Starting React and Node app..."
    # Change to the app directory
    pushd "$APP_DIR" > /dev/null
    # Start the server in the background (whithout opening the browser)
    BROWSER=none npm start > /dev/null 2>&1 &
    # Capture the server's PID so we can stop it later
    REACT_PID=$!
    # Return to the original directory
    popd > /dev/null

    # Starting the Node.js server
    pushd "server" > /dev/null
    node server.js > /dev/null 2>&1 &
    SERVER_PID=$!
    popd > /dev/null
}

# Function to stop the React app server
stop_app() {
    echo "Stopping React and Node server app..."
    if [ ! -z "$REACT_PID" ]; then
        kill $REACT_PID
        echo "React app stopped."
    fi

    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID
        echo "Node.js server stopped."
    fi
}

############ Main Script ############

CURRENT_TTY=$(tty)
SCRIPT_PGID=$(ps -o pgid= $$ | grep -o '[0-9]*')
SCRIPT_START_TIME=$(date +%s)

# If URL is the default, open the whole db server react
if [ "$URL" == "http://localhost:3000" ]; then
    # Check if the database file exists and initialize if not
    if [ ! -f "$DB_FILE" ]; then
        initialize_db
    else
        echo "Database already initialized."
    fi
    # Trap script termination signals to clean up
    trap stop_app EXIT

    # Start the app
    start_app
fi

# Infinite loop to continuously check running processes
while true; do

    # List processes, filtering out the script's PGID and matching the current TTY
    ps -eo tty,pgid,pid,etime,command | grep `echo $CURRENT_TTY | cut -d'/' -f3` | grep -v $SCRIPT_PGID | while read tty pgid pid etime command; do
        # Skip lines that don't match a process or match the shell process
        if [[ ! $tty || ! $pgid || ! $pid || ! $etime ]]; then
            continue
        fi

        # Use the current time and the script start time to decide if the process is too new
        CURRENT_TIME=$(date +%s)
        SCRIPT_ELAPSED_TIME=$((CURRENT_TIME - SCRIPT_START_TIME))
        
        # Assuming processes starting within the first few seconds might be too new
        if [ "$SCRIPT_ELAPSED_TIME" -lt 2 ]; then
            # echo "Skipping process $pid: $command (too new)"
            continue
        fi

        # Convert etime to total seconds.
        # etime format can be either [[dd-]hh:]mm:ss or mm:ss, so we need to handle both cases.
        IFS="-" read days rest <<< "$etime"
        if [[ $rest ]]; then
            # days are specified
            IFS=":" read hours minutes seconds <<< "$rest"
        else
            IFS=":" read hours minutes seconds <<< "$days"
            days=0
            [[ ! $seconds ]] && { seconds=$minutes; minutes=$hours; hours=0; } # Shift if mm:ss format
        fi
        days=${days:-0}
        hours=${hours:-0}
        minutes=${minutes:-0}
        seconds=${seconds:-0}
        TOTAL_SECONDS=$(( (10#$days*24*60*60) + (10#$hours*60*60) + (10#$minutes*60) + 10#$seconds ))

        # Skip processes where the elapsed time is greater than the script's elapsed time.
        if [ "$TOTAL_SECONDS" -gt "$SCRIPT_ELAPSED_TIME" ]; then
            # echo "Skipping process $pid: $command (too old)"
            continue
        fi

        # Convert elapsed time to total seconds for comparison
        IFS=: read -r minute second <<< "$etime"
        minute=${minute:-0}
        second=${second:-0}
        total_seconds=$((10#$minute*60 + 10#$second))

        # Check if the total execution time exceeds the threshold
        if [ "$total_seconds" -gt "$THRESHOLD" ]; then
            echo "Long-running command detected in this terminal: PID=$pid, Command=$command"
            echo "Elapsed time: $etime"
            echo "Total seconds: $total_seconds"

            osascript -e 'tell application "Google Chrome" to tell (make new window) to set URL of active tab to "'$URL'"'

            echo "$(ps -p $pid)"

            # Wait for the process to finish
            while ps -p $pid > /dev/null; do
                sleep 1
            done

            if [ "$MODE" == "close" ]; then
                osascript -e 'tell application "Google Chrome" to close (tabs of window 1 whose URL contains "'$URL'")'
            elif [ "$MODE" == "notify" ]; then
                osascript -e 'display notification "Command finished" with title "CMD Learn"'
            elif [ "$MODE" == "closeandnotify" ]; then
                osascript -e 'tell application "Google Chrome" to close (tabs of window 1 whose URL contains "'$URL'")'
                osascript -e 'display notification "Command finished" with title "CMD Learn"'
            fi
        fi
    done
    sleep 1 # Wait a bit before checking again to reduce system load
done
