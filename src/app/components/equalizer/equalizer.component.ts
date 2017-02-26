import {Component, AfterViewInit, ViewChild, Input} from '@angular/core';

@Component({
  selector: 'app-equalizer',
  templateUrl: './equalizer.component.html',
  styleUrls: ['./equalizer.component.css']
})
export class EqualizerComponent implements AfterViewInit {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private analyserInputs: {
    fftSize?: number,
    frequencyBinCount?: number,
    minDecibels?: number,
    maxDecibels?: number,
    smoothingTimeConstant?: number
  } = {};
  private filter: {min?: number, max?: number} = {min: 20, max: 20000};
  private filterInputs: {min?: number, max?: number} = {};

  @ViewChild('eq') eqCanvas;
  @Input() analyser: AnalyserNode;

  constructor() { }

  ngAfterViewInit() {
    this.canvas = this.eqCanvas.nativeElement;
    this.context = this.canvas.getContext("2d");

    this.draw();
  }

  setValues() {
    Object.assign(this.analyser, this.analyserInputs);
    this.filter = this.filterInputs;
  }

  draw() {
    requestAnimationFrame(() => {
      this.draw();
    });

    let ctx = this.context;
    if (this.analyser) {
      // TODO get sample rate somehow
      const SAMPLE_RATE = 44100;

      //this.analyser.fftSize = 256; // thus 16 bins {range: [32, 32768]}
      let fbc_array = new Uint8Array(this.analyser.frequencyBinCount); // fetch frequency data
      this.analyser.getByteFrequencyData(fbc_array);
      let filtered_fbc_array = fbc_array.filter((value: number, i: number) => {
        let binFrequency = i * SAMPLE_RATE / this.analyser.fftSize;
        return binFrequency > this.filter.min && binFrequency < this.filter.max;
      });

      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear canvas
      ctx.fillStyle = '#00CCFF'; // color of the bars
      let bars = 100; // TODO make bar count dependent on canvas width (currently assumes 50px)

      for (let i = 0; i < bars; i++) {
        // bars of total width 5px
        let bar_x = i * 3;
        let bar_width = 2;
        let bar_height = -(Math.floor(filtered_fbc_array[i] / 2)); // max array value === 255
        // let bar_height = -(Math.floor(fbc_array[i] / 2)); // max array value === 255

        ctx.fillRect(bar_x, this.canvas.height, bar_width, bar_height);
      }
    } else { // clear
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear canvas
    }
  }

}
