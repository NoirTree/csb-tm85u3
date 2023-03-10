var width = 100,
  height = 100, // % of the parent element
  x = d3.scaleLinear().domain([0, width]).range([0, width]),
  y = d3.scaleLinear().domain([0, height]).range([0, height]),
  color = d3.scaleOrdinal().range(
    d3.schemeDark2.map(function (c) {
      c = d3.rgb(c);
      //c.opacity = 0.5;
      return c;
    })
  ),
  treemap = d3
    .treemap()
    .size([width, height])
    //.tile(d3.treemapResquarify) // doesn't work - height & width is 100%
    .paddingInner(0)
    .round(false), //true
  data = {
    name: "all expenses",
    children: [
      {
        name: "basic expenses",
        children: [
          { name: "food", value: 350 },
          { name: "social", value: 200 },
          { name: "health", value: 115 },
          { name: "utilities", value: 90 },
          { name: "housing", value: 1400 },
          { name: "commute", value: 90 }
        ]
      },
      {
        name: "quality expenses",
        children: [
          { name: "travel", value: 350 },
          { name: "savings", value: 200 }
        ]
      },
      {
        name: "other expenses",
        children: [
          { name: "pet", value: 350 },
          { name: "childcare", value: 200 },
          { name: "hobbies", value: 200 },
          { name: "car loan", value: 200 },
          { name: "extended insurance", value: 200 },
          { name: "other", value: 200 }
        ]
      }
    ]
  },
  nodes = d3.hierarchy(data).sum(function (d) {
    return d.value ? 1 : 0;
  }),
  //.sort(function(a, b) { return b.height - a.height || b.value - a.value });

  currentDepth;

treemap(nodes);

var chart = d3.select("#chart");
var cells = chart
  .selectAll(".node")
  .data(nodes.descendants())
  .enter()
  .append("div")
  .attr("class", function (d) {
    return "node level-" + d.depth;
  })
  .attr("title", function (d) {
    return d.data.name ? d.data.name : "null";
  });

cells
  .style("left", function (d) {
    return x(d.x0) + "%";
  })
  .style("top", function (d) {
    return y(d.y0) + "%";
  })
  .style("width", function (d) {
    return x(d.x1) - x(d.x0) + "%";
  })
  .style("height", function (d) {
    return y(d.y1) - y(d.y0) + "%";
  })
  //.style("background-image", function(d) { return d.value ? imgUrl + d.value : ""; })
  //.style("background-image", function(d) { return d.value ? "url(http://placekitten.com/g/300/300)" : "none"; })
  .style("background-color", function (d) {
    while (d.depth > 2) d = d.parent;
    return color(d.data.name);
  })
  .on("click", zoom)
  .append("p")
  .attr("class", "label")
  .text(function (d) {
    return d.data.name ? d.data.name : "---";
  });
//.style("font-size", "")
//.style("opacity", function(d) { return isOverflowed( d.parent ) ? 1 : 0; });

var parent = d3.select(".up").datum(nodes).on("click", zoom);

function zoom(d) {
  // http://jsfiddle.net/ramnathv/amszcymq/

  console.log("clicked: " + d.data.name + ", depth: " + d.depth);

  currentDepth = d.depth;
  parent.datum(d.parent || nodes);

  x.domain([d.x0, d.x1]);
  y.domain([d.y0, d.y1]);

  var t = d3.transition().duration(800).ease(d3.easeCubicOut);

  cells
    .transition(t)
    .style("left", function (d) {
      return x(d.x0) + "%";
    })
    .style("top", function (d) {
      return y(d.y0) + "%";
    })
    .style("width", function (d) {
      return x(d.x1) - x(d.x0) + "%";
    })
    .style("height", function (d) {
      return y(d.y1) - y(d.y0) + "%";
    });

  cells // hide this depth and above
    .filter(function (d) {
      return d.ancestors();
    })
    .classed("hide", function (d) {
      return d.children ? true : false;
    });

  cells // show this depth + 1 and below
    .filter(function (d) {
      return d.depth > currentDepth;
    })
    .classed("hide", false);
}
