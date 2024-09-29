export interface Word {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker: number;
  speaker_confidence: number;
}

export interface Transcription {
  words: {
    word: string;
    start: number;
    end: number;
    speaker: number;
  }[];
}