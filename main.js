/*
The purpose of this demo is to demonstrate how multiple charts on the same page
can be linked through DOM and Highcharts events and API methods. It takes a
standard Highcharts config with a small variation for each data set, and a
mouse/touch event handler to bind the charts together.
*/


// ****** CHANGE PATIENT HERE TO INDICATE PROFILE OF CHOICE ********
var PATIENT = "patient2";


/**
 * In order to synchronize tooltips and crosshairs, override the
 * built-in events with handlers defined on the parent element.
 */
    $('#container').bind('mousemove touchmove touchstart', function(e) {
        var chart,
            point,
            point1,
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
            if (point && point1){
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

// Get the data. The contents of the data file can be viewed at
$.getJSON(
    // 'https://cdn.rawgit.com/highcharts/highcharts/057b672172ccc6c08fe7dbb27fc17ebca3f5b770/samples/data/activity.json',
    jsonFile,
    function (activity) {
        $.each(activity.datasets, function (i, dataset) {

        	var enabled;
        	if (i == 0) {
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
            

            $('<div class="chart">')
                .appendTo('#container')
                .highcharts({
                    chart: {
                        marginLeft: 60, // Keep all charts left aligned
                        spacingTop: 90,
                        spacingBottom: 0,
                        style: {
                            fontFamily: 'Open Sans'
                        }
                    },
                    title: {
                        text: dataset.name,
                        align: 'left',
                        margin: 15,
                        x: 50,
                        style: {
                            fontWeight: 'bold'
                        }
                    },
                    rangeSelector: {
                    	enabled: enabled,
                    	floating: true,
			            y: -120,
			            verticalAlign: 'top',
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
                        enabled: dataset.dual
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
                    yAxis: [{
                        title: {
                            text: dataset.name
                        }
                    }, {
                        title: {
                            text: dataset.name1 || null
                        },
                        opposite: true
                    }],
                    tooltip: {
                        positioner: function () {
                            return {
                                // right aligned
                                // x: this.chart.chartWidth - this.label.width,
                                x: this.chart.chartWidth - this.label.width - 40, 
                                y: dataset.dual ? 60 : 80 // align to title
                            };
                        },
                        shared: dataset.dual,
                        borderWidth: 0,
                        backgroundColor: 'none',
                        pointFormat: '<tr><td>{point.y}</td></tr><br/>',
                        headerFormat: '',
                        shadow: false,
                        style: {
                            fontSize: '16px'
                        },
                        valueDecimals: dataset.valueDecimals
                    },
                    series: [{
                        data: dataset.data,
                        name: dataset.name,
                        type: dataset.type,
                        color: Highcharts.getOptions().colors[0],
                        fillOpacity: 0.3,
                        tooltip: {
                            valueSuffix: ' ' + dataset.unit
                        },
                        yAxis: 0,
                    },
                    {
                        data: dataset.data1,
                        name: dataset.name1,
                        type: dataset.type1,
                        color: Highcharts.getOptions().colors[i],
                        fillOpacity: 0.3,
                        tooltip: {
                            valueSuffix: ' ' + dataset.unit1
                        },
                         yAxis: 1,
                    }] 
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
