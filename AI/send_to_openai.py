# TODO: Import your libaries
from secrets import API_KEY
from openai import OpenAI
from pathlib import Path
import base64
import sys

# TODO: Maybe you need a key?
client = OpenAI(api_key = API_KEY)

# Image encoding, code provided
def encode_image(image_path):
    with open(image_path, "rb") as image_F:
        return base64.b64encode(image_F.read()).decode('utf-8')


# TODO: Sending a request and getting a response



# TODO: How do we make things audible?



# TODO: Can we put everything together?


def send_photo(image_path):
    base64_image = encode_image(image_path)
    image_url = f"data:image/jpeg;base64,{base64_image}"
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "What's in this image?"},
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url}
                    }
                ]
            }
        ]
    )
    return response.choices[0].message.content


def make_audible(image_path):

    speech_file_path = Path(__file__).parent / "speech.mp3"
    
    with client.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice="coral",
        input="Can you turn this into an audio file?: " + send_photo(image_path)
    ) as response:
        response.stream_to_file(speech_file_path)