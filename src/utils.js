import * as d3 from 'd3';

export function currency_formatter(val) {
      //if (Math.abs(val) >= Math.pow(10, 9)) return d3.format(".3s")
      if (Math.abs(val) >= Math.pow(10, 5)) return d3.format(".3s")
      if (Math.abs(val) >= 10) return d3.format("d")
      else return d3.format(".2f")
};

