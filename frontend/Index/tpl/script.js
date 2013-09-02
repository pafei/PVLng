/**
 *
 *
 * @author      Knut Kohl <github@knutkohl.de>
 * @copyright   2012-2013 Knut Kohl
 * @license     GNU General Public License http://www.gnu.org/licenses/gpl.txt
 * @version     $Id: v1.0.0.2-19-gf67765b 2013-05-05 22:03:31 +0200 Knut Kohl $
 */

/* ------------------------------------------------------------------------ */

/* Chart canvas height */
/* Width is 940px,
	- Ratio  5 x  4 : 752
	- Ratio  4 x  3 : 705
	- Ratio 16 x 10 : 587
	- Ratio 10 x  6 : 564
	- Ratio 16 x  9 : 528
*/
var ChartHeight = 564;

/* refresh timeout in sec., set 0 for no automatic refresh */
var RefreshTimeout = 300;

/* ------------------------------------------------------------------------ */
</script>

<script src="/js/chart.js"></script>
<script src="/js/jquery.treetable.js"></script>
<script src="/js/spectrum.js"></script>
<!--
<script src="/js/palettes.js"></script>
-->

<!-- load Highcharts scripts direct from highcharts.com -->
<script src="http://code.highcharts.com/highcharts.js"></script>
<script src="http://code.highcharts.com/highcharts-more.js"></script>
<script src="http://code.highcharts.com/modules/exporting.js"></script>

<script>

var
	chart, timeout,

	options = {
		chart: {
			renderTo: 'chart',
			height: ChartHeight,
			paddingRight: 15,
			alignTicks: false,
			zoomType: 'x',
			events: {
				selection: function(event) {
					setTimeout(setExtremes, 1000);
				}
			}
		},
		title: { text: '' },
		plotOptions: {
			line: {
				marker: { enabled: false }
			},
			spline: {
				marker: { enabled: false }
			},
			areaspline: {
				marker: { enabled: false },
				shadow: false,
				fillOpacity: 0.2
			},
			areasplinerange: {
				marker: { enabled: false },
				shadow: false,
				fillOpacity: 0.2
			},
			bar: {
				groupPadding: 0.1
			}
		},
		xAxis : {
			type: 'datetime'
		},
		tooltip: {
			useHTML: true,
			formatter: function() {
				var v,
					s = '<table><tr>' +
						'<td colspan="2" style="padding:0.3em 0;font-weight:bold">' +
						Highcharts.dateFormat('%a. %Y-%m-%d %H:%M',this.x).replace(/ 00:00$/g, '') +
						'</td></tr>';

				$.each(this.points, function(id, point) {
					var c = 'color:' + point.series.color;
					if (point.point.low != undefined && point.point.high != undefined) {
						v = Highcharts.numberFormat(+point.point.low, point.series.options.decimals) + ' - ' +
							Highcharts.numberFormat(+point.point.high, point.series.options.decimals);
					} else if (point.y != undefined) {
						v = Highcharts.numberFormat(+point.y, point.series.options.decimals);
					} else {
						return;
					}
					s += '<tr style="border-top:dotted lightgray 1px">' +
						 '<td nowrap style="' + c + '">' +
						 point.series.name+'</td>' +
						 '<td style="padding-left:3em;text-align:right;' + c + '">' + v + '</td>' +
						 '<td style="' + c + '"> ' +
						 point.series.tooltipOptions.valueSuffix +
						 '</td></tr>';
				});
				return s + '</table>';
			},
			borderColor: '#AAA',
			borderWidth: 1,
			shadow: true,
			crosshairs: true,
			shared: true
		},
		loading: {
			labelStyle: {
				top: '40%',
				fontSize: '200%'
			}
		}
	};

/**
 *
 */
function changeDates( dir ) {
	var from = Date.parse($('#from').datepicker('getDate')) + dir*24*60*60*1000;
	var to = Date.parse($('#to').datepicker('getDate')) + dir*24*60*60*1000;
	$("#from").datepicker( "option", "maxDate", 0 );
	$("#to").datepicker( "option", "maxDate", 0 );
	if (dir < 0) {
		/* backwards */
		$('#from').datepicker('setDate', new Date(from));
		$('#to').datepicker('setDate', new Date(to));
	} else {
		/* foreward */
		$('#to').datepicker('setDate', new Date(to));
		$('#from').datepicker('setDate', new Date(from));
	}
	updateChart();
}

/**
*
*/
var TreeExpanded = true;

/**
*
*/
function ToggleTree( force ) {
	TreeExpanded = (force != undefined) ? force : !TreeExpanded;

	$('input.channel').each(function(id, el) {
		/* checkbox -> wrapper div -> td -> tr */
		$(el).parent().parent().parent().toggle(TreeExpanded || $(el).is(':checked'));
	});

	if (TreeExpanded) {
		$('#treetoggle').attr('src','/images/ico/toggle.png').attr('alt','[-]');
		$('#tiptoggle').html('{{CollapseAll}}')
	} else {
		$('#treetoggle').attr('src','/images/ico/toggle_expand.png').attr('alt','[+]');
		$('#tiptoggle').html('{{ExpandAll}}')
	}

}

/**
 *
 */
function ChartDialog( id, name ) {
	/* get stringified settings */
	var p = new presentation($('#c'+id).val());
	/* set dialog properties */
	/* find the radio button with the axis value and check it */
	$('input[name="d-axis"][value="' + p.axis + '"]').prop('checked', true);
	$('#d-type').val(p.type);
	$('#d-cons').prop('checked', p.consumption);
	$('#d-bold').prop('checked', p.bold);
	$('#d-min').prop('checked', p.min);
	$('#d-max').prop('checked', p.max);
	$('#d-style').val(p.style);
	$('#d-color').val(p.color);
	$('#spectrum').spectrum('set', p.color);
	/* set the id into the dialog for onClose to write data back */
	$('#dialog-chart').data('id', id);
	$('#dialog-chart').dialog('option', 'title', name);
	$('#dialog-chart').dialog('open');
	$('input').iCheck('update');
}

/**
 *
 */
var channels = [];

/**
 * Scale timestamps down to full hour, day, week, month, quarter or year
 */
var xAxisResolution = {
	h: 3600,
	d: 3600 * 24,
	w: 3600 * 24 * 7,
	m: 3600 * 24 * 30,
	q: 3600 * 24 * 90,
	y: 3600 * 24 * 360,
};

/**
 *
 */
function updateChart() {

	clearTimeout(timeout);

	var ts = (new Date).getTime(),
	    channels_new = [], yAxisMap = [], yAxis = [],
		channel, channel_clone, buffer = [],
		period = $('#period').val();

	/* reset consumption and costs data */
	$('.minmax, .consumption, .costs, #costs').each(function(id, el) {
		$(el).html('');
	});

	/* find active channels, map and sort axis */
	$('input.channel:checked').each(function(id, el) {
		channel = new presentation($(el).val());
		channel.id = $(el).data('id');
		channel.guid = $(el).data('guid');
		channel.unit = $(el).data('unit');
		/* remember channel */
		buffer.push(channel);
		/* still mapped? */
		if (yAxisMap.indexOf(channel.axis) == -1) yAxisMap.push(channel.axis);
	});

	/* sort axis to make correct order for Highcharts */
	yAxisMap.sort();

	/* build channels */
	$(buffer).each(function(id, channel) {
		/* axis from chart point of view */
		channel.axis = yAxisMap.indexOf(channel.axis);

		if (channel.type == 'areasplinerange') {
			/* handling area splines */
			if (period == '') {
				/* no period => show spline */
				channel.type = 'spline';
				channels_new.push(channel);
			} else {
				/* period, add channel and ... */
				channels_new.push(channel);
				/* ... add 2nd spline channel! */
				var channel_clone = $.extend({}, channel);
				channel_clone.linkedTo = ':previous';
				channel_clone.type = 'spline';
				channels_new.push(channel_clone);
			}
		} else {
			channels_new.push(channel);
		}

		/* prepare axis */
		if (!yAxis[channel.axis]) {
			yAxis[channel.axis] = {
				/* unit as axis title */
				title: { text: channel.unit },
				lineColor:channel.color,
				/* odd axis on left, even on right side */
				opposite: (channel.axis & 1),
				showEmpty: false
			};
			/* only 1st left axis shows grid lines */
			if (channel.axis != 0) {
				yAxis[channel.axis].gridLineWidth = 0;
			}
		}
	});

	_log('Channels:', channels_new);
	_log('yAxis:', yAxis);

	/* check for changed channels */
	var changed = false;

	if (channels_new.length != channels.length) {
		changed = true;
		channels = channels_new;
	} else {
		for (var i=0, l=channels_new.length; i<l; i++) {
			if (JSON.stringify(channels_new[i]) != JSON.stringify(channels[i])) {
				changed = true;
				channels = channels_new;
			}
		}
	}

	var res = xAxisResolution[period];

	if (changed) {
		/* use UTC for timestamps with a period >= day to avoid wrong hours in hint */
		Highcharts.setOptions({	global: { useUTC: (res >= xAxisResolution.d) } });

		/* happens also on 1st call! */
		options.yAxis = yAxis;
		/* (re)create chart */
		chart = new Highcharts.Chart(options);
	}

	chart.showLoading('{{LOADING}}');

	var series = [], costs = 0;

	/* get data */
	$(channels).each(function(id, channel) {

		$('#s'+channel.id).show();

		var t, url = PVLngAPI + channel.guid + '/data/full/attributes';
		_log('Fetch: '+url);

		$.getJSON(
			url,
			{
				start:	$('#fromdate').attr('value'),
				end:	$('#todate').attr('value') + '+1day',
				period: (channel.type != 'scatter') ? $('#periodcnt').val() + period : '',
				full:   period,
				_ts:	(new Date).getTime()
			},
			function(data) {
				/* pop out 1st row with attributes */
				attr = data.shift();
				_log('Attributes:', attr);
				_log('Data: ', data);

				if (attr.consumption) {
					$('#cons'+channel.id).html(Highcharts.numberFormat(attr.consumption, attr.decimals));
				}

				if (attr.costs) {
					costs += +attr.costs.toFixed({CURRENCYDECIMALS});
					$('#costs'+channel.id).html(Highcharts.numberFormat(attr.costs, {CURRENCYDECIMALS}));
				}

				t = (attr.description) ? ' (' + attr.description + ')' : '';

				var serie = { /* HTML decode channel name */
				    id:       channel.id,
				    decimals: attr.decimals,
					unit:     attr.unit,
					name:     $("<div/>").html(attr.name + t).text(),
					color:    channel.color,
					type:     channel.type,
					yAxis:    channel.axis,
					data:     []
				};

				if (channel.linkedTo != undefined) serie.linkedTo = channel.linkedTo;
				if (attr.unit) serie.tooltip = { valueSuffix: attr.unit };

				if (channel.type == 'scatter') {
					serie.dataLabels = {
						enabled: true,
						align: 'left',
						rotation: 270,
						align: 'left',
						x: 4,
						y: -7,
						formatter: function() { return this.point.name }
					};
				} else if (channel.type != 'bar') {
					serie.dashStyle = channel.style;
					serie.lineWidth = channel.bold
					                ? defaults.line.bold
					                : defaults.line.normal;
				}

				$(data).each(function(id, row) {
					var ts = res
					       ? Math.round(row.timestamp / res) * res * 1000
					       : row.timestamp * 1000;
					if ($.isNumeric(row.data)) {
						if (channel.type == 'areasplinerange') {
							serie.data.push([ts, row.min, row.max]);
						} else if (channel.consumption) {
							serie.data.push([ts, row.consumption]);
						} else {
							serie.data.push([ts, row.data]);
						}
					} else {
						serie.data.push({
							x: row.timestamp*1000,
							y: 0,
							name: row.data
						});
					}
				});

				if (channel.type != 'areasplinerange' && (channel.min || channel.max)) {
					serie = setMinMax(serie, channel.min, channel.max);
				}

				_log('Serie: ', serie);

				series[id] = serie;

				$('#s'+channel.id).hide();

				if ('{CHART_NOTIFYLOAD}') $.pnotify({
					type: 'success',
					text: attr.name + ' loaded'
				});
			}
		).fail(function(data, status) {
		    _log('FAIL', data, status);
		}).always(function(data, status) {
			/* check real count of elements in series array! */
			var completed = series.filter(function(a){ return a !== undefined }).length;
			_log(completed+' series completed');

			/* check if all getJSON() calls finished */
			if (completed == channels.length) {
				$.pnotify({
					type: 'success',
					text: completed + ' channels loaded ' +
					      '(' + (((new Date).getTime() - ts)/1000).toFixed(1) + 's)'
				});
				$('#costs').html(costs ? Highcharts.numberFormat(costs, {CURRENCYDECIMALS}) : '');
				var t = $('#from').val();
				var s = $('#to').val();
				if (t != s) t += ' - ' + s;
				chart.setTitle({ text: $('#loaddeleteview').val() }, { text: t });

				_log('Apply series');

				if (changed) {
					/* remove all existing series */
					while (chart.series.length) {
						chart.series[0].remove();
					}
					/* add new series */
					$.each(series, function(i, serie) {
						chart.addSeries(serie, false);
					});
				} else {
					/* replace series data */
					$.each(series, function(i, serie) {
						chart.series[i].setData(serie.data, false);
					});
				}

				chart.hideLoading();
				chart.redraw();
				setExtremes();
				/* setTimeout(setExtremes, channels.length*100); */

				if (RefreshTimeout > 0) {
					timeout = setTimeout(updateChart, RefreshTimeout*1000);
				}
			}
		});
	});
}

/**
 *
 */
$(function() {

	$('#tree').DataTable({
		bPaginate: false,
		bLengthChange: false,
		bFilter: false,
		bSort: false,
		bInfo: false,
		bJQueryUI: true
	});

	$('.treeTable').treetable({
		initialState: 'expanded',
		indent: 24,
		column: 1
	});

	$("#dialog-chart").dialog({
		autoOpen: false,
		width: 652, /* grid_7 */
		modal: true,
		buttons: {
			'{{Ok}}': function() {
				p = new presentation();
				p.axis = +$('input[name="d-axis"]:checked').val();
				p.type = $('#d-type').val();
				p.consumption = $('#d-cons').is(':checked');
				p.style = $('#d-style').val();
				p.bold = $('#d-bold').is(':checked');
				p.min = $('#d-min').is(':checked');
				p.max = $('#d-max').is(':checked');
				p.color = $('#spectrum').spectrum("get").toHexString();
				$('#c'+$(this).data('id')).val(p.toString());
				$(this).dialog('close');
			},
			'{{Cancel}}': function() {
				$(this).dialog('close');
			}
		}
	});

	$('#spectrum').spectrum({
		showPalette: true,
/*
		showPaletteOnly: true,
		localStorageKey: 'pvlng.channel.color',
*/
		palette: [
			['#404040', '#4572A7'],
			['#AA4643', '#89A54E'],
			['#80699B', '#3D96AE'],
			['#DB843D', '#92A8CD'],
			['#A47D7C', '#B5CA92']
		],
		showInitial: true,
		showInput: true,
		showButtons: false,
		preferredFormat: 'hex',
		hide: function(color) { color.toHexString(); }
	});

	if ('{LANGUAGE}' != 'en') {
		$.datepicker.setDefaults($.datepicker.regional['{LANGUAGE}']);
	}

	$("#from").datepicker({
		altField: '#fromdate',
		altFormat: 'mm/dd/yy',
		maxDate: 0,
		showButtonPanel: true,
		showWeek: true,
		changeMonth: true,
		changeYear: true,
		onClose: function( selectedDate ) {
			$("#to").datepicker( "option", "minDate", selectedDate );
			$("#to").datepicker( "option", "maxDate", 0 );
		}
	});

	$("#to").datepicker({
		altField: '#todate',
		altFormat: 'mm/dd/yy',
		maxDate: 0,
		showButtonPanel: true,
		showWeek: true,
		changeMonth: true,
		changeYear: true,
		onClose: function( selectedDate ) {
			$("#from").datepicker( "option", "maxDate", selectedDate );
		}
	});

	var d = new Date('{DATE}');
	$("#from").datepicker('setDate', d);
	$("#to").datepicker('setDate', d);

	Highcharts.setOptions({
		global: {
			alignTicks: false
		},
		lang: {
			thousandsSep: '{TSEP}',
			decimalPoint: '{DSEP}',
			resetZoom: '{{resetZoom}}',
			resetZoomTitle: '{{resetZoomTitle}}'
		}
	});

	if ($('#loaddeleteview').val()) {
		ToggleTree(false);
		updateChart();
	}

	$('#az').prop('checked', lscache.get('zero'));
	$('#az').click(function() {
		lscache.set('zero', $(this).is(':checked'));
		setExtremes();
	});

	$('#d-type').change(function() {
		$('#d-style').prop('disabled', (this.value == 'bar' || this.value == 'scatter'));
	});

	$('input').iCheck('update');

	$('#btn-clear').button({
		icons: {
			primary: 'ui-icon-trash'
		},
		text: false
	});

	$('#btn-refresh').button({
		icons: {
			primary: 'ui-icon-refresh'
		},
		text: false
	});

	$('#btn-bookmark').button({
		icons: {
			primary: 'ui-icon-bookmark'
		},
		text: false,
		disabled: ('{VIEW}' == '')
	}).prop('href', $('#btn-bookmark').data('url') + encodeURIComponent('{VIEW}'));

	$('#loaddeleteview').change(function() {
		var el = $('#btn-bookmark');
		el.button({
			label: 'PVLng | ' + this.value,
			disabled: (this.value == '')
		}).prop('href', el.data('url') + encodeURIComponent(this.value));
	});

	$('#togglewrapper').click(function() {
	    var visible = ! $('#wrapper').is(':visible');
	    var link = $(this);

		$('#wrapper').animate(
			{ height: 'toggle', opacity: 'toggle' }, 'slow', 'linear',
			function() {
			    if (visible) {
			        link.html('{{HideChannels}}');
					$('#wrapper').css('visibility', 'visible');
				} else {
			        link.html('{{ShowChannels}}');
					$('#wrapper').css('visibility', 'hidden');
				}
			}
		);

		return false;
	});

});