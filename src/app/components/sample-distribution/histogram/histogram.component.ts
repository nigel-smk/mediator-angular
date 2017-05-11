import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {D3Service, D3} from "d3-ng2-service";

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HistogramComponent implements OnInit {

  @ViewChild('histogram') histogram: any;

  private d3: D3;

  constructor(d3Service: D3Service) {
    this.d3 = d3Service.getD3();
  }

  ngOnInit() {
    this.createHistogram();
  }

  createHistogram() {
    // credit goes to https://bl.ocks.org/mbostock/3048450

    let d3 = this.d3;

    var data = d3.range(1000).map(d3.randomBates(10));

    let formatCount = d3.format(",.0f");

    var svg = d3.select(this.histogram.nativeElement),
      margin = {top: 10, right: 30, bottom: 30, left: 30},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
      .rangeRound([0, width]);

    var bins = d3.histogram()
      .domain(x.domain() as [number, number])
      .thresholds(x.ticks(20))
      (data);

    var y = d3.scaleLinear()
      .domain([0, d3.max(bins, function(d) { return d.length; })])
      .range([height, 0]);

    var bar = g.selectAll(".bar")
      .data(bins)
      .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

    bar.append("rect")
      .attr("x", 1)
      .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
      .attr("height", function(d) { return height - y(d.length); });

    bar.append("text")
      .attr("dy", ".75em")
      .attr("y", 6)
      .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
      .attr("text-anchor", "middle")
      .text(function(d) { return formatCount(d.length); });

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
  }

}
