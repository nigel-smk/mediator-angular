import {Component, AfterViewInit, ViewChild, Input} from '@angular/core';
import {FilterSpec} from "../../models/filterSpec.model";
import {AnalyserSpec} from "../../models/analyserSpec.model";

@Component({
  selector: 'app-equalizer',
  templateUrl: './equalizer.component.html',
  styleUrls: ['./equalizer.component.css']
})
export class EqualizerComponent implements AfterViewInit {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private uiState: {buttons: boolean, specs: boolean} = {buttons: false, specs: false};
  // TODO place analyserSpec properties directly on analysernode?
  private analyserSpec: AnalyserSpec = {filter: {min: 50, max: 3000}};

  @ViewChild('eq') eqCanvas;
  @Input() analyser: AnalyserNode;

  constructor() { }

  ngAfterViewInit() {
    this.canvas = this.eqCanvas.nativeElement;
    this.context = this.canvas.getContext("2d");

    this.draw();
  }

  setFilter(filterInputs: FilterSpec) {
    Object.assign(this.analyserSpec.filter, filterInputs);
  }

  onMouseEnter() {
    this.uiState.buttons = true;
  }

  onMouseLeave() {
    this.uiState.buttons = false;
  }

  toggleSpecs() {
    this.uiState.specs = !this.uiState.specs;
  }

  draw() {
    requestAnimationFrame(() => {
      this.draw();
    });

    // TODO next: allow selection of gap between bars

    let ctx = this.context;
    if (this.analyser) {
      // TODO get sample rate somehow
      const SAMPLE_RATE = 44100;

      // set canvas height to contain all possible analyser values
      this.canvas.height = this.analyser.maxDecibels - this.analyser.minDecibels;

      //this.analyser.fftSize = 256; // thus 16 bins {range: [32, 32768]}
      let fbc_array = new Uint8Array(this.analyser.frequencyBinCount); // fetch frequency data
      this.analyser.getByteFrequencyData(fbc_array);
      let filtered_fbc_array = fbc_array.filter((value: number, i: number) => {
        let binFrequency = i * SAMPLE_RATE / this.analyser.fftSize;
        return binFrequency > this.analyserSpec.filter.min && binFrequency < this.analyserSpec.filter.max;
      });

      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear canvas
      ctx.fillStyle = '#00CCFF'; // color of the bars
      let bar_count = filtered_fbc_array.length; // TODO make bar count dependent on canvas width (currently assumes 50px)
      let bar_width = Math.ceil(this.canvas.width / bar_count);
      for (let i = 0; i < bar_count; i++) {
        let binValue = filtered_fbc_array[i];
        // update maxBin/minBin
        if (this.analyserSpec.maxBin === undefined || binValue > this.analyserSpec.maxBin) this.analyserSpec.maxBin = binValue;
        if (this.analyserSpec.minBin === undefined || binValue < this.analyserSpec.minBin) this.analyserSpec.minBin = binValue;
        let bar_x = i * bar_width;
        //let bar_height = -(Math.floor(filtered_fbc_array[i]) - this.analyser.minDecibels);
        let bar_height = binValue;

        ctx.fillRect(bar_x, this.canvas.height - bar_height, bar_width, bar_height);
      }
    } else { // clear
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear canvas
    }
  }

}
