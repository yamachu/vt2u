using System;
using System.Runtime.InteropServices;

namespace vtlib
{
    internal static class NativeFormant
    {
        private const string LIB = "sound_formant_api";

        [DllImport(LIB, EntryPoint = "sound_to_formant_burg", CallingConvention = CallingConvention.Cdecl)]
        private static extern int sound_to_formant_burg(
            double[] samples, int nSamples, double samplingRate,
            int nFormants, double dt, double maximumFrequency, double halfdt_window,
            double preemphasisFrequency,
            out IntPtr outFrequencies, out IntPtr outBandwidths,
            out int outNumberOfFrames);

        [DllImport(LIB, EntryPoint = "sound_formant_free", CallingConvention = CallingConvention.Cdecl)]
        private static extern void sound_formant_free(IntPtr p);

        [DllImport(LIB, EntryPoint = "sound_to_pitch", CallingConvention = CallingConvention.Cdecl)]
        private static extern int sound_to_pitch(
            double[] samples, int nSamples, double samplingRate,
            double timeStep, double pitchFloor, double pitchCeiling,
            out IntPtr outTimes, out IntPtr outPitches, out int outNumberOfFrames);

        public static (double[] frequencies, double[] bandwidths, int nFrames) Analyze(double[] samples, double samplingRate, int nFormants, double dt = 0.0, double maximumFrequency = 0.0, double halfdt_window = 0.0, double preemphasisFrequency = 50.0)
        {
            ArgumentNullException.ThrowIfNull(samples);
            var ret = sound_to_formant_burg(samples, samples.Length, samplingRate, nFormants, dt, maximumFrequency, halfdt_window, preemphasisFrequency, out var freqsPtr, out var bwsPtr, out var nFrames);
            if (ret != 0)
            {
                throw new InvalidOperationException($"Native formant analysis failed: ErrorCode {ret}");
            }
            var total = nFrames * nFormants;
            var freqs = new double[total];
            var bws = new double[total];
            if (freqsPtr != IntPtr.Zero)
            {
                Marshal.Copy(freqsPtr, freqs, 0, total);
                sound_formant_free(freqsPtr);
            }
            if (bwsPtr != IntPtr.Zero)
            {
                Marshal.Copy(bwsPtr, bws, 0, total);
                sound_formant_free(bwsPtr);
            }
            return (freqs, bws, nFrames);
        }

        public static (double[] times, double[] pitches, int nFrames) AnalyzePitch(double[] samples, double samplingRate, double timeStep = 0.0, double pitchFloor = 75.0, double pitchCeiling = 600.0)
        {
            ArgumentNullException.ThrowIfNull(samples);
            var ret = sound_to_pitch(samples, samples.Length, samplingRate, timeStep, pitchFloor, pitchCeiling, out var timesPtr, out var pitchesPtr, out var nFrames);
            if (ret != 0)
            {
                throw new InvalidOperationException($"Native pitch analysis failed: ErrorCode {ret}");
            }

            var times = new double[nFrames];
            var pitches = new double[nFrames];
            if (timesPtr != IntPtr.Zero)
            {
                Marshal.Copy(timesPtr, times, 0, nFrames);
                sound_formant_free(timesPtr);
            }
            if (pitchesPtr != IntPtr.Zero)
            {
                Marshal.Copy(pitchesPtr, pitches, 0, nFrames);
                sound_formant_free(pitchesPtr);
            }
            return (times, pitches, nFrames);
        }
    }
}
