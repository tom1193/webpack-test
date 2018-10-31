import { format, select }  from 'd3';

export function currency_formatter(val) {
      //if (Math.abs(val) >= Math.pow(10, 9)) return format(".3s")
      if (Math.abs(val) >= Math.pow(10, 5)) return format(".3s")
      if (Math.abs(val) >= 10) return format("d")
      else return format(".2f")
};

export function generateUUID() {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

export function csvUrl(queryName) {
    return datasets.filter(function(query) {
        return query.queryName == queryName;
    })[0].csv;
}

export const formatDecimalComma = format(",.0f");

export function modeQuery(queryName) {
  return datasets.filter(function (d) {
     return d.queryName == queryName;
  })[0].content;
};

export function reloadOnFilter() {
  select('a.action-apply').on('click', function() {
    location.reload()
  })
}
