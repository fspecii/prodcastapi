import argparse
import requests
import time
import os
import json

def main(audio_file):
    # API endpoints
    transcribe_url = "http://localhost:3000/api/transcribe"
    generate_video_url = "http://localhost:3000/api/generate-video"

    # Step 1: Transcribe audio
    print("Transcribing audio...")
    with open(audio_file, "rb") as f:
        files = {"audio": (os.path.basename(audio_file), f, "audio/mpeg")}
        response = requests.post(transcribe_url, files=files)
    
    if response.status_code != 200:
        print(f"Error transcribing audio: {response.text}")
        return

    transcription_data = response.json()
    
    # Print the full JSON response
    print("Transcription JSON response:")
    print(json.dumps(transcription_data, indent=2))

    # Step 2: Generate video
    print("Generating video...")
    response = requests.post(generate_video_url, json={
        "tempFileName": transcription_data["tempFileName"],
        "audioFileName": transcription_data["audioFileName"],
        "audioDuration": transcription_data["audioDuration"]
    })
    
    if response.status_code != 200:
        print(f"Error generating video: {response.text}")
        return

    video_data = response.json()
    video_url = video_data["videoUrl"]
    print(f"Video generated: {video_url}")

    # Step 3: Download the video
    print("Downloading video...")
    video_response = requests.get(f"http://localhost:3000{video_url}")
    if video_response.status_code == 200:
        output_file = os.path.basename(video_url)
        with open(output_file, "wb") as f:
            f.write(video_response.content)
        print(f"Video downloaded: {output_file}")
    else:
        print(f"Error downloading video: {video_response.text}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test audio transcription and video generation API")
    parser.add_argument("-a", "--audio", required=True, help="Path to the audio file")
    args = parser.parse_args()

    if not os.path.exists(args.audio):
        print(f"Error: Audio file '{args.audio}' not found.")
    else:
        main(args.audio)