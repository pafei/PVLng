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

<!-- Use this image as spacer for not available actions of channels -->
<!-- DEFINE SpacerImg -->
<img src="/images/pix.gif" class="imgbar wide" style="width:16px;height:16px" width="16" height="16" alt="" />
<!-- END DEFINE -->

<div class="ui-tabs">

    <ul>
        <li><a href="#type">{{SelectEntityType}}</a></li>
        <li><a href="#template">{{SelectEntityTemplate}}</a></li>
    </ul>

    <div id="type">

        <table id="typeTable" class="dataTable">
            <thead>
            <tr>
                <th>{{EntityType}}</th>
                <th style="white-space:nowrap">{{ExampleUnit}}</th>
                <th style="white-space:nowrap">{{Childs}}</th>
                <th class="icons">
                    <img src="/images/ico/information_frame.png" style="margin-right:-5px" class="tip" tip="#IconLegend" alt="?">
                </th>
                <th>{{Description}}</th>
                <th>{{Select}}</th>
            </tr>
            </thead>
            <tbody>

            <!-- BEGIN ENTITYTYPES -->
            <tr>
                <td class="icons" style="white-space:nowrap;font-weight:bold">
                    <label for="type-{ID}">
                        <img style="vertical-align:middle;margin-right:8px" src="{ICON}" alt="" />
                        {NAME}
                    </label>
                </td>
                <td>{UNIT}</td>
                <td class="c">
                    <!-- IF {CHILDS} == 0 -->
                        {{no}}
                    <!-- ELSEIF {CHILDS} == -1 -->
                        {{unlimited}}
                    <!-- ELSE -->
                        {CHILDS}
                    <!-- ENDIF -->
                </td>
                <td class="icons">
                    <!-- INCLUDE channeltype.inc.tpl -->
                </td>
                <td style="font-size:smaller">{DESCRIPTION}</td>
                <td>
                    <form action="/channel/add" method="post">
                    <input type="hidden" name="type" value="{ID}" />
                    <input type="submit" value="&raquo;" />
                    </form>
                </td>
            </tr>
            <!-- END -->

            </tbody>

        </table>

    </div>

    <div id="template">

        <table id="tplTable" class="dataTable">
            <thead>
            <tr>
                <th>{{Name}}</th>
                <th>{{Description}}</th>
                <th>{{Select}}</th>
            </tr>
            </thead>
            <tbody>

            <!-- BEGIN TEMPLATES -->
            <tr>
                <td class="icons" style="white-space:nowrap;font-weight:bold">
                    <label for="{FILE}">
                        <img style="vertical-align:middle;margin-right:8px" src="{ICON}" alt="" />
                        {NAME}
                    </label>
                </td>
                <td style="font-size:smaller">{DESCRIPTION}</td>
                <td>
                    <form action="/channel/template" method="post">
                    <input type="hidden" name="template" value="{FILE}" />
                    <input type="submit" value="&raquo;" />
                    </form>
                </td>
            </tr>
            <!-- END -->

            </tbody>

            <tfoot>
            <tr>
                <th class="l i" colspan="3">{{AdjustTemplateAfterwards}}</th>
            </tr>
            </tfoot>

        </table>

    </div>

</div>

<!-- Legend -->

<div id="IconLegend">
    <div class="icons legendtip">
        <img src="/images/ico/read-write.png">{{ReadWritableEntity}}<br />
        <img src="/images/ico/write.png">{{WritableEntity}}<br />
        <img src="/images/ico/read.png">{{ReadableEntity}}
    </div>
</div>
