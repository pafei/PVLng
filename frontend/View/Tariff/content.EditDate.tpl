<!--
/**
 *
 *
 * @author      Knut Kohl <github@knutkohl.de>
 * @copyright   2012-2014 Knut Kohl
 * @license     MIT License (MIT) http://opensource.org/licenses/MIT
 * @version     1.0.0
 */
-->

<form method="post">

<input type="hidden" name="id" value="{ID}" />
<input type="hidden" name="dateold" value="{DATE}" />

<h3>{NAME}</h3>

<!-- IF {COMMENT} --><p><small>{COMMENT}</small></p><!-- ENDIF -->

<p>
    <label for="date" class="autowidth">{{StartDate}}</label>
    <!-- Date input for date picker -->
    <input id="date" type="hidden" name="date" />
    <input id="date-dp" type="text" class="c" size="10" required="required" />
</p>

<p>
    <label for="cost" class="autowidth">{{FixCostDay}}</label>
    <input id="cost" type="text" class="r" name="cost" value="{COST}" size="10" placeholder="0{DSEP}00" /> {CURRENCYISO}
</p>

<h3>{{StartingTimes}}</h3>

<table id="table-times" class="datatable" style="display:none">
<thead>
<tr>
    <th></th>
    <th class="l nw">{{StartTime}}</th>
    <th class="l">{{WeekDays}}</th>
    <th class="l nw">{{Tariff}} [{CURRENCYISO}]</th>
    <th class="l">{{Comment}}</th>
</tr>
</thead>

<tbody>
<!-- BEGIN DATA -->
<tr data-id="{_LOOP}">
    <td>
        <img id="icon-{_LOOP}" class="row-delete tipbtn" title="{{ClickToDeleteRow}}" />
    </td>
    <td>
        <input id="time-{_LOOP}" class="time c" type="text" name="d[{_LOOP}][t]" value="{TIME}" size="8" maxlength="8" placeholder="00:00:00" />
    </td>
    <td>
        <input id="day-{_LOOP}-1" class="weekday weekday-{_LOOP} iCheck" type="checkbox" name="d[{_LOOP}][w][]"
               value="1" <!-- IF {D1} -->checked="checked"<!-- ENDIF --> />
        <label for="day-{_LOOP}-1">{{day2::1}}</label>
        <input id="day-{_LOOP}-2" class="weekday weekday-{_LOOP} iCheck" type="checkbox" name="d[{_LOOP}][w][]" style="margin-left:1em"
               value="2" <!-- IF {D2} -->checked="checked"<!-- ENDIF --> />
        <label for="day-{_LOOP}-2">{{day2::2}}</label>
        <input id="day-{_LOOP}-3" class="weekday weekday-{_LOOP} iCheck" type="checkbox" name="d[{_LOOP}][w][]" style="margin-left:1em"
               value="3" <!-- IF {D3} -->checked="checked"<!-- ENDIF --> />
        <label for="day-{_LOOP}-3">{{day2::3}}</label>
        <input id="day-{_LOOP}-4" class="weekday weekday-{_LOOP} iCheck" type="checkbox" name="d[{_LOOP}][w][]" style="margin-left:1em"
               value="4" <!-- IF {D4} -->checked="checked"<!-- ENDIF --> />
        <label for="day-{_LOOP}-4">{{day2::4}}</label>
        <input id="day-{_LOOP}-5" class="weekday weekday-{_LOOP} iCheck" type="checkbox" name="d[{_LOOP}][w][]" style="margin-left:1em"
               value="5" <!-- IF {D5} -->checked="checked"<!-- ENDIF --> />
        <label for="day-{_LOOP}-5">{{day2::5}}</label>
        <input id="day-{_LOOP}-6" class="weekday weekday-{_LOOP} iCheck" type="checkbox" name="d[{_LOOP}][w][]" style="margin-left:1em"
               value="6" <!-- IF {D6} -->checked="checked"<!-- ENDIF --> />
        <label for="day-{_LOOP}-6" class="b">{{day2::6}}</label>
        <input id="day-{_LOOP}-7" class="weekday weekday-{_LOOP} iCheck" type="checkbox" name="d[{_LOOP}][w][]" style="margin-left:1em"
               value="7" <!-- IF {D7} -->checked="checked"<!-- ENDIF --> />
        <label for="day-{_LOOP}-7" class="b">{{day2::0}}</label>
    </td>
    <td>
        <input id="price-{_LOOP}" type="text" name="d[{_LOOP}][p]" value="{TARIFF}" class="price r" size="8" placeholder="0{__DSEP}0000" />
    </td>
    <td>
        <input id="comment-{_LOOP}" type="text" name="d[{_LOOP}][c]" value="{COMMENT}" size="30" />
    </td>
</tr>
<!-- END -->
</tbody>

<tfoot>
<tr>
    <th colspan="5" class="l s" style="padding-top:5px;padding-bottom:5px">
        <img src="/images/ico/exclamation-circle.png" style="margin-right:16px" width="16" height="16" alt="!"/>
        {{TimeDaysTariffRequired}}
    </th>
</tr>
</tfoot>

</table>

<p><input type="submit" value="{{Save}}" /></p>

</form>
