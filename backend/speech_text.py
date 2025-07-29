from pathlib import Path
from openai import OpenAI
from secret import API_KEY

client = OpenAI(api_key = API_KEY)
speech_file_path = Path(__file__).parent / "speech.mp3"

with client.audio.speech.with_streaming_response.create(
    model="gpt-4o-mini-tts",
    voice="coral",
    input="hi how are u",
    instructions="Speak in a cheerful and positive tone.",
) as response:
    response.stream_to_file(speech_file_path)