<?php
/**
 *
 *
 * @author      Knut Kohl <github@knutkohl.de>
 * @copyright   2012-2013 Knut Kohl
 * @license     GNU General Public License http://www.gnu.org/licenses/gpl.txt
 * @version     $Id$
 */
namespace Channel;

/**
 *
 */
class InternalConsumption extends \Channel {

	/**
	 * Accept only childs of the same entity type
	 */
	public function addChild( $guid ) {
		// Check if the new child is a meter
		$new = self::byGUID($guid);
		if ($new->meter) {
			// ok, add new child
			return parent::addChild($guid);
		}

		throw new Exception('"'.$this->name.'" accepts only meters as sub channels!', 400);
	}

	/**
	 *
	 */
	public function read( $request, $attributes=FALSE ) {

		$this->before_read($request);

		$childs = $this->getChilds();

		$tmpfile_1 = $childs[0]->read($request);

		rewind($tmpfile_1);
		$row1 = fgets($tmpfile_1);
		$this->decode($row1, $id1);

		$tmpfile_2 = $childs[1]->read($request);

		rewind($tmpfile_2);
		$row2 = fgets($tmpfile_2);
		$this->decode($row2, $id2);

		$result = tmpfile();

		$last = 0;
		$done = ($row1 == '' AND $row2 == '');

		while (!$done) {

			if ($id1 == $id2) {

				// same timestamp, combine
				if ($last) $row1['data'] = $last;

				if ($row1['consumption'] > $row2['consumption']) {
					$row1['data'] += $row1['consumption'] - $row2['consumption'];
				}

				$last = $row1['data'];

				fwrite($result, $this->encode($row1, $id1));

				// read both next rows
				$row1 = fgets($tmpfile_1);
				$this->decode($row1, $id1);

				$row2 = fgets($tmpfile_2);
				$this->decode($row2, $id2);

			} elseif ($id2 == '' OR $id1 < $id2) {

				if ($last) $row1['data'] = $last;

				$row1['data'] += $row1['consumption'];
				$last = $row1['data'];

				// missing row 2, save row 1 as is
				fwrite($result, $this->encode($row1, $id1));

				// read only row 1
				$row1 = fgets($tmpfile_1);
				$this->decode($row1, $id1);

			} else /* $id1 > $id2 */ {

				// read only row 2
				$row2 = fgets($tmpfile_2);
				$this->decode($row2, $id2);

			}

			$done = ($row1 == '' AND $row2 == '');
		}

		return $this->after_read($result, $attributes);
	}

}