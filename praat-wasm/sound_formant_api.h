#ifndef SOUND_FORMANT_API_H
#define SOUND_FORMANT_API_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stddef.h>
#include <stdint.h>

// Returns 0 on success. On success:
//  - *outFrequencies -> pointer to array of length (*outNumberOfFrames * nFormants)
//  - *outBandwidths  -> same length, paired by index
// Caller must free *outFrequencies and *outBandwidths with sound_formant_free().
int sound_to_formant_burg(
    const double* samples, int nSamples, double samplingRate,
    int nFormants, double dt /*frame step in s, 0 for default*/,
    double maximumFrequency /*0 for nyquist*/, double halfdt_window /*0 for default*/,
    double preemphasisFrequency /*e.g. 50.0*/,
    double** outFrequencies, double** outBandwidths,
    int* outNumberOfFrames);

void sound_formant_free(void* p);

// Pitch extraction (returns 0 on success).
// On success:
//  - *outTimes -> pointer to array of length *outNumberOfFrames (frame times in s)
//  - *outPitches -> pointer to array of length *outNumberOfFrames (Hz), 0.0 for unvoiced
// Caller must free *outTimes and *outPitches with sound_formant_free().
int sound_to_pitch(
    const double* samples, int nSamples, double samplingRate,
    double timeStep /*0 for automatic*/, double pitchFloor, double pitchCeiling,
    double** outTimes, double** outPitches, int* outNumberOfFrames);

#ifdef __cplusplus
}
#endif

#endif // SOUND_FORMANT_API_H
