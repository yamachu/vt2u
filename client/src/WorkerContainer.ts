export class WorkerContainer {
  private worker: Worker;
  private requests: Map<
    string,
    {
      /* eslint-disable @typescript-eslint/no-unsafe-function-type */
      resolve: Function;
      reject: Function;
      /* eslint-enable @typescript-eslint/no-unsafe-function-type */
    }
  >;

  constructor(workerUrl: string) {
    this.worker = new Worker(workerUrl, { type: "module" });
    this.requests = new Map();

    this.worker.onmessage = (e) => {
      // NOTE: dataの型は https://learn.microsoft.com/ja-jp/aspnet/core/client-side/dotnet-on-webworkers?view=aspnetcore-9.0 をベースにしている
      const { requestId, result, error, command } = e.data;
      const record = this.requests.get(requestId);
      if (!record || command !== "response") return; // FIXME

      if (error) record.reject(error);
      else record.resolve(result);

      this.requests.delete(requestId);
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postMessage<U>(data: any): Promise<U> {
    const requestId = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      this.requests.set(requestId, { resolve, reject });
      this.worker.postMessage({ ...data, requestId });
    });
  }

  terminate() {
    this.worker.terminate();
    this.requests.clear();
  }
}
