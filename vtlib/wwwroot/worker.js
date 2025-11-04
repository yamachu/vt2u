import { dotnet } from "./_framework/dotnet.js";

let assemblyExports = null;
let startupError = undefined;

try {
  const { getAssemblyExports, getConfig } = await dotnet.create();
  const config = getConfig();
  assemblyExports = await getAssemblyExports(config.mainAssemblyName);
} catch (err) {
  startupError = err.message;
}

self.addEventListener(
  "message",
  async function (e) {
    try {
      if (!assemblyExports) {
        throw new Error(startupError || "worker exports not loaded");
      }
      let result = null;
      switch (e.data.command) {
        case "sampleCall":
          result = assemblyExports.VtLib.SampleCallee();
          break;
        default:
          throw new Error("Unknown command: " + e.data.command);
      }
      self.postMessage({
        command: "response",
        requestId: e.data.requestId,
        result,
      });
    } catch (err) {
      self.postMessage({
        command: "response",
        requestId: e.data.requestId,
        error: err.message,
      });
    }
  },
  false
);
