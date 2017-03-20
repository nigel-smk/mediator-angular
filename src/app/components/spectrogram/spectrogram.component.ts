import {Component, OnInit, ViewChild, AfterViewInit, Input, OnDestroy} from '@angular/core';
import {Subscription, Observable} from "rxjs";
import {FftFrame} from "../../models/fftFrame.model";

@Component({
  selector: 'app-spectrogram',
  templateUrl: './spectrogram.component.html',
  styleUrls: ['./spectrogram.component.css']
})
export class SpectrogramComponent implements AfterViewInit {

  private Spectrogram: any = require('../../../../node_modules/spectrogram/spectrogram.js');
  private chroma: any = require('../../../../node_modules/chroma-js/chroma.js')

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private subscription: Subscription;

  @ViewChild('spectrogram') canvasElement;
  @Input() analyserNodeFeed: Observable<AnalyserNode>;


  constructor() { }

  ngAfterViewInit() {
    this.analyserNodeFeed.subscribe((analyserNode) => {
        this.canvas = this.canvasElement.nativeElement;
        this.context = this.canvas.getContext("2d");

        let spectro = this.Spectrogram(this.canvas, {
          audio: {
            enable: false
          },
          canvas: {
            height: 500,
            width:750
          }
        });

        spectro.connectSource(analyserNode, new AudioContext());
        spectro.start();
    });

  }

  draw(fftFrame: FftFrame) {

  }

}
