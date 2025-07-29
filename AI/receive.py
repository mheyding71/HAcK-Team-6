# TODO: import your module
import requests
import os
import sys
from send_to_openai import send_photo, make_audible

# Get the folder where the script is located, done for you
script_dir = os.path.dirname(os.path.abspath(__file__))
filename = os.path.join(script_dir, "downloaded_image.jpg")

url = "http://192.168.0.142/1600x1200.jpg"             # You will have to change the IP Address

# Function to download the image from esp32, given to you
def download_image():
    response = requests.get(url)

    if response.status_code == 200:
        with open(filename, "wb") as f:
            f.write(response.content)
        print(f"Image saved to: {filename}")
    else:
        print("Failed to download image. Status code:", response.status_code)

# TODO: Download the image and get a response from openai

download_image()
response = send_photo(filename)
print("Response from OpenAI:", response)
make_audible(filename)
# TODO: How to control when to take photo?

def take_photo():
    trigger_url = url
    response = requests.get(trigger_url)
    if response.status_code == 200:
        print("Photo taken successfully.")
    else:
        print("Failed to take photo. Status code:", response.status_code)   
