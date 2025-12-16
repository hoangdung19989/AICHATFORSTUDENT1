/**
 * Decodes a base64 string into a byte array.
 * @param base64 The base64 encoded string.
 * @returns A Uint8Array of the decoded data.
 */
function decode(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Plays an audio sound from a base64 data URI.
 * @param base64AudioData The base64 data URI (e.g., 'data:audio/wav;base64,...').
 */
export const playAudioFromBase64 = (base64AudioData: string): void => {
  try {
    // Create a new AudioContext. This is the main entry point to the Web Audio API.
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create an Audio source from the data URI
    const audio = new Audio(base64AudioData);
    const source = audioContext.createMediaElementSource(audio);
    
    // Connect the source to the context's destination (the speakers)
    source.connect(audioContext.destination);
    
    // Play the sound
    audio.play().catch(e => console.error("Audio playback failed:", e));

  } catch (error) {
    console.error("Failed to play audio:", error);
  }
};
