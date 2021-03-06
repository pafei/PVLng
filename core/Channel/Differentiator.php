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
class Differentiator extends Calculator {

    /**
     *
     */
    public function read( $request ) {

        $this->before_read($request);

        $childs = $this->getChilds();
        $childCnt = count($childs);

        // no childs, return empty file
        if ($childCnt == 0) {
            return $this->after_read(new \Buffer);
        }

        $this->meter = $childs[0]->meter;
        $buffer = $childs[0]->read($request);

        // only one child, return as is
        if ($childCnt == 1) {
            return $this->after_read($buffer);
        }

        $lastRow = FALSE;

        // combine all data for same timestamp
        for ($i=1; $i<$childCnt; $i++) {

            $next = $childs[$i]->read($request);

            $row1 = $buffer->rewind()->current();
            $row2 = $next->rewind()->current();

            $result = new \Buffer;

            while (!empty($row1) OR !empty($row2)) {

                $key1 = $buffer->key();
                $key2 = $next->key();

                if ($key1 == $key2) {

                    // same timestamp, combine
                    $row1['data']        -= $row2['data'];
                    $row1['min']         -= $row2['min'];
                    $row1['max']         -= $row2['max'];
                    $row1['consumption']  = $lastRow ? $row1['data'] - $lastRow['data'] : 0;

                    $result->write($row1, $key1);
                    $lastRow = $row1;

                    // read both next rows
                    $row1 = $buffer->next()->current();
                    $row2 = $next->next()->current();

                } elseif (is_null($key2) OR !is_null($key1) AND $key1 < $key2) {

                    // write $row1 only, if not yet another row was written
                    if (count($result) == 0) {
                        $result->write($row1, $key1);
                        $lastRow = $row1;
                    }

                    // read only row 1
                    $row1 = $buffer->next()->current();

                } else /* $key1 > $key2 */ {

                    // read only row 2
                    $row2 = $next->next()->current();

                }
            }
            $next->close();

            // Set result to buffer for next loop
            $buffer = $result;
        }

        return $this->after_read($result);
    }

}
