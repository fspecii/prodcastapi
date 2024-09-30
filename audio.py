import argparse
import requests
import os
import sys
import urllib.parse

def generate_audio(input_type, content):
    # API endpoint URL
    url = "http://localhost:3000/api/generate-audio"

    # Prepare the payload
    payload = {
        "template": "podcast",
        "speaker1Voice": "aura-asteria-en",
        "speaker2Voice": "aura-arcas-en"
    }

    if input_type == 'youtube':
        payload["youtubeUrl"] = content
    else:
        payload["text"] = content

    # Send POST request to the API
    response = requests.post(url, json=payload)

    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()
        audio_url = data.get('audioUrl')
        transcript = data.get('transcript')

        if audio_url:
            # Download the audio file
            audio_filename = os.path.basename(urllib.parse.urlparse(audio_url).path)
            audio_response = requests.get(f"http://localhost:3000{audio_url}")
            
            if audio_response.status_code == 200:
                with open(audio_filename, 'wb') as f:
                    f.write(audio_response.content)
                print(f"Audio saved as: {audio_filename}")
            else:
                print("Failed to download the audio file")

        if transcript:
            # Save the transcript
            transcript_filename = "transcript.txt"
            with open(transcript_filename, 'w', encoding='utf-8') as f:
                f.write(transcript)
            print(f"Transcript saved as: {transcript_filename}")

        print("Audio generation completed successfully")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate audio from YouTube link or text input")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("-y", "--youtube", help="YouTube video URL")
    group.add_argument("-s", "--script", help="Text script for the podcast")

    args = parser.parse_args()

    if args.youtube:
        generate_audio('youtube', args.youtube)
    elif args.script:
        generate_audio('text', args.script)
    else:
        print("Please provide either a YouTube URL or a text script")
        sys.exit(1)