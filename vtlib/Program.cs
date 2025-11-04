using System;
using System.Runtime.InteropServices.JavaScript;

internal class Program
{
    private static void Main(string[] args)
    {
    }
}

partial class VtLib
{
    [JSExport]
    internal static int SampleCallee()
    {
        System.Console.WriteLine("SampleCallee called");
        return 42;
    }
}
