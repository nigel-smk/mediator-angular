import {Component, OnInit, ViewChild, AfterViewInit, Input, OnDestroy} from '@angular/core';
import {Subscription, Observable} from "rxjs";
import {FftFrame} from "../../models/fftFrame.model";
import {FftFrameStream} from "../../services/fft-stream.service";
import {forEach} from "@angular/router/src/utils/collection";

@Component({
  selector: 'app-spectrogram',
  templateUrl: './spectrogram.component.html',
  styleUrls: ['./spectrogram.component.css']
})
export class SpectrogramComponent implements AfterViewInit {

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private subscription: Subscription;

  @ViewChild('spectrogram') canvasElement;
  @Input() analyserNodeFeed: Observable<AnalyserNode>;


  // TODO angular 2 way to create empty canvas element?
  private tempCanvas = document.createElement('canvas');
  private tempCanvasContext = this.tempCanvas.getContext('2d');
  private colors: number[] = this.generateColors(275);

  @Input() fftFrameStream: FftFrameStream;
  @Input() widthInSeconds: number;


  constructor() { }

  ngAfterViewInit() {

    this.canvas = this.canvasElement.nativeElement;
    this.context = this.canvas.getContext("2d");

    this.canvas.width = this.widthInSeconds * (1000 / this.fftFrameStream.interval);
    this.canvas.height = this.fftFrameStream.binCount;

    this.fftFrameStream.fftFrame$.subscribe((fftFrame: FftFrame) => {
      this.draw(fftFrame);
    });

  }

  draw(fftFrame: FftFrame) {
    requestAnimationFrame(() => {

      // store canvas's current image on tempCanvas before setting width & height
      this.tempCanvas.width = this.canvas.width;
      this.tempCanvas.height = this.canvas.height;
      this.tempCanvasContext.drawImage(this.canvas, 0, 0);

      // set canvas dimensions
      this.canvas.width = this.widthInSeconds * (1000 / this.fftFrameStream.interval);
      this.canvas.height = this.fftFrameStream.binCount;
      let width = this.canvas.width;
      let height = this.canvas.height;

      // shift image to the left one "pixel"
      this.context.drawImage(this.tempCanvas, -1, 0);

      // this.context.fillStyle = '#00CCFF';
      // this.context.fillRect(this.canvas.width - 10, 0, 10,this.canvas.height);

      // draw new frame on open
      fftFrame.forEach((value, i) => {
        this.context.fillStyle = this.getColor(value);
        this.context.fillRect(width - 1, height - i, 1, 1);
      });
    });
  }

  private getColor(value: number): number {
    let color = this.colors[value>>0];
    if (typeof color === 'undefined') {
      color = this.colors[0];
    }

    return color;
  }

  private generateColors(steps) {
    // from https://github.com/miguelmota/spectrogram/blob/master/spectrogram.js
    let frequency = Math.PI / steps;
    let amplitude = 127;
    let center = 128;
    let slice = (Math.PI / 2) * 3.1;
    let colors = [];

    function toRGBString(v) {
      return 'rgba(' + [v,v,v,1].toString() + ')';
    }

    for (let i = 0; i < steps; i++) {
      let v = (Math.sin((frequency * i) + slice) * amplitude + center) >> 0;

      colors.push(toRGBString(v));
    }

    return colors;
  };

}
