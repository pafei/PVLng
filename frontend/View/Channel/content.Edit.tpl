<!--
/**
 *
 *
 * @author      Knut Kohl <github@knutkohl.de>
 * @copyright   2012-2013 Knut Kohl
 * @license     GNU General Public License http://www.gnu.org/licenses/gpl.txt
 * @version     1.0.0
 */
-->

<div class="grid_10">

<h3><img src="{ICON}" alt="" />&nbsp;<strong>{TYPENAME}</strong></h3>

<!-- IF {TYPEHELP} -->
<p>
    <strong><img src="/images/ico/exclamation-circle.png"
        style="width:16px;height:16px;margin-right:8px" width="16" height="16" alt="!"/></strong>
    <em>{TYPEHELP}</em>
</p>
<!-- ENDIF -->

<form action="/channel/edit" method="post">

<input type="hidden" name="c[id]" value="{ID}" />
<input type="hidden" name="c[type]" value="{TYPE}" />
<!-- BEGIN FIELDS --><!-- IF !{VISIBLE} AND {VALUE} != "" -->
<!-- Store also invisible fields, because they can have
     non-default values from model in add mode. -->
<input type="hidden" name="c[{FIELD}]" value="{VALUE}" />
<!-- ENDIF --><!-- END -->

<table id="dataTable" class="dataTable">
    <thead>
    <tr>
        <th style="width:20%">{{channel::Param}}</th>
        <th style="width:40%">{{channel::Value}}</th>
        <th style="width:40%">{{channel::Help}}</th>
    </tr>
    </thead>

    <tbody>
    <!-- BEGIN FIELDS -->

    <!-- IF {VISIBLE} -->
    <tr <!-- IF {ERROR} -->style="background-color:#FFE0E0;border-top:solid 1px white;border-bottom:solid 1px white"<!-- ENDIF -->>
        <td style="vertical-align:top;padding-top:.75em">
            <label for="{FIELD}">{NAME}</label>
            <!-- IF {REQUIRED} -->
                <img style="width:16px;height:16px" width="16" height="16"
                    src="/images/required.gif" alt="*" />
            <!-- ENDIF -->
        </td>
        <td style="vertical-align:top;padding-top:.5em;padding-bottom:.5em">
            <!-- IF {TYPE} == "numeric" -->
                <input type="text" id="{FIELD}" name="c[{FIELD}]" value="{VALUE}" size="10"
                       <!-- IF {REQUIRED} --> required="required"<!-- ENDIF -->
                       <!-- IF {READONLY} --> class="ro" readonly="readonly"<!-- ENDIF -->
                />
            <!-- ELSEIF {TYPE} == "integer" -->
                <input type="number" id="{FIELD}" name="c[{FIELD}]" value="{VALUE}" size="10" step="1"
                       <!-- IF {REQUIRED} --> required="required"<!-- ENDIF -->
                       <!-- IF {READONLY} --> class="ro" readonly="readonly"<!-- ENDIF -->
                />
            <!-- ELSEIF {TYPE} == "select" -->
                <select id="{FIELD}" name="c[{FIELD}]" <!-- IF {READONLY} --> class="ro" readonly="readonly"<!-- ENDIF -->>
                    <!-- BEGIN OPTIONS -->
                    <option value="{VALUE}" <!-- IF {SELECTED} -->selected="selected"<!-- ENDIF -->>{OPTION}</option>
                    <!-- END -->
                </select>
            <!-- ELSEIF {TYPE} == "textarea" -->
                <textarea id="{FIELD}" name="c[{FIELD}]" style="width:98%" rows="4"
                          <!-- IF {REQUIRED} --> required="required"<!-- ENDIF -->
                          <!-- IF {READONLY} --> class="ro" readonly="readonly"<!-- ENDIF -->
                >{VALUE}</textarea>
            <!-- ELSEIF {TYPE} == "textextra" -->
                <textarea id="{FIELD}" name="c[{FIELD}]" style="width:98%" rows="12"
                          <!-- IF {REQUIRED} --> required="required"<!-- ENDIF -->
                          <!-- IF {READONLY} --> class="ro" readonly="readonly"<!-- ENDIF -->
                >{VALUE}</textarea>
            <!-- ELSEIF {TYPE} == "textsmall" -->
                <input type="text" id="{FIELD}" name="c[{FIELD}]" value="{VALUE}" size="10"
                       <!-- IF {REQUIRED} --> required="required"<!-- ENDIF -->
                       <!-- IF {READONLY} --> class="ro" readonly="readonly"<!-- ENDIF --> />
            <!-- ELSEIF {TYPE} == "guid" -->
                <input type="text" id="{FIELD}" name="c[{FIELD}]" value="{VALUE}" size="50"
                       placeholder="0000-0000-0000-0000-0000-0000-0000-0000"
                       <!-- IF {REQUIRED} --> required="required"<!-- ENDIF -->
                       <!-- IF {READONLY} --> class="ro" readonly="readonly"<!-- ENDIF --> />
            <!-- ELSE -->
                <input type="text" id="{FIELD}" name="c[{FIELD}]" value="{VALUE}" size="50"
                       <!-- IF {REQUIRED} --> required="required"<!-- ENDIF -->
                       <!-- IF {READONLY} --> class="ro" readonly="readonly"<!-- ENDIF --> />
            <!-- ENDIF -->
            <span style="color:red" class="s">
                <!-- BEGIN ERROR --><br class="clear" />{ERROR}<!-- END -->
            </span>
        </td>
        <td style="vertical-align:top;padding-top:.5em;padding-bottom:.5em">
            <small>{HINT}</small>
        </td>
    </tr>
    <!-- ENDIF -->

    <!-- END -->

    <!-- IF !{ID} -->
    <!-- New channel, ask for auto add to hierarchy -->
    <tr>
        <td>
            {{Overview}}
        </td>
        <td>
            <div class="fl" style="margin:.5em 1em 0 0">
                <input type="checkbox" id="add2tree" name="add2tree" class="iCheck" onchange="$('#tree').prop('disabled',!this.checked)" />
            </div>
            <select id="tree" name="tree" disabled="disabled">
                <option value="1">{{TopLevel}} &nbsp; {{or}}</option>
                <option value="0" disabled="disabled">{{AsChild}}</option>
                    <!-- BEGIN ADDTREE -->
                    <option value="{ID}" <!-- IF !{AVAILABLE} -->disabled="disabled"<!-- ENDIF -->>{INDENT}{NAME}</option>
                    <!-- END -->
                </optgroup>
            </select>

        </td>
        <td>
            {{Channel2Overview}}
        </td>
    </tr>
    <!-- ENDIF -->

    </tbody>

    <tfoot>
    <tr>
        <th class="l" colspan="3">
            <img style="width:16px;height:16px" width="16" height="16"
                 src="/images/required.gif" alt="*" />
            <small>{{Required}}</small>
        </th>
    </tr>
    </tfoot>

</table>

<p><input type="submit" value="{{Save}}" /></p>

</form>

</div>

<div class="clear"></div>
