#include "sound_formant_api.h"
#include <stdlib.h>
#include <math.h>

#include "fon/Sound.h"
#include "fon/Sound_to_Formant.h"
#include "fon/Formant.h"
#include "fon/Sound_to_Pitch.h"
#include "fon/Pitch.h"

extern "C" {

int sound_to_formant_burg(
    const double* samples, int nSamples, double samplingRate,
    int nFormants, double dt,
    double maximumFrequency, double halfdt_window,
    double preemphasisFrequency,
    double** outFrequencies, double** outBandwidths,
    int* outNumberOfFrames)
{
    if (!samples || nSamples <= 0 || samplingRate <= 0.0 || nFormants <= 0) {
        return 1;
    }

    // Create a Sound from samples
    double duration = (double)nSamples / samplingRate;
    try {
        autoSound sound = Sound_createSimple(1, duration, samplingRate);
        // Copy samples into sound->z[1][i]
        for (int i = 0; i < nSamples && i < (int)sound->nx; ++i) {
            sound->z[1][i+1] = samples[i];
        }

        // Call formant analysis
        int poles = 2 * nFormants;
        double maxFreq = maximumFrequency > 0.0 ? maximumFrequency : 0.0;
        autoFormant formant = Sound_to_Formant_burg(sound.get(), dt, nFormants, maxFreq, halfdt_window, preemphasisFrequency);

        int nFrames = formant->nx;
        int outCount = nFrames * nFormants;
        double* freqs = (double*)malloc(sizeof(double) * outCount);
        double* bws = (double*)malloc(sizeof(double) * outCount);
        for (int i = 0; i < outCount; ++i) { freqs[i] = NAN; bws[i] = NAN; }

        for (int iframe = 1; iframe <= formant->nx; ++iframe) {
            Formant_Frame ff = & formant->frames[iframe];
            int nFound = ff->numberOfFormants;
            for (int f = 1; f <= nFound && f <= nFormants; ++f) {
                int idx = (iframe - 1) * nFormants + (f - 1);
                freqs[idx] = ff->formant[f].frequency;
                bws[idx] = ff->formant[f].bandwidth;
            }
        }

        *outFrequencies = freqs;
        *outBandwidths = bws;
        *outNumberOfFrames = nFrames;
        return 0;
    } catch (...) {
        return 2;
    }
}

void sound_formant_free(void* p) {
    free(p);
}

int sound_to_pitch(
    const double* samples, int nSamples, double samplingRate,
    double timeStep /*0 for automatic*/, double pitchFloor, double pitchCeiling,
    double** outTimes, double** outPitches, int* outNumberOfFrames)
{
    if (!samples || nSamples <= 0 || samplingRate <= 0.0 || pitchFloor <= 0.0 || pitchCeiling <= pitchFloor) {
        return 1;
    }

    double duration = (double)nSamples / samplingRate;
    try {
        autoSound sound = Sound_createSimple(1, duration, samplingRate);
        for (int i = 0; i < nSamples && i < (int)sound->nx; ++i) {
            sound->z[1][i+1] = samples[i];
        }

        // Call Sound_to_Pitch with default/raw AC arguments via the simple API
        autoPitch pitch = Sound_to_Pitch (sound.get(), timeStep, pitchFloor, pitchCeiling);

        int nFrames = pitch->nx;
        double* times = (double*)malloc(sizeof(double) * nFrames);
        double* freqs = (double*)malloc(sizeof(double) * nFrames);
        for (int i = 0; i < nFrames; ++i) { times[i] = NAN; freqs[i] = NAN; }

        for (int iframe = 1; iframe <= nFrames; ++iframe) {
            double t = pitch->x1 + (iframe - 1) * pitch->dx;
            times[iframe-1] = t;
            Pitch_Frame pf = & pitch->frames[iframe];
            if (pf->nCandidates >= 1) {
                double f0 = pf->candidates[1].frequency;
                if (isfinite(f0) && f0 > 0.0 && f0 < pitch->ceiling) freqs[iframe-1] = f0; else freqs[iframe-1] = 0.0;
            } else {
                freqs[iframe-1] = 0.0;
            }
        }

        *outTimes = times;
        *outPitches = freqs;
        *outNumberOfFrames = nFrames;
        return 0;
    } catch (...) {
        return 2;
    }
}

} // extern "C"
