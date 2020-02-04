$(document).ready(function() {
  $(".articlemenu").click(function() {
    $(".articletext").toggle(200);
  });

  var width = $(".canvas").width(),
    height = $(".canvas").height();

  var color = d3
    .scaleOrdinal()
    .range([
      "#ff4848",
      "#1adbe5",
      "#efd952",
      "#ff7394",
      "#b8d879",
      "#88bbea",
      "#cec4b6"
    ]);

  var format = d3.timeFormat("%j");
  var parseDay = d3.timeParse("%j");
  var textformat = d3.timeFormat("%m월 %d일");

  var simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3
        .forceLink()
        .id(function(d) {
          return d.number;
        })
        .distance(function(d) {
          return 30;
        })
        .strength(function(d) {
          return 1;
        })
    )
    .force("collide", d3.forceCollide(30))
    .force("center", d3.forceCenter(width / 2, height / 2));

  var svg = d3
    .select("#slider")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  d3.json("../corona.json", function(error, graph) {
    $(".update").html(graph.update);
    $(".ui-slider-handle").draggable();
    updateNodes();
    $("#slider1").slider({
      range: "min",
      min: +format(new Date("2020-01-20")),
      max: +format(new Date()),
      value: +format(new Date("2020-01-20")),
      change: function(event, ui) {
        $("#yeartext").text("2020년 " + textformat(parseDay("" + ui.value)));
        svg.selectAll(".link").style("stroke-width", function(d) {
          if (format(new Date(d.value)) - 1 < ui.value) {
            return "4px";
          } else {
            return "0px";
          }
        });

        svg.selectAll(".nodelabel").style("opacity", function(d) {
          if (format(new Date(d.value)) - 1 < ui.value) {
            return 1;
          } else {
            return 0;
          }
        });

        svg.selectAll(".node").style("opacity", function(d) {
          if (format(new Date(d.value)) - 1 < ui.value) {
            return 1;
          } else {
            return 0;
          }
        });
      }
    });

    $(function AutoSlider() {
      var timeline;

      timeline = setInterval(function() {
        var value = $("#slider1").slider("value");
        var max = $("#slider1").slider("option", "max");
        $("#slider1").slider("value", (value + 1) % (max + 1));

        if (value + 1 == format(new Date())) {
          clearInterval(timeline);
        }
      }, 500);

      $('input:radio[name="btnA"]').change(function() {
        if ($('input:radio[name="btnA"]:input[value=stop]').is(":checked")) {
          clearInterval(timeline);
        }
        if ($('input:radio[name="btnA"]:input[value=start]').is(":checked")) {
          timeline = setInterval(function() {
            var value = $("#slider1").slider("value");
            var max = $("#slider1").slider("option", "max");
            $("#slider1").slider("value", (value + 1) % (max + 1));

            if (value + 1 == format(new Date())) {
              clearInterval(timeline);
            }
          }, 500);
        }

        if ($('input:radio[name="btnA"]:input[value=total]').is(":checked")) {
          clearInterval(timeline);
          $("#slider1").slider("value", +format(new Date()));
        }
      });
    });

    function updateNodes() {
      var toggle = 0;
      var linkedByIndex = {};
      for (i = 0; i < graph.nodes.length; i++) {
        linkedByIndex[i + "," + i] = 1;
      }
      graph.links.forEach(function(d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
      });

      simulation.nodes(graph.nodes).on("tick", ticked);
      simulation.force("link").links(graph.links);

      function marker(color) {
        svg
          .append("svg:marker")
          .attr("id", color.replace("#", ""))
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 14)
          .attr("refY", 0)
          .attr("markerWidth", 3)
          .attr("markerHeight", 3)
          .attr("orient", "auto")
          .attr("xoverflow", "visible")
          .append("svg:path")
          .attr("d", "M0,-5L10,0L0,5")
          .style("fill", color);

        return "url(" + color + ")";
      }

      var link = svg
        .selectAll(".link")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("class", "link")
        .each(function(d) {
          d3.select(this).attr("marker-end", marker(color(d.group)));
        })
        .style("stroke", function(d) {
          return color(d.group);
        })
        .style("opacity", 0.3)
        .on("mouseover", function(d) {
          d3.select(this)
            .style("stroke-width", "6px")
            .style("opacity", 0.7);
        })
        .on("mouseout", function(d) {
          d3.select(this)
            .style("stroke-width", "4px")
            .style("opacity", 0.4);
        })
        .on("click", function(d) {
          $("#hidelink").show();

          d3.select("#articles")
            .selectAll("a")
            .remove();

          d3.select(".databox-link").style("display", "block");
          d3.select(".databox").style("display", "none");

          d3.select("#datatablTitle").text(
            d.source.name + " - " + d.target.name
          );

          d3.select("#firsthead-link").text("관련 기사");
          d3.select("#articles")
            .selectAll("a")
            .data(d.sbsarticle)
            .enter()
            .append("a")
            .attr("href", function(d) {
              return d.link;
            })
            .text(function(d) {
              return d.title;
            });
        })

        .call(
          d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

      var nodetext = svg
        .selectAll(".nodelabel")
        .data(graph.nodes)
        .enter()
        .append("text")
        .attr("class", "nodelabel")
        .text(function(d) {
          return d.name;
        })
        .style("font-size", function(d) {
          if (d.number === 0) {
            return "0";
          } else {
            return "0.7rem";
          }
        })
        .style("fill", function(d) {
          return color(d.group);
        })
        .style("opacity", 0.8)
        .attr("margin", "3px")
        .style("font-weight", function(d) {
          if (d.number === 0) {
            return 0;
          } else {
            return 500;
          }
        })
        .on("click", function(d) {
          $("#hidelink").hide();

          d3.select("#datatablTitle").text(d.name);
          makeTabe(d);

          if (toggle == 0) {
            d = d3.select(this).node().__data__;

            link.style("opacity", function(o) {
              return (d.index == o.source.index) | (d.index == o.target.index)
                ? 0.7
                : 0.3;
            });
            toggle = 1;
          } else {
            link.style("opacity", 0.3);
            toggle = 0;
          }
        });
      var defs = svg.append("svg:defs");
      defs
        .append("pattern")
        .attr("id", "china")
        .attr("width", 1)
        .attr("height", 1)
        .append("svg:image")
        .attr("xlink:href", "../virus.png")
        .attr("width", 30)
        .attr("height", 30)
        .attr("y", 0)
        .attr("x", 0);

      var node = svg
        .selectAll(".node")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr("class", function(d, i) {
          return "node" + " " + d.number;
        })
        .attr("r", function(d) {
          if (d.number === 0) {
            return 15;
          } else {
            return 8;
          }
        })
        .style("fill", function(d) {
          if (d.number === 0) {
            return "url(#china)";
          } else {
            return color(d.group);
          }
        })
        .style("stroke-width", function(d) {
          if (d.number === 0) {
            return "0px";
          } else {
            return "2px";
          }
        })
        .style("stroke", "#ffffff")
        .on("click", function(d) {
          $("#hidelink").hide();
          d3.select("#datatablTitle").text(d.name);
          makeTabe(d);

          if (toggle == 0) {
            d = d3.select(this).node().__data__;

            link.style("opacity", function(o) {
              return (d.index == o.source.index) | (d.index == o.target.index)
                ? 0.7
                : 0.3;
            });

            toggle = 1;
          } else {
            link.style("opacity", 0.3);
            toggle = 0;
          }
        })
        .call(
          d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

      function ticked() {
        link
          .attr("x1", function(d) {
            return d.source.x;
          })
          .attr("y1", function(d) {
            return d.source.y;
          })
          .attr("x2", function(d) {
            return d.target.x;
          })
          .attr("y2", function(d) {
            return d.target.y;
          });

        node.attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
        nodetext
          .attr("x", function(d) {
            if (d.number === 0) {
              return d.x - 10;
            } else {
              return d.x - 10;
            }
          })
          .attr("y", function(d) {
            if (d.number === 0) {
              return d.y + 10;
            } else {
              return d.y - 10;
            }
          })
          .attr("text-anchor", "end");
      }

      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    }
  });
});
function makeTabe(d) {
  d3.select("#articles")
    .selectAll("a")
    .remove();
  if (d.number == 0) {
    d3.select(".databox").style("display", "none");
    d3.select(".databox-link").style("display", "none");
  } else {
    d3.select(".databox-link").style("display", "none");
    d3.select(".databox").style("display", "block");
    d3.select("#firsthead").text("확진날짜");
    d3.select("#secondhead").text("감염 차수");
    d3.select("#thirdhead").text("현재 상태");
    d3.select("#fourthhead").text("치료병원");
    d3.select("#fivehead").text("국적");
    d3.select("#sixhead").text("성별");
    d3.select("#sevenhead").text("우한 방문 여부");
    d3.select("#eighthead").text("나이");
    d3.select("#ninehead").text("발견경로");
    d3.select("#tenhead").text("접촉자");

    d3.select("#firsttext").text(d.value);
    d3.select("#secondtext").text(d.connect);
    d3.select("#thirdtext").text(d.status);
    d3.select("#fourthtext").text(d.hospital);
    d3.select("#fivetext").text(d.country);
    d3.select("#sixtext").text(d.gender);
    d3.select("#seventext").text(d.visit);
    d3.select("#eighttext").text(d.age);
    d3.select("#ninetext").text(d.check);
    d3.select("#tentext").text(d.contact);
  }
}
