import {Component, AfterViewInit, ViewChild, Input} from '@angular/core';

@Component({
  selector: 'app-equalizer',
  templateUrl: './equalizer.component.html',
  styleUrls: ['./equalizer.component.css']
})
export class EqualizerComponent implements AfterViewInit {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private filter: {min?: number, max?: number} = {min: 50, max: 3000};
  private filterInputs: {min?: number, max?: number} = {};

  @ViewChild('eq') eqCanvas;
  @Input() analyser: AnalyserNode;

  constructor() { }

  ngAfterViewInit() {
    this.canvas = this.eqCanvas.nativeElement;
    this.context = this.canvas.getContext("2d");

    this.draw();
  }

  setFilter() {
    Object.assign(this.filter, this.filterInputs);
  }

  plusFftSize() {
    if (this.analyser.fftSize === 32768) return;
    this.analyser.fftSize *= 2;
  }

  minusFftSize() {
    if (this.analyser.fftSize === 32) return;
    this.analyser.fftSize /= 2;
  }

  // TODO write function that creates incrementer/decrementer functions

  plusMinDecibels() {
    if (this.analyser.minDecibels + 10 < this.analyser.maxDecibels) this.analyser.minDecibels += 10;
  }

  minusMinDecibels() {
    this.analyser.minDecibels -= 10;
  }

  plusMaxDecibels() {
    this.analyser.maxDecibels += 10;
  }

  minusMaxDecibels() {
    if (this.analyser.maxDecibels - 10 > this.analyser.minDecibels) this.analyser.maxDecibels -= 10;
  }

  // TODO there is some funky stuff goin on with adding 0.1
  plusSmoothingTimeConstant() {
    if (this.analyser.smoothingTimeConstant !== 1) this.analyser.smoothingTimeConstant += 0.1;
  }

  minusSmoothingTimeConstant() {
    if (this.analyser.smoothingTimeConstant !== 0) this.analyser.smoothingTimeConstant -= 0.1;
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
      let bar_count = filtered_fbc_array.length; // TODO make bar count dependent on canvas width (currently assumes 50px)
      let bar_width = Math.ceil(this.canvas.width / bar_count);
      for (let i = 0; i < bar_count; i++) {
        let bar_x = i * bar_width;
        let bar_height = -(Math.floor(filtered_fbc_array[i])); // max array value === 255
        // let bar_height = -(Math.floor(fbc_array[i] / 2)); // max array value === 255

        ctx.fillRect(bar_x, this.canvas.height, bar_width, bar_height);
      }
    } else { // clear
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear canvas
    }
  }

}
