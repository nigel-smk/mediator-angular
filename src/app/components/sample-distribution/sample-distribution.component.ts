import { Component, OnInit } from '@angular/core';
import {D3Service, D3} from "d3-ng2-service";

@Component({
  selector: 'app-sample-distribution',
  templateUrl: './sample-distribution.component.html',
  styleUrls: ['./sample-distribution.component.css']
})
export class SampleDistributionComponent implements OnInit {

  private d3: D3;

  constructor(private d3Service: D3Service) {
    this.d3 = d3Service.getD3();
  }

  ngOnInit() {
  }

}
