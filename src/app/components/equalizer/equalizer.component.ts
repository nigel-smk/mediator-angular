import {Component, AfterViewInit, ViewChild, Input} from '@angular/core';
import {AnalyserSpec} from "../../models/analyserSpec.model";
import {FftFrame} from "../../models/fftFrame.model";
import {FftFrameStream} from "../../services/fft-frame-stream";

@Component({
  selector: 'app-equalizer',
  template: `<canvas id="eq" #eq></canvas>`,
  styleUrls: ['./equalizer.component.css']
})
export class EqualizerComponent implements AfterViewInit {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  // TODO place analyserSpec properties directly on analysernode?
  private analyserSpec: AnalyserSpec = {filter: {min: 50, max: 3000}};

  @ViewChild('eq') eqCanvas;

  constructor(private fftFrameStream: FftFrameStream) { }

  ngAfterViewInit() {
    this.canvas = this.eqCanvas.nativeElement;
    this.context = this.canvas.getContext("2d");

    this.fftFrameStream.$.subscribe((fftFrame: FftFrame) => {
      this.draw(fftFrame)
    })
  }

  draw(fftFrame: FftFrame) {
    requestAnimationFrame(() => {
      // TODO next: allow selection of gap between bars

      let ctx = this.context;
      let analyser = this.fftFrameStream.analyser;
      if (analyser) {
        // TODO get sample rate somehow
        const SAMPLE_RATE = 44100;

        // set canvas height to contain all possible analyser values
        this.canvas.height = 256;
        this.canvas.width = analyser.frequencyBinCount;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear canvas
        ctx.fillStyle = '#00CCFF'; // color of the bars
        let bar_count = fftFrame.length;
        let bar_width = Math.ceil(this.canvas.width / bar_count);
        for (let i = 0; i < bar_count; i++) {
          let binValue = fftFrame[i];
          let bar_x = i * bar_width;
          //let bar_height = -(Math.floor(filtered_fbc_array[i]) - analyser.minDecibels);
          let bar_height = binValue;

          ctx.fillRect(bar_x, (this.canvas.height - bar_height) / 2, bar_width, bar_height);
        }
      } else { // clear
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear canvas
      }
    });


  }

}
