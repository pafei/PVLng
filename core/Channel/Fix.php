<?php
/**
 *
 *
 * @author      Knut Kohl <github@knutkohl.de>
 * @copyright   2012-2013 Knut Kohl
 * @license     GNU General Public License http://www.gnu.org/licenses/gpl.txt
 * @version     1.0.0
 */
namespace Channel;

/**
 *
 */
class Fix extends InternalCalc {

    /**
     *
     */
    protected function before_read( $request ) {

        parent::before_read($request);

        if ($this->dataExists()) return;

        $ts = $this->start;

        if ($this->isChild) {
            $delta = 60;
        } else {
            // Show pseudo reading at each consolidation range point or at least each hour
            $delta = $this->GroupingPeriod[$this->period[1]] ?: 3600; // 1hr
        }

        while ($ts <= $this->end) {
            $this->saveValue($ts, 1);
            $ts += $delta;
        }

        $this->dataCreated();
    }
}
