export const getChannelDataAsFloat64 = (
  audioBuffer: AudioBuffer,
  channelIndex: number = 0
): Float64Array => {
  const float32Data = audioBuffer.getChannelData(channelIndex);
  const float64Data = new Float64Array(float32Data.length);
  float32Data.forEach((value, i) => {
    float64Data[i] = value;
  });
  return float64Data;
};
