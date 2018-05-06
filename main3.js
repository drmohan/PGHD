/*
The purpose of this demo is to demonstrate how multiple charts on the same page
can be linked through DOM and Highcharts events and API methods. It takes a
standard Highcharts config with a small variation for each data set, and a
mouse/touch event handler to bind the charts together.
*/


// ****** CHANGE PATIENT HERE TO INDICATE PROFILE OF CHOICE ********
var PATIENT = "patient3";


/**
 * In order to synchronize tooltips and crosshairs, override the
 * built-in events with handlers defined on the parent element.
 */
    $('#container').bind('mousemove touchmove touchstart', function(e) {
        var chart,
            point,
            point1,
            point2,
            i;
            
        // Find coordinates within the chart. In case charts are side by side,
        // use the chart we are hovering.
        for (i = 0; i < Highcharts.charts.length; i = i + 1) {
            chart = Highcharts.charts[i];
            e = chart.pointer.normalize(e); 
            if (e.chartX > chart.xAxis[0].pos && e.chartX < chart.xAxis[0].pos + chart.xAxis[0].len) {
                break;
            }
        }
        for (i = 0; i < Highcharts.charts.length; i = i + 1) {
            chart = Highcharts.charts[i];
            point = chart.series[0].searchPoint(e, true); // Get the hovered point
            if (chart.series[1]) {
                point1 = chart.series[1].searchPoint(e, true); // Get the hovered point
            }

            if (chart.series[2]) {
                point2 = chart.series[2].searchPoint(e, true); // Get the hovered point
            }
            if (point && point1 && point2){
                point.onMouseOver(); // Show the hover marker
                point1.onMouseOver(); // Show the hover marker
                point2.onMouseOver(); // Show the hover marker
                 
                chart.tooltip.refresh([point,point1,point2]); // Show the tooltip
                chart.xAxis[0].drawCrosshair(e, point); // Show the crosshair
                chart.xAxis[0].drawCrosshair(e, point1); // Show the crosshair
                chart.xAxis[0].drawCrosshair(e, point2); // Show the crosshair

            } else if (point && point1){
                point.onMouseOver(); // Show the hover marker
                point1.onMouseOver(); // Show the hover marker
                chart.tooltip.refresh([point,point1]); // Show the tooltip
                chart.xAxis[0].drawCrosshair(e, point); // Show the crosshair
                chart.xAxis[0].drawCrosshair(e, point1); // Show the crosshair
            } else if (point){
                point.onMouseOver(); // Show the hover marker
                chart.tooltip.refresh(point); // Show the tooltip
                chart.xAxis[0].drawCrosshair(e, point); // Show the crosshair
            }
        }
    });
/**
 * Override the reset function, we don't need to hide the tooltips and
 * crosshairs.
 */
Highcharts.Pointer.prototype.reset = function () {
    return undefined;
};

/**
 * Highlight a point by showing tooltip, setting hover state and draw crosshair
 */
Highcharts.Point.prototype.highlight = function (event) {
    event = this.series.chart.pointer.normalize(event);
    this.onMouseOver(); // Show the hover marker
    this.series.chart.tooltip.refresh(this); // Show the tooltip
    this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
};

/**
 * Synchronize zooming through the setExtremes event handler.
 */
function syncExtremes(e) {
    var thisChart = this.chart;

    if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
        Highcharts.each(Highcharts.charts, function (chart) {
            if (chart !== thisChart) {
                if (chart.xAxis[0].setExtremes) { // It is null while updating
                    chart.xAxis[0].setExtremes(
                        e.min,
                        e.max,
                        undefined,
                        false,
                        { trigger: 'syncExtremes' }
                    );
                }
            }
        });
    }
}

var jsonFile = "patient_data/" + PATIENT + ".json";
var sidebarPath = "partials/" + PATIENT + ".html";

$("#sidebar").load(sidebarPath); 

// Get the data
$.getJSON(
    jsonFile,
    function (activity) {
        $.each(activity.datasets, function (i, dataset) {


            // turns the time frame zoom controls on only for the graph at the top left
            // since Highcharts requires it to be within a chart and we want it to be 
            // a universal control
            var enabled;
            if (i == 1) {
                enabled = true;
            } else {
                enabled = false;
            }

            // Add X values
            dataset.data = Highcharts.map(dataset.data, function (val, j) {
                return [Date.parse(activity.xData[j]), val];
            });

            if (dataset.data1) {
                dataset.data1 = Highcharts.map(dataset.data1, function (val, j) {
                    return [Date.parse(activity.xData[j]), val];
                });
            }

            if (dataset.data2) {
                dataset.data2 = Highcharts.map(dataset.data2, function (val, j) {
                    return [Date.parse(activity.xData[j]), val];
                });
            }

            var status_dots = {
                'green': 'http://www.clker.com/cliparts/r/M/L/o/R/i/green-dot.svg.med.png', 
                'yellow': 'http://www.clker.com/cliparts/o/b/y/x/Z/c/yellow-dot-md.png',
                'red': 'http://www.clker.com/cliparts/T/G/b/7/r/A/red-dot-md.png'
            }

            var metric_status = status_dots[dataset.status];

            var data = {
                        data: dataset.data,
                        name: dataset.name,
                        type: dataset.type,
                        color: Highcharts.getOptions().colors[0],
                        fillOpacity: 0.3,
                        tooltip: {
                            valueSuffix: ' ' + dataset.unit
                        },
                        yAxis: 0,
                    };

            var data1 = {
                        data: dataset.data1,
                        name: dataset.name1,
                        type: dataset.type1,
                        color: dataset.type1 == 'area' ? '#205897' : '#123256',
                        fillOpacity: 0.5,
                        tooltip: {
                            valueSuffix: ' ' + dataset.unit1
                        },
                         yAxis: dataset.dual ? 1 : 0,
                    };

            var data2 = {
                        data: dataset.data2,
                        name: dataset.name2,
                        type: dataset.type2,
                        color: '#123256',
                        fillOpacity: 0.9,
                        tooltip: {
                            valueSuffix: ' ' + dataset.unit2
                        },
                         yAxis: dataset.dual ? 1 : 0,
                         showInLegend: dataset.data2 ? true : false                         
                    };
            

            $('<div class="chart">')
                .appendTo('#container')
                .highcharts({
                    chart: {
                        marginLeft: 60, // Keep all charts left aligned
                        spacingTop: 90,
                        spacingBottom: 0,
                        style: {
                            fontFamily: 'Open Sans'
                        },
                        backgroundColor: 'none'
                    },
                    title: {
                        useHTML: true,
                        text: "<div class='title_bar'><div class='title'>" + dataset.title + "</div><img class='status' src='"+ metric_status +"'/></div>",
                        align: 'left',
                        x: 50,
                        style: {
                        }
                    },
                    rangeSelector: {
                        enabled: enabled,
                        floating: true,
                        y: -120,
                        verticalAlign: 'top',
                        inputStyle: {
                            color: 'white',
                            fontWeight: 'bold'
                        },
                        labelStyle: {
                            color: 'white',
                            fontWeight: 'bold'
                        },
                        inputPosition: {
                            align: 'left',
                            x: -50
                        },
                        buttonPosition: {
                            align: 'right',
                            x: -50
                        },
                        buttons: [{
                            type: 'week',
                            count: 1,
                            text: '1w'
                        }, {
                            type: 'week',
                            count: 2,
                            text: '2w'
                        }, {
                            type: 'all',
                            text: 'All'
                        }],

                    },
                    credits: {
                        enabled: false
                    },
                    legend: {
                        enabled: dataset.legend,
                        title: {
                            text: '<span style="font-size: 9px; color: #666; font-weight: normal">(Click a line to hide it)</span>',
                            style: {
                                fontStyle: 'italic'
                            }
                        }
                    },
                    xAxis: {
                        crosshair: true,
                        events: {
                            setExtremes: syncExtremes
                        },
                        type: 'datetime',
                        labels: {
                            format: '{value:%m/%d}'
                        },
                    },
                    plotOptions: {
                        series: {
                            stacking: 'normal'
                        }
                    },
                    yAxis: [{
                        title: {
                            text: dataset.unit
                        }
                    }, {
                        title: {
                            text: dataset.dual ? dataset.unit1 : null
                        },
                        opposite: true
                    }],
                    tooltip: {
                        positioner: function () {
                            return {
                                // right aligned
                                x: this.chart.chartWidth - this.label.width - 30, 
                                y: dataset.shared ? 70 : 60 // align to title
                            };
                        },
                        shared: dataset.shared,
                        borderWidth: 0,
                        backgroundColor: 'none',
                        useHTML: true,
                        headerFormat: '<table>',
                        pointFormat: '<tr class="tooltip"><td>{series.name}</br><b style="font-size:14px;">{point.y}</b></td></tr>',
                        footerFormat: '</table>',
                        shadow: false,
                        style: {
                            fontSize: '10px',
                        },
                        valueDecimals: dataset.valueDecimals
                    },
                    series: [
                        data,
                        data1,
                        data2
                    ] 

                }, function (chart) {

                    // apply the date pickers
                    setTimeout(function () {
                        $('input.highcharts-range-selector', $(chart.container).parent())
                            .datepicker();
                    }, 0);
                });
        });
    }
);

$.datepicker.setDefaults({
    dateFormat: 'yy-mm-dd',
    onSelect: function () {
        this.onchange();
        this.onblur();
    }
});
