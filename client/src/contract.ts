export const EstimatedGender = {
  Male: 1,
  Female: 2,
  MaleOrFemale: 3,
  FemaleOrMale: 4,
  Unknown: 0,
} as const;
export type EstimatedGenderValue =
  (typeof EstimatedGender)[keyof typeof EstimatedGender];

// FIXME: C# 側のJSON出力変えればいいんだけど、そのままにしちゃった
export interface VocalTractResult {
  EstimatedGender: EstimatedGenderValue;
  FemaleHeight: number;
  MaleHeight: number;
}

export const RecordingDuration = 2;
export const SampleRate = 48000;
