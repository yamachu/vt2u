import { useCallback, useRef } from "react";

export function useAudioRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext>(null);

  const startRecording = useCallback(
    (sampleRate: number, duration: number): Promise<AudioBuffer> => {
      return new Promise((resolve, reject) => {
        navigator.mediaDevices
          .getUserMedia({
            audio: {
              // Disable automatic audio processing for better formant analysis
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,

              sampleRate: { ideal: sampleRate },
              channelCount: { ideal: 1 },
            },
          })
          .then((stream) => {
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            if (!audioContextRef.current) {
              audioContextRef.current = new AudioContext();
            }

            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
              }
            };

            mediaRecorder.onstop = async () => {
              stream.getTracks().forEach((track) => track.stop());

              const audioBlob = new Blob(audioChunksRef.current, {
                type: "audio/webm",
              });

              try {
                const arrayBuffer = await audioBlob.arrayBuffer();
                const audioBuffer =
                  await audioContextRef.current!.decodeAudioData(arrayBuffer);

                resolve(audioBuffer);
              } catch (error) {
                reject(error);
              }
            };

            setTimeout(() => {
              if (
                mediaRecorder.state === "recording" ||
                mediaRecorder.state === "paused"
              ) {
                mediaRecorder.stop();
              }
            }, duration);

            mediaRecorder.start();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    []
  );

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      (mediaRecorderRef.current.state === "recording" ||
        mediaRecorderRef.current.state === "paused")
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return {
    startRecording,
    stopRecording,
  };
}
