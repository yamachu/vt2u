using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.JavaScript;
using System.Text.Json;

internal class Program
{
    private static void Main(string[] args)
    {
    }
}

enum EstimatedGender
{
    Male = 1,
    Female = 2,
    MaleOrFemale = 3,
    FemaleOrMale = 4,
    Unknown = 0
}

class VocalTractLengthResult
{
    public EstimatedGender EstimatedGender { get; set; }
    public double MaleHeight { get; set; }
    public double FemaleHeight { get; set; }
}

partial class VtLib
{
    [JSExport]
    internal static int SampleCallee()
    {
        System.Console.WriteLine("SampleCallee called");
        return 42;
    }

    [JSExport]
    internal static string Analyze(double[] samples, int samplingRate)
    {
        var dt = 0.005;
        var numberOfFormants = 3;
        var c = 34300.0; // 20 degrees Celsius in cm/s

        var (pitchTimes, pitches, nPitchFrames) = vtlib.NativeFormant.AnalyzePitch(samples, samplingRate, timeStep: dt);
        var (formantFrequencies, formantBandwidths, nFormantFrames) = vtlib.NativeFormant.Analyze(samples, samplingRate, numberOfFormants, dt: dt, maximumFrequency: /*8000.0*/5000.0, halfdt_window: 0.0125, preemphasisFrequency: 50.0);

        var limitIndex = Math.Min(nPitchFrames, nFormantFrames);
        var formants = new List<List<double>>(numberOfFormants);
        for (int f = 0; f < numberOfFormants; f++)
        {
            formants.Add(new List<double>(limitIndex));
        }

        var voicedPitches = pitches.Select((p, i) => (value: p, index: i)).Where(v => v.value > 0.0 && !double.IsNaN(v.value));

        foreach (var (_, i) in voicedPitches)
        {
            if (i >= limitIndex) break;
            for (int f = 0; f < numberOfFormants; f++)
            {
                var freq = formantFrequencies[i * numberOfFormants + f];
                if (freq > 0.0 && !double.IsNaN(freq))
                {
                    formants[f].Add(freq);
                }
            }
        }

        var averagePitch = voicedPitches.Any() ? voicedPitches.Average(v => v.value) : 0.0;
        var formantAverages = formants.Select(fList => fList.Any() ? fList.Average() : 0.0).ToArray();

        var points = formantAverages
            .Select((f, i) => new { idx = i, f })
            .Where(p => p.f > 0.0 && !double.IsNaN(p.f))
            .ToArray();

        if (points.Length == 0)
        {
            return JsonSerializer.Serialize(new VocalTractLengthResult
            {
                EstimatedGender = EstimatedGender.Unknown,
                MaleHeight = 0.0,
                FemaleHeight = 0.0
            }, VtLibJsonContext.Default.VocalTractLengthResult);
        }

        var vtls = points.Select(p => ((2 * p.idx) + 1) * c / (4 * p.f)).ToArray();
        var vtlMean = vtls.Average();

        /*
        Turner et al. 2009ってGPT-5が言ってたけど、この数値見つからないんだよね…といいつつ割とそれっぽい数値になるのでベースとして使ってみる
            身長 (cm) = 7.8 × VTL (cm) + 41     (男性)
            身長 (cm) = 8.3 × VTL (cm) + 37     (女性)
        また
        ref: https://pmc.ncbi.nlm.nih.gov/articles/PMC7842116/
        > Average female and male VTLs have been reported across literature in the ranges of 13.88–15.14 and 15.54–17.04 cm
        との記述から、VTLの閾値を15.3cmに設定する
        averagePitchを使って男女判定をして、上記の数式を使用して推定する、この時F0は経験的に200Hzを閾値にする
        */

        var (maleHeight, femaleHeight) = EstimateHeight(vtlMean);
        var result = new VocalTractLengthResult
        {
            EstimatedGender = (vtlMean, averagePitch) switch
            {
                var (v, f) when f >= 200.0 && v <= 15.3 => EstimatedGender.Female,
                var (v, f) when f < 200.0 && v > 15.3 => EstimatedGender.Male,
                var (v, _) when v > 15.3 => EstimatedGender.MaleOrFemale,
                var (v, _) when v <= 15.3 => EstimatedGender.FemaleOrMale,
                _ => EstimatedGender.Unknown,
            },
            MaleHeight = maleHeight,
            FemaleHeight = femaleHeight
        };

        return JsonSerializer.Serialize(result, VtLibJsonContext.Default.VocalTractLengthResult);
    }

    private static (double maleHeight, double femaleHeight) EstimateHeight(double vtl)
    {
        var maleHeight = 7.8 * vtl + 41.0;
        var femaleHeight = 8.3 * vtl + 37.0;
        return (maleHeight, femaleHeight);
    }
}
