export class Speaker {

  constructor(
    public name: string,
    public analyser?: AnalyserNode,
    public analyserFrames?: Uint8Array[],
    public dataSet?: Uint8Array[],
    public labelVector?: number[][],
    public classifier?: any
  ) {}
}
