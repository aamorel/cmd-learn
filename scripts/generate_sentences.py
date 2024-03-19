from openai import AzureOpenAI
import dotenv
import tqdm
import json

env = dotenv.dotenv_values(".env")
API_KEY = env["AZURE_OPENAI_KEY"]

client = AzureOpenAI(
    azure_endpoint="https://openai-switzerland-gpt4.openai.azure.com/",
    api_key=API_KEY,
    api_version="2024-02-15-preview",
)

output_dir = "scripts/output/"

number_of_sentences = 20


def load_subjects():
    with open("scripts/subjects.txt", "r") as f:
        subjects = f.readlines()
    return subjects


def user_prompt(subject):
    return f"Please write a list of {number_of_sentences} short diverse english sentences about {subject} and their translations in Italian, Spanish and German. Output should be in the following format: 'English sentence' - 'Italian sentence' - 'Spanish sentence' - 'German sentence'. Do not number the sentences."


def parse_sentences(subject, sentences):
    temp_dict = {subject: []}
    for sentence in sentences:
        try:
            english, italian, spanish, german = sentence.split(" - ")
            temp_dict[subject].append({"english": english, "italian": italian, "spanish": spanish, "german": german})
        except:
            continue
    name = subject.replace(" ", "_")
    with open(f"{output_dir}{name}.json", "w") as f:
        json.dump(temp_dict, f)


def main():
    subjects = load_subjects()
    for subject in tqdm.tqdm(subjects):
        # Remove any trailing \n
        subject = subject.strip("\n")
        message_text = [
            {"role": "system", "content": "You are a linguist specialist."},
            {"role": "user", "content": user_prompt(subject)},
        ]

        completion = client.chat.completions.create(
            model="gpt3516k",
            messages=message_text,
            temperature=0.7,
            max_tokens=5000,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None,
        )
        new_message = completion.choices[0].message.content
        sentences = new_message.split("\n")
        # Remove empty sentences
        sentences = [sentence for sentence in sentences if sentence]
        parse_sentences(subject, sentences)


if __name__ == "__main__":
    main()
