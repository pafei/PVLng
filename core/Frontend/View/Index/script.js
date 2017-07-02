/**
 *
 *
 * @author      Knut Kohl <github@knutkohl.de>
 * @copyright   2012-2014 Knut Kohl
 * @license     MIT License (MIT) http://opensource.org/licenses/MIT
 * @version     1.0.0
 */
var ChartHeight = +'{INDEX_CHARTHEIGHT}',
    RefreshTimeout = +'{INDEX_REFRESH}',
    isEmbedded = +'{EMBEDDED}',
    notifyLoadAll = +'{INDEX_NOTIFYALL}',
    presetPeriods = '{INDEX_PRESETPERIODS}' || '--;1d;1d;1m',
    aborted = false,
    qs = {},
    chart = false,
    /*  chartLoading = '<img src="/images/loading_dots.gif" width="64" height="21">', */
    chartLoading = '<i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw" style="opacity:0.25"></i>',
    channels_chart = [],
    updateTimeout,
    updateActive = false,
    windowVisible = true,
    browserPrefix = null,
    oTable,
    channels = {
        <!-- BEGIN DATA -->
        {raw:ID}: { id: {raw:ID}, guid: '{GUID}', name: '{NAME}', unit: '{UNIT}', entity: {ENTITY}, n: {NUMERIC} },
        <!-- END -->
    },

    tzOffset = {raw:TZOFFSET}, /* Timezone offset in seconds */
    tzOffsetToolTip = ((new Date()).getTimezoneOffset() * 60 + tzOffset) * 1000,
    tooltipDate = new Date,

    chartOptions = {
        /* Buffer some additional settings */
        common: {
            scatter: { x: -1, y: -8 },
            outline: { color: '#FFFFFF', opacity: 0.5, width: 3 /* px each side */ }
        },
        chart: {
            renderTo: 'chart',
            events: {
                load: function () {
                    this.renderer
                        .label('PVLng v'+PVLngVersion)
                        .attr('padding', 1)
                        .css({ color: 'lightgray', fontSize: '11px' })
                        .add();
                },
                redraw: function () {
                    /* Date and time without seconds */
                    this.renderer
                        .label((new Date).toLocaleString().slice(0,-3), 0, 16)
                        .attr({ fill: 'white', padding: 1 })
                        .css({ color: 'lightgray', fontSize: '9px' })
                        .add();
                }
            },
            panning: true,
            resetZoomButton: {
                relativeTo: 'chart',
                position: { x: -2, y: 7 }
            },
            style: { fontFamily: 'inherit' }
        },
        credits: false,
        loading: {
            labelStyle: { top: '40%' },
            style: { opacity: 0.8 }
        },
        mapNavigation: {
            /* For mouse wheel zoom */
            enabled: true,
            enableButtons: false
        },
        plotOptions: {
            series: { turboThreshold: 0 },
            line: { marker: { enabled: false } },
            spline: { marker: { enabled: false } },
            areaspline: {
                marker: { enabled: false },
                shadow: false,
                fillOpacity: 0.2,
            },
            areasplinerange: {
                marker: { enabled: false },
                shadow: false,
                fillOpacity: 0.2
            },
            bar: {
                groupPadding: 0.1,
                stacking: null
            }
        },
        title: { text: '' /* Initial empty */ },
        tooltip: {
            useHTML: true,
            formatter: function () {
                var title, body = '';
                $.each(this.points, function (id, point) {
                    var value, color, even = (id & 1) ? 'even' : ''; /* id starts by 0 */

                    /* Show tooltip only for series with a unit */
                    if (point.series.tooltipOptions.valueSuffix == '') {
                        return;
                    }

                    if (point.point.low != undefined && point.point.high != undefined) {
                        color = point.series.color;
                        value = point.point.low + ' - ' + point.point.high;
                    } else if (point.y != undefined) {
                        if (point.series.options.negativeColor && +point.y < point.series.options.threshold) {
                            color = point.series.options.negativeColor;
                        } else {
                            color = point.series.color;
                        }
                        value = point.y;
                    } else {
                        return;
                    }
                    body += '<tr style="color:' + color + '" class="' + even + '">'
                          + '<td class="name">' + point.series.name + '</td>'
                          + '<td class="value">' + value + '</td>'
                          + '<td class="unit">' + point.series.tooltipOptions.valueSuffix
                          + '</td></tr>';
                });
                if (body) {
                    tooltipDate.setTime(this.x + tzOffsetToolTip);
                    title = tooltipDate.toLocaleString();
                    if (period.value && period.value != 's') {
                        /* At least full minute or more, remove the always :00 seconds */
                        title = title.replace(/:00$/, '');
                    }
                    body = '<table id="chart-tooltip">' +
                           '<thead><tr><th colspan="3">' + title + '</th></tr></thead>' +
                           '<tbody>' + body + '</tbody>' +
                           '</table>';
                }
                return body;
            },
            borderWidth: 0,
            shadow: true,
            crosshairs: true,
            shared: true
        },
        xAxis: {
            type: 'datetime',
            minPadding: 0.02,
            maxPadding: 0.02,
            events: {
                afterSetExtremes: function (event) {
                    var ex = this.getExtremes();
                    if (ex.dataMax - ex.dataMin > event.max - event.min) {
                        /* Zoomed in */
                        if (!chart.resetZoomButton) {
                            chart.showResetZoom();
                        }
                    } else {
                        /* Full zoomed out, but make sure all is reset correct */
                        chart.zoomOut();
                    }
                }
            }
        }
    };

/**
 *
 */
var views = new function Views() {

    this.views = {};
    this.actual = { slug: '', name: '', public: 0 };
    this.preset = '';

    this.fetch = function (callback) {
        this.views = {};
        var that = this;
        $.getJSON(
            PVLngAPI + 'views.json',
            { sort_by_visibilty: true, no_data: true },
            function (data) {
                var l = data.length;
                for (var i = 0; i<l; i++) {
                    that.views[data[i].slug] = data[i];
                }
                if (l) {
                    $('.ui-tabs').tabs('option', 'active', 1) /* Tabs are zero based */
                }
            }
        ).always(function () {
            if (typeof callback != 'undefined') {
                callback(that);
            }
        });
    };

    this.buildSelect = function (el, selected) {
        var optgroups = [ [], [], [] ],
            labels = [ '{{private}}', '{{public}}', '{{mobile}}' ],
            l, i, j;

        el = $(el).empty();

        /* Build optgroups */
        $.each(this.views, function (id, view) {
            /* Collect in groups, ignore scatter charts */
            if (optgroups[view.public]) {
                optgroups[view.public].push(view);
            }
        });

        $('<option/>').appendTo(el);

        for (i=0; i<=2; i++) {
            l = optgroups[i].length;
            if (!l) {
                continue;
            }

            var o = $('<optgroup/>').prop('label', labels[i]);
            for (j=0; j<l; j++) {
                $('<option/>').text(optgroups[i][j].name).val(optgroups[i][j].slug).appendTo(o);
            }
            o.appendTo(el);
        }
        if (selected) {
            el.val(selected);
        }
        el.trigger('change');
    };

    this.load = function (slug, collapse) {
        if (typeof this.views[slug] == 'undefined') {
            return;
        }
        if (arguments.length < 2) {
            collapse = false;
        }

        $.getJSON(
        PVLngAPI + 'view/'+slug+'.json',
        function (data) {

            var expanded = tree.expanded;
            if (!expanded) {
                tree.toggle(true);
            }

            views.views[slug].data = data;
            views.actual = views.views[slug];

            /* Uncheck all channels and ... */
            $('input.channel').iCheck('uncheck').val('');
            $('tr.channel').removeClass('checked');
            /* ... re-check all channels in view */
            $.each(views.actual.data, function (id, p) {
                if (id == 'p') {
                    views.preset = p;
                } else {
                    $('#c'+id).val(p).iCheck('check');
                }
            });

            /* Re-arrange channels in collapsed tree */
            if (collapse || !expanded) {
                tree.toggle(false);
            }

            $('#load-delete-view').val(views.actual.slug).trigger('change');
            $('#saveview').val(views.actual.name);
            $('#visibility').val(views.actual.public).trigger('change');
            $('#modified').hide();
            $('#preset').val(views.preset).trigger('change'); /* Reloads chart */
        }
        ).fail(function ( jqXHR, textStatus ) {
            alert( "Request failed: " + textStatus );
        });
    };
};

/**
 *
 */
var tree = new function Tree() {

    this.expanded = true;

    this.toggle = function (force) {
        this.expanded = (typeof force != 'undefined') ? force : !this.expanded;

        /* Redraw to react on this.expanded */
        oTable.fnDraw();

        $('span.indenter').toggle(this.expanded);
        if (this.expanded) {
            $('#treetoggle').prop('src','/images/ico/toggle.png').prop('alt','[-]');
            $('#tiptoggle').html('{{CollapseAll}} (F4)');
        } else {
            $('#treetoggle').prop('src','/images/ico/toggle_expand.png').prop('alt','[+]');
            $('#tiptoggle').html('{{ExpandAll}} (F4)');
        }
    }
};

tree.expanded = !!user;

/**
 *
 */
function TimeStrToSec(str, _default) {
    if (typeof str == 'undefined' || str == '') {
        str = _default;
    }
    /* Split into hours and minutes */
    var time = ((new String(str)).trim()+':0').split(':', 2);
    return time[0] * 3600 + time[1] * 60;
}

function SecToTimeStr(s) {
    var h = Math.floor(s/60/60), m = Math.floor((s - h*60*60)/60);
    /* Make hours and minutes 2 characters long */
    return '0'.concat(h).slice(-2) + ':' + '0'.concat(m).slice(-2);
}

/**
 *
 */
function ChartDialog(id) {

    $('#scatter-candidate').hide();

    /* Get stringified settings */
    var p = $('#c'+id).val();

    if (p == '' || p == 'on') {
        /* Initial, not checked or no presetaion set yet */
        p = new presentation();
        /* Suggest scatter for channels without unit  or non-numeric */
        if (!channels[id].unit || !channels[id].n) {
            $('#scatter-candidate').show();
            /* Propose type Scatter and ... */
            p.type = 'scatter';
            /* ... show all values */
            p.all = true;
        }
    } else {
        /* Init presetation */
        p = new presentation(p);
    }

    /* Set dialog properties */
    /* Find the radio button with the axis value and check it */
    $('input[name="d-axis"][value="' + p.axis + '"]').prop('checked', true);
    $('#d-type').val(p.type);
    $('#d-cons').prop('checked', p.consumption);
    /* Find the radio button with the line width and check it */
    $('input[name="d-width"][value="' + p.width + '"]').prop('checked', true);
    $('#d-min').prop('checked', p.min);
    $('#d-max').prop('checked', p.max);
    $('#d-last').prop('checked', p.last);
    $('#d-all').prop('checked', p.all);
    $('#d-style').val(p.style);
    $('#d-color').val(p.color).spectrum('set', p.color);
    /* Different colors above/below threshold */
    $('input:radio[name="color-pos-neg"][value="'+p.colorusediff+'"]').prop('checked', true);
    $('#d-color-diff').val(p.colordiff).spectrum('set', p.colordiff);
    $('#d-color-threshold').val(p.threshold);
    /* Display times in chart */
    $('#d-time1').val(p.time1);
    $('#d-time2').val(p.time2);
    $('#d-daylight').prop('checked', p.daylight);
    $('#d-daylight-grace').val(p.daylight_grace);
    $('#d-time-slider').slider('values', [ TimeStrToSec(p.time1), TimeStrToSec(p.time2) ]);
    $('#d-legend').prop('checked', p.legend);
    $('#d-hidden').prop('checked', p.hidden);
    $('#d-position').text(p.position);
    $('#d-position-slider').slider('value', p.position);
    $('#d-outline').prop('checked', p.outline);
    $('#d-stack').val(p.stack);

    /* Update only in context of dialog chart */
    $('input.iCheck', '#dialog-chart').iCheck('update').trigger('ifToggled');
    $('select', '#dialog-chart').trigger('change');

    /* Set the id into the dialog for onClose to write data back */
    $('#dialog-chart').data('id', id).dialog('option', 'title', channels[id].name).dialog('open');
}

/**
 *
 */
function updateChart(force) {

    clearTimeout(updateTimeout);
    updateTimeout = null;

    if (!force && (updateActive || !windowVisible)) {
        return;
    }

    updateActive = true;

    var fromDate = $('#fromdate').val(),
    toDate = $('#todate').val(),
    period_count = +$('#periodcnt').val(),
    period = $('#period').val(),
    ts = (new Date).getTime(),
    channels_new = [], yAxisMap = [], yAxis = [],
    channel, channel_clone, buffer = [],
    expanded = tree.expanded,
    stacked = false;

    /* If any outstanding AJAX reqeust was killed, force rebuild of chart */
    if ($.ajaxQ.abortAll() != 0) {
        force = true;
    }

    if (user && views.actual) {
        /* Provide permanent link only for logged in user and not embedded view level 2 */
        var from = $('#from').val(), to = $('#to').val(),
        date = (from == to)
             ? 'date=' + fromDate
             : 'from=' + fromDate + '&to=' + toDate;

        $('#btn-bookmark')
        .button({ disabled: (views.actual.slug == '') })
        .prop('href', '/chart/' + views.actual.slug);

        $('#btn-permanent')
        .button({ disabled: (views.actual.slug == '') })
        .prop('href', '/chart/' + views.actual.slug + encodeURI('?' + date));
    }

    /* Show all rows to reset consumption and cost columns */
    if (!expanded) {
        tree.toggle(true);
    }

    /* Reset consumption and costs data */
    $('.minmax, .consumption, .costs, #costs').html('');

    /* Re-collapse if needed */
    if (!expanded) {
        tree.toggle(false);
    }

    /* find active channels, map and sort axis */
    $('input.channel:checked').each(function (id, el) {
        var ch = channels[$(el).data('id')],
        channel = new presentation($(el).val());

        channel._id = ch.id;

        /* http://stackoverflow.com/a/15710692 */
        channel._hash = JSON.stringify(channel).split('').reduce(function (a,b) {
            a=((a<<5)-a)+b.charCodeAt(0);
            return a&a
        }, 0);

        channel.name     = $('<div/>').html(ch.name).text();
        channel.guid     = ch.guid;
        channel.unit     = ch.unit;
        channel.time1    = TimeStrToSec(channel.time1,  0);
        channel.time2    = TimeStrToSec(channel.time2, 24);
        channel.linkedTo = null;
        /* Remember channel in correct order */
        buffer.push(channel);
        /* Channel axis still registered? */
        if (yAxisMap.indexOf(channel.axis) == -1) {
            yAxisMap.push(channel.axis);
        }
    });

    /* Sort channels */
    buffer.sort(function (a, b) {
        return (a.position - b.position) /* Causes an array to be sorted numerically and ascending */
    });

    /* Sort axis to make correct order for Highcharts */
    yAxisMap.sort();

    /* Build channels */
    $(buffer).each(function (id, channel) {
        channel.id     = 10*id;
        channel.zIndex = 10*id;
        /* Remember original axis for change detection */
        channel.axis_org = channel.axis;
        /* Axis from chart point of view */
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
                /* ... add 2nd spline channel behind! */
                channel_clone = $.extend({}, channel);
                channel_clone.id -= 1;
                channel_clone.linkedTo = ':previous';
                channel_clone.type = 'spline';
                channel_clone.zIndex -= 1;
                channels_new.push(channel_clone);
            }
        } else {
            channels_new.push(channel);
        }

            /* Prepare axis */
        if (!yAxis[channel.axis]) {
            yAxis[channel.axis] = {
                lineColor: channel.color,
                minPadding: 0,
                /* Axis on right side */
                opposite: !(channel.axis_org % 2),
                showEmpty: false
            };

            /* Only 1st left axis shows grid lines */
            if (channel.axis != 0) {
                yAxis[channel.axis].gridLineWidth = 0;
            }
        }

            /* Use 1st non-empty channel unit as axis title */
        if (!yAxis[channel.axis].title && channel.unit) {
            yAxis[channel.axis].title = { text: channel.unit };
        }

        if (channel.type == 'bar') {
            stacked = stacked || channel.stack;
            /* If channel have no stack, set to unique pseudo stack */
            if (!channel.stack) {
                channel.stack = pvlng.guid('stack');
            }
        }
    });

        /* Any channels checked for drawing? */
    if (channels_new.length == 0) {
        updateActive = false;
        return;
    }

    $.wait();

    pvlng.log('Channels', channels_new);
    pvlng.log('yAxis', yAxis);

    /* Check for changed channels */
    var changed = false;

    if (force || channels_new.length != channels_chart.length) {
        changed = true;
    } else {
        for (var i=0, l=channels_new.length; i<l; i++) {
            if (channels_new[i]._hash != channels_chart[i]._hash) {
                changed = true;
                break;
            }
        }
    }

    if (changed) {
        Highcharts.setOptions({
            global: {
                /* timezone offset in minutes */
                timezoneOffset: -tzOffset / 60
            }
            });

            /* Happens also on 1st call! */
            chartOptions.yAxis = yAxis;
            chartOptions.exporting = { filename: views.actual.slug };

            chartOptions.plotOptions.bar.stacking = stacked ? 'normal' : null;

            /* (Re)Create chart */
            $('#'+chartOptions.chart.renderTo).css('height', ChartHeight).show();
            chart = new Highcharts.Chart(chartOptions);
            $('#chart-wrapper').addClass('chart-loaded');
            /* Help chart with fluid layout to find its correct size */
            chart.reflow();
            /* Show splitter */
            $('.ui-resizable-handle', '#chart-wrapper').show();
            /* Show zoom and pan help */
            $('#zoom-hint').show();

            channels_chart = channels_new;
    }

    setTimeout(function () {
        chart.showLoading(chartLoading) }, 0);

    /* Scroll to navigation as top most visible element */
    pvlng.scroll('#nav');

    var f = $('#from').val(), t = $('#to').val();

    if (f != t) {
        f += ' - ' + t;
    }

    chart.setTitle({ text: $('<div/>').html(views.actual.name).text() }, { text: f });

    var series = [],
    costs = 0,
    date = new Date(),
    today = ('0'+(date.getMonth()+1)).substr(-2) + '/' +
        ('0'+date.getDate()).substr(-2) + '/' +
        date.getFullYear(),
    deferred = [];

    /* Build deferred array to get data */
    $(channels_chart).each(function (id, channel) {

        var url = PVLngAPI + 'data/' + channel.guid + '.json', start, end;

        pvlng.log('Fetch', channel.name, url);

        if (channel.daylight && today == fromDate && today == toDate) {
            /* Only today */
            start = 'sunrise;' + channel.daylight_grace;
            end   = 'sunset;'  + channel.daylight_grace;
        } else {
            start = fromDate;
            end   = toDate + '+1day';
        }

            deferred.push(
            $.getJSON(url, {
                attributes: true,
                full:       true,
                start:      start,
                end:        end,
                period:     (channel.type != 'scatter') ? period_count + period : '',
                _canAbort:  true,
                _ts:        date.getTime() /* Force fresh fetch */
                })
        );
    });

    console.time('Fetch data');

    /* Handle resoved deferred */
    $.when.apply($, deferred).done(function () {

        if (aborted) {
            return;
        }

        if (channels_chart.length <= 1) {
            arguments = [ arguments ];
        }

        var data, textStatus, jqXHR, channel, t;

        for (var arg = 0; arg < arguments.length; arg++) {
            /* Split argument */
            data       = arguments[arg][0];
            textStatus = arguments[arg][1];
            jqXHR      = arguments[arg][2];
            channel = channels_chart[arg];

            if (textStatus == 'abort') {
                /* Aborted during loading */
                aborted = true;
                return;
            } else if (jqXHR.status >= 400) {
                console.error(jqXHR);
/*
                $.pnotify({
                    type: textStatus,
                    text: error + "\n" + (jqXHR.responseJSON ? jqXHR.responseJSON.message : jqXHR.responseText),
                    hide: false
                });
*/
                /* Set pseudo channel */
                series[channel.id] = {};
                return;
            }

            try {
                /* Pop out 1st row with attributes */
                attr = data.shift();
            } catch (err) {
                console.error(data);
                return;
            }

            pvlng.log('Attributes', attr);
            pvlng.log('Data', data);

            if (attr.consumption) {
                $('#cons'+channel._id).html(Highcharts.numberFormat(attr.consumption, attr.decimals));
            }

            if (attr.costs) {
                costs += +attr.costs.toFixed(CurrencyDecimals);
                $('#costs'+channel._id).html(CurrencyFormat.replace('{}', Highcharts.numberFormat(attr.costs, CurrencyDecimals)));
            }

            /* Add channel description if chart name NOT still contains it */
            t = (views.actual.name.toLowerCase().indexOf(attr.description.toLowerCase()) == -1)
              ? attr.name + ' (' + attr.description + ')'
              : attr.name;

            var serie = {
                data:           [],
                color:          channel.color,
                id:             channel.id,
                legendColor:    channel.color, /* Force legend color! */
                linkedTo:       channel.linkedTo,
                name:           $('<div/>').html(t).text(), /* HTML decode channel name */
                showInLegend:   channel.legend,
                stack:          channel.stack,
                type:           channel.type,
                visible:        !channel.hidden,
                yAxis:          channel.axis,
                zIndex:         channel.zIndex,
                /* Own properties */
                colorDiff:      channel.colorusediff,
                decimals:       attr.decimals,
                guid:           channel.guid,
                unit:           attr.unit,
                raw:            (period == '')
            };

            if (channel.colorusediff !== 0) {
                if (channel.colorusediff === 1) {
                    /* Color for values above threshold > switch colors! */
                    serie.color         = channel.colordiff;
                    serie.negativeColor = channel.color;
                } else /* -1 */ {
                    /* Color for values below threshold */
                    serie.negativeColor = channel.colordiff;
                }
                serie.threshold = channel.threshold || 0;
            }

            serie.tooltip = { valueSuffix: attr.unit ? attr.unit : '' };

            if (channel.type == 'scatter') {
                if (attr.marker) {
                    serie.marker = { symbol: 'url('+attr.marker+')' };
                }
                serie.dataLabels = {
                    enabled: true,
                    formatter: function () {
                        /* Switch for non-numeric / numeric channels */
                        return typeof this.point.name != 'undefined' ? this.point.name : this.point.y;
                    }
                };
                if (attr.unit.trim() == '') {
                    /* Mostly non-numeric channels */
                    serie.dataLabels.align = 'left';
                    serie.dataLabels.rotation = 270;
                    serie.dataLabels.style = { textShadow: 0 };
                    /* Move a bit */
                    serie.dataLabels.x = chart.options.common.scatter.x;
                    serie.dataLabels.y = chart.options.common.scatter.y;
                }
            } else if (channel.type != 'bar') {
                if (channel.style != 'Solid') {
                    serie.dashStyle = channel.style;
                }
                serie.lineWidth = channel.width;
            }

            if (channel.outline) {
                serie.shadow = {
                    color: chart.options.common.outline.color,
                    offsetX: 0,
                    offsetY: 0,
                    opacity: chart.options.common.outline.opacity,
                    width: serie.lineWidth + 2*chart.options.common.outline.width
                };
            }

            /* Analyse data */
            $(data).each(function (id, row) {
                var point = { x: row.timestamp * 1000 };

                /* Check time range channels, only if not full day 00:00 .. 24:00 */
                if (channel.time2-channel.time1 < 86400 && fromDate == toDate) {
                    /* Get todays seconds from timestamp */
                    date.setTime(row.timestamp * 1000);
                    var time = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
                    /* Skip data outside display time range */
                    if (time < channel.time1 || time > channel.time2) {
                        return;
                    }
                }

                if ($.isNumeric(row.data)) {
                    if (channel.type == 'areasplinerange') {
                        point.low  = row.min;
                        point.high = row.max;
                    } else {
                        if (!channel.all) {
                            point.y = channel.consumption ? row.consumption : row.data;
                        } else {
                            /* Format data label */
                            point.y = channel.consumption ? row.consumption : row.data;
                            point.dataLabels = { enabled: true };
                        }
                    }
                } else {
                    point.y = 0;
                    var n = (row.data+'|').split('|');
                    point.name = channel.all ? n[0] : '';
                    if (n[1]) {
                        /* Own marker symbol */
                        point.marker = { symbol: 'url('+n[1]+')' };
                    }
                }

                serie.data.push(point);
            });

            pvlng.log('Serie', serie);

            if (!channel.all && (channel.min || channel.max || channel.last)) {
                        serie = setMinMax(serie, channel);
            }

            if (!changed) {
                        var s = chart.get(serie.id);
                        /* Replace data direct in existing chart data */
                        s.setData(serie.data, false);
                        /* Do we have raw data? Only then deletion of reading value is possible */
                        s.options.raw = (period == '');
            } else {
                        series[serie.id] = serie;
            }

            $('#cons'+channel._id).prop('title', 'loaded in ' + ((new Date).getTime() - channel._ts) + ' ms').tipTip();

            $('#costs').html(costs ? CurrencyFormat.replace('{}', Highcharts.numberFormat(costs, CurrencyDecimals)) : '');
        }

    }).always(function (data, status) {

        updateActive = false;

        if (aborted) {
            chart.hideLoading();
            $.wait(false);
            return;
        }

        if (!isEmbedded && notifyLoadAll) {
            $.pnotify({
                type: 'success',
                text: channels_chart.length + ' {{ChannelsLoaded}} ' +
                  '(' + (((new Date).getTime() - ts)/1000).toFixed(1) + 's)'
            });
        }

        if (changed) {
            /* Remove all existing series */
            for (var i=chart.series.length-1; i>=0; i--) {
                chart.series[i].remove(false);
            }
            /* Add new series */
            $.each(series, function (i, serie) {
                /* Valid channel with id */
                if (serie) {
                    chart.addSeries(serie, false);
                }
            });
        }

        if ($('#cb-autorefresh').is(':checked') && RefreshTimeout > 0) {
            updateTimeout = setTimeout(updateChart, RefreshTimeout*1000);
        }

        chart.redraw();
        chart.hideLoading();
        $.wait(false);

        console.timeEnd('Fetch data');
    });
}

/**
 * Idea from http://stackoverflow.com/a/11612641
 */
$.ajaxQ = (function () {

    var id = 0, queue = {};

    $(document).ajaxSend(function (e, jqXHR, settings) {
        if (settings.url.indexOf('_canAbort') != -1) {
            /* Queue only channel data requests! */
            jqXHR._id = ++id;
            queue[jqXHR._id] = jqXHR;
        }
    });

    $(document).ajaxComplete(function (e, jqXHR) {
        delete queue[jqXHR._id];
    });

    return {
        abortAll: function () {
            var cnt = 0;
            $.each(queue, function (i, jqXHR) {
                jqXHR.abort();
                cnt++;
            });
            if (cnt) {
                aborted = true;
            }
            return cnt;
        }
    };

})();

/**
 *
 */
function updateOutput() {
    updateActive = false;
    updateChart(true);
}

/**
 *
 */
$(function () {

    pvlng.onFinished.add( function () {
        $('#tabs').on('tabsactivate', function (e, ui) {
            /* Scroll to tabs as top most visible element */
            if (ui.newPanel.length && ui.newPanel.prop('id') == 'tabs-1') {
                pvlng.scroll('#tabs');
            }
        });
        $('#tabs').on('tabsbeforeactivate', function (e, ui) {
            if (ui.newTab.data('action') == 'reset') {
                $('#'+chartOptions.chart.renderTo).hide();
                /* Uncheck all channels and ... */
                $('input.channel').iCheck('uncheck').val('');
                $('tr.channel').removeClass('checked');
                /* Clear chart select and input */
                views.actual.name = '';
                $('#load-delete-view').val('').trigger('change');
                $('#saveview').val('');
                $('#visibility').val(0);
                tree.toggle(true);
                if (chart) {
                    chart.destroy();
                    $('#zoom-hint, #modified').hide();
                }
                /* Show channels tab */
                $('.ui-tabs').tabs('option', 'active', 0);
                return false;
            }
        });
    });

    /**
     * Modify legend color for pos./neg. splitted series
     * Idea from
     * http://highcharts.uservoice.com/forums/55896-general/suggestions/4575779-make-the-legend-icon-colors-modifiable
     * http://jsfiddle.net/stephanevanraes/CZSzT/
     */
    Highcharts.wrap(Highcharts.Legend.prototype, 'colorizeItem', function (item) {
        /**
     * Switch color for a legend item
     * Digg into Highcharts code, you can find the property "legendColor" is used BEFORE "color",
     * but never defined by Highcharts itself before...
     */
        arguments[1].legendColor = arguments[1].options.legendColor;
        /* Render legend item via wrapped function */
        item.apply(this, [].slice.call(arguments, 1));
    });

    $.fn.dataTableExt.afnFiltering.push(
        function ( oSettings, aData, iDataIndex ) {
            return tree.expanded ? true : $(oTable.fnGetNodes()[iDataIndex]).hasClass('checked');
        }
    );

    var h = pvlng.cookie.get('ChartHeight');

    if (!isEmbedded && h) {
        ChartHeight = h;
    }

    /**
     * Highcharts localization defaults
     */
    Highcharts.setOptions({
        lang: {
            thousandsSep: '{TSEP}',
            decimalPoint: '{DSEP}',
            resetZoom: '{{resetZoom}}',
            resetZoomTitle: '{{resetZoomTitle}}'
        }
        });

    /**
     *
     */
    oTable = $('#data-table').DataTable({
        bSort: false,
        bFilter: true,        /* Allow filter by coding, but   */
        sDom: '<"H"r>t<"F">', /* remove filter input from DOM. */
        bAutoWidth: false,
        aoColumnDefs: user
        ? [ { sWidth: '1%', aTargets: [ 0, 2, 3, 4, 5 ] } ]
        : [ { sWidth: '1%', aTargets: [ 1, 2 ] } ]
    });

    if (user) {
        $('.treeTable').treetable({
            initialState: 'expanded',
            indent: 24,
            column: 1
        });
        $('.chartdialog').addClass('clickable').click(function () {
                ChartDialog($(this).parents('tr').data('tt-id'));
        });

        $('.showlist').each(function () {
                $(this).wrap('<a></a>').parent()
                .prop('href', '/list/' + channels[$(this).parents('tr').data('tt-id')].guid);
        });

        $('.editentity').each(function () {
            /* For "Open link in new tab" ... */
            $(this)
                .wrap('<a></a>')
                .parent()
                .prop('href', '/channels/edit/' + channels[$(this).parents('tr').data('tt-id')].entity);
        }).click(function (e) {
            e.preventDefault();
            window.location.href =
                '/channels/edit/' + channels[$(this).parents('tr').data('tt-id')].entity +
                '?returnto=' + (views.actual.slug ? '/chart/' + views.actual.slug : '/');
        });

        /* Checkbox for chart auto refresh */
        var cb_refresh =
            $('#cb-autorefresh')
                .prop('checked', !(lscache.get('chart-autorefresh') === false))
                .iCheck({ checkboxClass: 'icheckbox_flat' })
                .on('ifToggled', function (e) {
                    /* Remember current state */
                    lscache.set('chart-autorefresh', $(this).is(':checked'))
                })
                /* Put the hint onto parent div injected by iCheck around the checkbox */
                .parent().prop('title', '{{ChartAutoRefresh}}').tipTip();
    }

    /**
     *
     */
    $("#d-table > tbody > tr").each(function (id, tr) {
        $(tr).addClass(id % 2 ? 'even' : 'odd');
    });

    /**
     *
     */
    $("#dialog-chart").dialog({
        autoOpen: false,
        width: 750,
        modal: true,
        buttons: {
            '{{Ok}}': function () {
                $(this).dialog('close');
                var chk = $('#c'+$(this).data('id')),
                old = chk.val(),
                p = new presentation();
                p.axis = +$('input[name="d-axis"]:checked').val();
                p.type = $('#d-type').val();
                p.consumption = $('#d-cons').is(':checked');
                p.style = $('#d-style').val();
                p.width = +$('input[name="d-width"]:checked').val();
                p.min = $('#d-min').is(':checked');
                p.max = $('#d-max').is(':checked');
                p.last = $('#d-last').is(':checked');
                p.all = $('#d-all').is(':checked');
                p.color = $('#d-color').spectrum('get').toHexString();
                p.colorusediff = +$('input:radio[name="color-pos-neg"]:checked').val();
                p.colordiff = $('#d-color-diff').spectrum('get').toHexString();
                p.threshold = +$('#d-color-threshold').val().replace(',', '.');
                p.legend = $('#d-legend').is(':checked');
                p.hidden = $('#d-hidden').is(':checked');
                p.position = +$('#d-position').text();
                p.outline = $('#d-outline').is(':checked');
                p.stack = p.type == 'bar' ? $('#d-stack').val() : '';

                p.time1 = SecToTimeStr(TimeStrToSec($('#d-time1').val(), 0));
                p.time2 = SecToTimeStr(TimeStrToSec($('#d-time2').val(), 24));
                p.daylight = $('#d-daylight').is(':checked');
                p.daylight_grace = +$('#d-daylight-grace').val();

                p = p.toString();

                if (p != old) {
                    chk.val(p);
                    $('#modified').show();
                }
            },
            '{{Cancel}}': function () {
                $(this).dialog('close');
            }
        }
    });

    $('.spectrum').spectrum({
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
        showButtons: false,
        preferredFormat: 'hex',
        hide: function (color) {
            color.toHexString();
        }
    });

    /**
     *
     */
    $('#d-type').change(function () {
        var onlyBar = $('.only-bar'),
        notBar = $('.not-bar'),
        notScatter = $('.not-scatter');

        /* Reset all */
        notBar.show();
        notBar.find('input, select').prop('disabled', false);
        onlyBar.hide();

        notScatter.show();
        notScatter.find('input, select').prop('disabled', false);

        /* Disable all invalid options for given type */
        if (this.value == 'bar') {
            onlyBar.show();
            notBar.hide();
            notBar.find('input[type="checkbox"]').prop('checked', false);
            notBar.find('input, select').prop('disabled', true);
            /* Set different color flag no none */
            $('#d-color-use-diff').prop('checked', true);
        } else if (this.value == 'scatter') {
            notScatter.hide();
            notScatter.find('input[type="checkbox"]').prop('checked', false);
            notScatter.find('input, select').prop('disabled', true);
            /* Set different color flag no none */
            $('#d-color-use-diff').prop('checked', true);
        }
        $('input').iCheck('update');
    });

    $('#d-color-use-diff').on('ifToggled', function (e) {
        var checked = $(this).is(':checked');
        $('#d-color-threshold').prop('disabled', checked).spinner('option', 'disabled', checked);
        $('#d-color-diff').spectrum(checked ? 'disable' : 'enable');
    });

    $('#d-time-slider').slider({
        range: true,
        min: 0, /* 00:00 */ max: 86400, /* 24:00 */
        values: [ 0, 86400 ], /* 00:00 - 24:00 */
        slide: function ( e, ui ) {
            /* Simulate hour stepping, but allow fine grained set from input */
            var step = 3600;
            /* Calc hour and minutes parts */
            $('#d-time1').val(SecToTimeStr(Math.floor(ui.values[0]/step)*step));
            $('#d-time2').val(SecToTimeStr(Math.floor(ui.values[1]/step)*step));
        }
    });

    $('#d-position-slider').slider({
        min: -100, max: 100,
        slide: function ( e, ui ) {
            $('#d-position').text(ui.value);
        }
    });

    $('#d-position-slider .ui-slider-handle')
        /* Style slider handle to acceppt position text */
        .css({ width: '2em', marginLeft: '-1em', textDecoration: 'none', textAlign: 'center' })
        /* Insert separate span to style text */
        .append($('<span/>').prop('id', 'd-position').css({ fontSize: 'xx-small', color: 'gray' }));

    $('#d-daylight').on('ifToggled', function (e) {
        var checked = !$(this).is(':checked');
        $('#d-daylight-grace').prop('disabled', checked).spinner('option', 'disabled', checked);
    });

    $('input.iCheck').iCheck('update');

    $('input.channel').on('ifToggled', function () {
        $('#r'+this.id).toggleClass('checked', this.checked);
        $('#modified').show();
    });

    $('#btn-refresh').button({
        icons: { primary: 'ui-icon-refresh' }, text: false
    }).click(function (event) {
        event.preventDefault();
        updateChart(event.shiftKey);
    });

    $('#btn-bookmark, #btn-permanent').button();

    $('#treetoggle').click(function () {
        tree.toggle()
    });

    $('#btn-load').on('click', function (event) {
        $.wait();
        $(this).button('disable');
        if (event.shiftKey) {
            /* Shift-Click sets display date to today AND reloads chart */
            $('#btn-reset').trigger('click');
        } else {
            views.load($('#load-delete-view option:selected').val(), true);
        }
        $(this).button('enable');
    });

    /* Remeber button label */
    $('#btn-delete').data('label', $('#btn-delete').button('option', 'label'));

    $('#btn-delete').on('click', function (event) {
        var option = $('#load-delete-view option:selected'), btn = $(this);

        if (option.val() == '') {
            return;
        }

        if (!btn.hasClass('confirmed')) {
            btn.button({ label: '{{AreYouSure}}' }).addClass('confirmed');
            setTimeout(
                function () {
                    $('#btn-delete')
                        .button({ label: $('#btn-delete').data('label') })
                        .removeClass('confirmed');
                },
                5000
            );
            return;
        }

        $.wait();

        btn.removeClass('confirmed')
           .button({ label: $('#btn-delete').data('label') })
           .button('disable');

        $.ajax({
            type: 'DELETE',
            dataType: 'json',
            url: PVLngAPI + '/view/'+option.val()+'.json'
        }).done(function (data, textStatus, jqXHR) {
            $.pnotify({ type: 'success', text: option.text() + ' {{deleted}}' });
            /* Just delete selected option and clear save name input */
            option.remove();
            $('#load-delete-view').val('').trigger('change');
            $('#saveview').val('');
        }).fail(function (jqXHR, textStatus, errorThrown) {
            $.pnotify({
                type: textStatus, hide: false,
                text: jqXHR.responseJSON.message ? jqXHR.responseJSON.message : jqXHR.responseText
            });
        }).always(function () {
            $.wait(false);
            btn.button('enable');
        });
    });

    $('#btn-save').on('click', function () {
        $(this).button('disable');
        $.wait();

        /* Save view */
        var btn = this,
        data = {
            name: $('#saveview').val(),
            data: { p: $('#preset').val() },
            public: $('#visibility option:selected').val()
        };

        $('input.channel:checked').each(function (id, el) {
            data.data[$(el).data('id')] = $(el).val();
        });

        $.ajax({
            type: 'PUT',
            dataType: 'json',
            url: PVLngAPI + '/view.json',
            contentType: 'application/json',
            processData: false, /* Send prepared JSON in body */
            data: JSON.stringify(data)
        }).done(function (data) {
            views.fetch(function (views) {
                /* Rebuild select */
                views.buildSelect('#load-delete-view', data.slug);
                views.load(data.slug);
                /* Adjust chart title */
                if (chart) {
                    chart.setTitle(views.actual.name);
                }
            });
            $('#modified').hide();
            $.pnotify({ type: 'success', text: data.name + ' saved' });
        }).fail(function (jqXHR, textStatus, errorThrown) {
            $.pnotify({
                type: textStatus, hide: false, text: jqXHR.responseText
            });
        }).always(function () {
            $.wait(false);
            $(btn).button('enable');
        });
    });

    views.fetch(function (views) {
        views.buildSelect('#load-delete-view');
        if (!user) {
            $('#public-select').show();
            $('#wrapper').show();
        }
        /* Chart slug provided by URL?, load and collapse tree */
        if (!qs.chart) {
            $('#top-select').show();
        }
        views.load(qs.chart, true);
    });

    /* Bind click listener to all GUID images */
    $('#data-table tbody').on('click', '.guid', function () {
        $.alert(
            $('<input/>')
                .addClass('guid')
                .prop('readonly', 'readonly')
                .val($(this).data('guid'))
                /* Prepare to copy into clipboard ... */
                .click(function () {
                    this.select()
                }),
            '{{Channel}} GUID'
        );
    });

    /**
     * HTML5 Page Visibility API
     *
     * http://www.sitepoint.com/introduction-to-page-visibility-api/
     * http://www.w3.org/TR/page-visibility
     */
    if (typeof document.hidden != 'undefined') {
        browserPrefix = '';
    } else {
        var browserPrefixes = ['webkit', 'moz', 'ms', 'o'], l = browserPrefixes.length;
        /* Test all vendor prefixes */
        for (var i=0; i<l; i++) {
            if (typeof document[browserPrefixes[i] + 'Hidden'] != 'undefined') {
                browserPrefix = browserPrefixes[i];
                break;
            }
        }
    }

    if (browserPrefix !== null) {
        document.addEventListener(browserPrefix + 'visibilitychange', function () {
            if (document.hidden === false || document[browserPrefix + 'Hidden'] === false) {
                /* The page is in foreground and visible */
                windowVisible = true;
                /* Was longer in background, so the updateTimeout is not set anymore */
                if (!updateTimeout) {
                    /* Check if toDate in chart is today and not in the past */
                    var d = new Date(),
                    today = ('0'+(d.getMonth()+1)).slice(-2) + '/' +
                        ('0'+d.getDate()).slice(-2) + '/' +
                        d.getFullYear();
                    if ($('#cb-autorefresh').is(':checked') && $('#todate').val() >= today) {
                        setTimeout(updateChart, 1000);
                    }
                }
            } else {
                windowVisible = false;
            }
            return false;
        });
    }

    if (!isEmbedded) {
        $('#chart-wrapper').resizable({
            handles: 's',
            grid: 25,
            minHeight: 350,
            resize: function ( event, ui ) {
                if (chart) {
                    $('#chart').css('height', ui.size.height);
                    chart.reflow();
                }
            },
            stop: function ( event, ui ) {
                pvlng.cookie.set('ChartHeight', ChartHeight = ui.size.height, 365);
            }
        });
        $('.ui-resizable-handle', '#chart-wrapper').hide().append($('<div/>')).prop('title', '{{DragToResize}}').tipTip();
    }

    shortcut.add('Alt+P', function () {
        pvlng.changeDates(-1)
    });
    shortcut.add('Alt+N', function () {
        pvlng.changeDates(1)
    });
    shortcut.add('F6', function () {
        updateChart()
    });
    shortcut.add('F7', function () {
        updateChart(true)
    });

    if (user) {
        shortcut.add('F4', function () {
            tree.toggle()
        });
    }

});