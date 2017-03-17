import {LogRegClassStream} from "../services/log-reg-class-stream.service";
import {FftFrame} from "./fftFrame.model";
export class Speaker {

  constructor(
    public name: string,
    public analyser?: AnalyserNode,
    public logRegClassStream?: LogRegClassStream,
    public voiceSample?: FftFrame[],
    public labelVector?: number[][]
  ) {}
}
