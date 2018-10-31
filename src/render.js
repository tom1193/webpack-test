import * as crossfilter from 'crossfilter';
import * as d3 from 'd3';
import * as dc from 'dc';
import StackedBarChartTable from './stackedBarChartTable';


fetch('http://localhost:8000/datasets/bedutilization.json')
.then(response => response.json())
.then((data) => {
    var colorscalelumerebrands = d3.scaleOrdinal()
      .range(["#465AFB", "#FFC033", "#33CC99", "#FF6666", "#863C12", "#1FD9E0", "#2EA1F5", "#FF9C15", "#8c98fd", "#ffd880", "#80dfbf", "#ffa0a0", "#6b6ba6", "#73e8ec", "#ffa0fa", "#ffc26d", '#7B7D8D', '#9DA0B8', '#D0D2E1', '#485CFB', '#5063FD', '#5669FE']);
    var attributeList = data.reduce(function (attributes, obj) {
      if (attributes.indexOf(obj.attributename) === -1) {
        attributes.push(obj.attributename);
      }
      return attributes;
    }, []);

    var ndx = crossfilter(data);
    var dimension = ndx.dimension(StackedBarChartTable.dimensionHeaderType());
    var group = dimension.group().reduce(StackedBarChartTable.reduceAdd(),
        // reduceRemove placeholder, add real functions here
        function () {
          return [];
        },
        // reduceInitial placeholder, add real functions here
        function () {
          return [];
        });
    var chart = new StackedBarChartTable('#chart');
    function queryOneChart() {
    chart.columns(attributeList).dimension(dimension).group(group).sortBy(function (a, b) {

      return d3.descending(
        a.value.type.includes("peer") ? a.value['Non-antibiotic loaded']/a.value.total :
        a.value.total, 
        b.value.type.includes("peer") ? b.value['Non-antibiotic loaded']/b.value.total :
        b.value.total);
      }).colors(colorscalelumerebrands.range()).subheaders("facility","facilities").barwidths(500).render();
    }

    queryOneChart();
});
