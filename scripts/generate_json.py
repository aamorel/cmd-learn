import json
import os

# Load all json files in the output directory
all_jsons_dir = "scripts/output/"

output_file = "scripts/merged.json"

jsons = [f for f in os.listdir(all_jsons_dir) if f.endswith(".json")]


def remove_apostrophes_or_quotes(sentence):
    # Remove beginning and trailing apostrophes and quotes
    sentence = sentence.strip()
    sentence = sentence.strip("'")
    sentence = sentence.strip('"')

    return sentence


def remove_beginning_with_number(sentence):
    # Some sentences start with 1. or 2. or 10. etc. Remove the number and the dot
    while sentence[0].isdigit() or sentence[0] == ".":
        sentence = sentence[1:]
    return sentence


def process_value(value):
    for i in range(len(value)):
        for key, sentence in value[i].items():
            sentence = remove_apostrophes_or_quotes(sentence)
            sentence = remove_beginning_with_number(sentence)
            value[i][key] = sentence.strip()
    return value


# Each json file contains a dictionary with a single key-value pair
# The key is the subject and the value is a list of dictionaries
# Merge all the dictionaries into a single dictionary
merged_dict = {}
for json_file in jsons:
    with open(f"{all_jsons_dir}{json_file}", "r") as f:
        data = json.load(f)
    for key, value in data.items():
        value = process_value(value)
        if key in merged_dict:
            merged_dict[key] += value
        else:
            merged_dict[key] = value

# Save the merged dictionary to a single json file
with open(output_file, "w") as f:
    json.dump(merged_dict, f)
