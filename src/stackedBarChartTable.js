import { generateUUID } from './utils';
export default class StackedBarChartTable {
    constructor(selector, columns) {
        this.el = d3.select(selector);
        this.ul = this.el.append('ul');
        this.tooltip = this.el.append('div');
        this.chartColumns = [];
        this.chartColors = ['#2fa1f5', '#ff9b15', '#fe6565', '#ffc034'];
        this.cfDimension = {};
        this.cfGroup = {};
        this.chartData = [];
        this.sortMethod = null;
        this.subheaderplural = "facilities";
        this.subheadersingular = "facility";
        this.barwidth = 500;
    }
    /**
    * Setup for chaining methods, D3 styles
    */
    columns(columns) {
        this.chartColumns = columns;
        return this;
    }
    dimension(dimension) {
        this.cfDimension = dimension;
        return this;
    }
    group(group) {
        this.cfGroup = group;
        return this;
    }
    colors(colors) {
        this.chartColors = colors;
        return this;
    }
    sortBy(sortMethod) {
        this.sortMethod = sortMethod;
        return this;
    }
    subheaders(subheadersingular,subheaderplural){
      this.subheadersingular = subheadersingular;
            this.subheaderplural = subheaderplural;
      return this;
    }
    barwidths(barwidth){
      this.barwidth = barwidth;
      return this;
    }
    /**
    * Helpers for building the crossfilter dimension and reduce
    */
    static dimensionHeaderType() {
        return ({ header, type }) => `${header},${type}`;
    }
    static reduceAdd() {
        return (p, v, nf) => {
            const obj = {
                ...p[v.row],
                ...{
                    [v.attributename]: v.eaches,
                    row: v.row,
                    header: v.header,
                    type: v.type,
                    bed_size: v.bed_size
                }
            };
            return [...p, obj]
        };
    }
    // Calculate a node's value
    _getWidth(d) {
        return d[0][1] - d[0][0];
    }
    render() {
        const barColorScale = d3.scaleOrdinal().range(this.chartColors);
        const dotColorScale = d3.scaleOrdinal().range(this.chartColors);
        const stack = d3.stack().offset(d3.stackOffsetExpand);
        /**
        * Labels list
        */
        const ul = this.ul.styles({
                'float': 'right',
                'margin-bottom': '20px',
                'list-styles': 'none'
            })
            .attr('class', 'labels-container')
            .selectAll('li')
            .data(this.chartColumns, d => d);
        ul.exit().remove();
        const li = ul
            .enter()
            .append('li')
            .styles({
                float: 'left',
                'margin-right': '10px',
            })
        li.append('span').styles({
                width: '12px',
                height: '12px',
                display: 'inline-block',
                'margin': ' 0 5px 0 2px',
                'border-radius': '100%',
                'background-color': val => dotColorScale(val)
            })
        li.append('span')

            .text(d => d)


        /**
        * Tooltip setup
        */
        this.el.styles('position', 'relative');
        this.tooltip
            .attr('class','chart-tooltip')
            .styles({
                display: 'none',
                position: 'absolute',
                'overflow-wrap': 'break-word',
                background: '#f8f8fa',
                padding: '5px',
                border: '1px solid #e4e5ed',
                'max-width': '200px',
                    // font-family:"Graphik Web",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Open Sans","Helvetica Neue",sans-serif !important;
    // font-styles:normal !important;font-weight:normal !important;
    
                    'background-color': 'rgb(77,77,77)',
                    'color': 'rgb(255,255,255)',
                    'border': 'none',
                    'font-size':'12px',
                    // 'opacity':'0.9',
                    'font-weight': '400'
            });

        /**
        * Main chart
        */
        const tables = this.el.selectAll('table')
            .data(this.cfGroup.all()
                .map(({ key, value }) => {
                    /**
                    * Build a header row for each section and calculate its bar values
                    */
                    const [row, type] = key.split(',');
                    const barValues = this.chartColumns.reduce((acc, col) => {
                        acc[col] = d3.sum(value, d => d[col])
                        return acc;
                    }, {});
                    const headerRow = {
                        ...barValues,
                        type,
                        row,
                        isHeader: true,
                        facilityCount: [...new Set(value.map(({ row }) => row))].length,
                    };
                    return { key, value: [headerRow, ...value] }
                }).sort((a, b) => {
                    // Rows having no type indicate the all peers section which should be sorted to the bottom
                    const [aRow, aType] = a.key.split(',');
                    const [bRow, bType] = b.key.split(',');
                    return aType < bType ? 1 : (aType < bType ? -1 : 0);
                }));

        tables.exit().remove();

        const tablesEnter = tables
            .enter()
            .append('table')
            .attrs({
                width: () => '100%',
                class: 'horizontal-stacked-bar-chart',
            })
            .styles('margin-bottom', '20px')

        const sectionHeader = tablesEnter.append('tr').classed('first-row',true)
            .datum(d => d.key.split(',').pop());
        sectionHeader.append('th').text(type => type.includes("peer") ? 'Peer utilization' : 'Your utilization');
        sectionHeader.append('th').text(type => type ?  '' : 'Total eaches').styles('text-align', 'right');
        sectionHeader.append('th').text('Unit market share');

        const rows = tables.merge(tablesEnter).selectAll('tr.chart-row')
            .data(({ value: rows }) => {
                /**
                * Combine rows by name (row) and calculate their bar values
                */
                const combinedRows = d3.nest()
                    .key(d => d.row)
                    .rollup(v => {

                        const barValues = this.chartColumns.reduce((acc, col) => {
                            acc[col] = d3.sum(v, d => d[col]);
                            acc.total += acc[col];
                            return acc;
                        }, { total: 0 });
                        return {
                            ...barValues,
                            active: true,
                            facilityCount: v[0].facilityCount,
                            isHeader: v[0].isHeader,
                            type: v[0].type,
                            bedSize: v[0].bed_size
                        };
                    })
                    .entries(rows)

                // Sort non header rows if a sortMethod has been provided
                return typeof this.sortMethod === 'function' ? (() => {
                    const [headerRow, ...sortableRows] = combinedRows;
                    return [headerRow, ...sortableRows.sort(this.sortMethod)]
                })() : combinedRows;
            }, () => generateUUID()) // Must be keyed by unique value, even when data changes

            rows.exit().remove()

            const rowsEnter = rows
                .enter()
                .append('tr')
                .attr('class', 'chart-row')

        // First row, aka section header with drop down and summary info
        const descriptionTd = rowsEnter.filter(({ value }) => value.isHeader)
            .append('td')
        descriptionTd
            .append('i')
            .attr('class', 'section-toggle glyphicons glyphicons-chevron-down right-space-small semibold')
            .styles({'display':'inline-block'})
            .on('click', function(d, i) {
                d.value.active = !d.value.active;
                d3.select(this.closest('.horizontal-stacked-bar-chart'))
                    .selectAll('.chart-row')
                    .styles('display', (d, i) => {
                        if (!i) return;
                        d.value.active = !d.value.active;
                        return d.value.active && i ? '' : 'none';
                    });
                d3.select(this).classed('glyphicons-chevron-down', d => d.value.active)
                d3.select(this).classed('glyphicons-chevron-right', d => !d.value.active)
            })
        const descriptionTdContainer = descriptionTd.append('div')
            .styles({'display': 'inline-block','max-width':'125px'})
        descriptionTdContainer
            .append('span')
            .text(({ key }) => key)
            .styles({'font-weight': 'bold'
                            ,'overflow-wrap':'break-word'
                            ,'display':'inline-block'
            })

        descriptionTdContainer
            .append('div')
            .text(({ value }) => 
            
            value.type.includes("peers") ? `${value.facilityCount} providers` : 
            (value.type && value.facilityCount > 1 ? `${value.type} ${String.fromCodePoint(0x2022)} ${value.facilityCount} `+ this.subheaderplural : (value.type ? `${value.type} ${String.fromCodePoint(0x2022)} ${value.facilityCount} `+ this.subheadersingular : '')))
            .attr('class', 'muted grey small')
            .styles('line-height', '1em')

        // Additional rows

        rowsEnter.filter(({ value }) => !value.isHeader)
            .append('td')
            .html(({ key }) => key)
            .append('div')
                        .text(({ value }) => 
            
            value.type.includes("peers") ? `${formatDecimalComma(value.bedSize)} beds` : '')
            .attr('class', 'muted grey small')
            .styles('line-height', '1em')
             
        rowsEnter.append('td')
            .text(({ value }) => value.type.includes("peer") ?  '' : formatDecimalComma(value.total))
            .attr('align', 'right');
        rowsEnter.append('td')
            .attr('width', this.barwidth)
            .datum(({ value }) => stack.keys(this.chartColumns)([value]))
            .selectAll('span')
            .data(obj => obj)
            .enter().append('span')
            .styles({
                width: obj => `${this._getWidth(obj) * 100}%`,
                height: '35px',
                color: '#fff',
                'background-color': obj => barColorScale(obj.key),
                display: 'inline-block',
                'text-align': 'center',
                'line-height': '35px',
            })
            .on('mouseover', () => this.tooltip.styles('display', 'block'))
            .on('mouseout', () => this.tooltip.styles('display', 'none'))
            .on('mousemove', (d, i) => {
                const chart = this.el.node();
                const column = this.chartColumns[i];
                // Count or percent depending on if looking at one provider or peers
                const unit = d[0].data.type.includes("peer") ?  'shares' : 'eaches';
                const unitAmount = d[0].data.type.includes("peer") ?  `${(100 * this._getWidth(d)).toFixed(1)}%` : formatDecimalComma(d[0].data[column]);
                const xPosition = d3.mouse(chart)[0] > 720 ? 720 : d3.mouse(chart)[0] - 15;
                const yPosition = d3.mouse(chart)[1] - this.tooltip.node().offsetHeight - 5;
                this.tooltip.styles({
                    top: `${yPosition}px`,
                    left: `${xPosition}px`,

                })
                this.tooltip.text(`${column} ${unit}: ${unitAmount}`);
                // this.tooltip.classed('v-tooltip',true).classed('tooltip',true);
            })
            .append('span')
            .text(obj => `${Math.round(this._getWidth(obj) * 100)}%`)
            .styles('visibility', function() {
                return this.offsetWidth + 5 > this.parentNode.offsetWidth ? 'hidden' : 'visible';
            });

        d3.selectAll('.horizontal-stacked-bar-chart th').styles({
            'border-bottom': '4px solid #d0d2e2',
            'vertical-align': 'bottom',
            'white-space': 'nowrap',
            'font-size': '14px',
        });
        d3.selectAll('.horizontal-stacked-bar-chart .chart-row td').styles({
            'border-bottom': '1px solid #d0d2e2',
            'vertical-align': 'middle',
            padding: '10px 10px'
            
        });
        

        
        d3.selectAll('.horizontal-stacked-bar-chart tr.chart-row:nth-child(n+3) td:first-child').styles({
            'border-bottom': '1px solid #d0d2e2',
            'vertical-align': 'middle',
            padding: '5px 0px 5px 25px'
            
        });
        d3.selectAll('.horizontal-stacked-bar-chart th:not(:last-of-type), .horizontal-stacked-bar-chart td:nth-child(2)').styles({
            'padding-right': '25px'
        });
        d3.selectAll('.horizontal-stacked-bar-chart .section-toggle').styles({
            cursor: 'pointer',
            border: '2px solid #e4e5ed',
            padding: '5px',
            background: '#f8f8fa',
            'border-radius': '3px',
            'vertical-align': 'top',
        });

        return this;
    }
  }