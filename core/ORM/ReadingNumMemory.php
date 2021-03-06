<?php
/**
 *
 *
 * @author     Knut Kohl <github@knutkohl.de>
 * @copyright  2012-2014 Knut Kohl
 * @license    MIT License (MIT) http://opensource.org/licenses/MIT
 * @version    1.0.0
 */

/**
 *
 */
namespace ORM;

/**
 *
 */
class ReadingNumMemory extends ReadingNumMemoryBase {

    /**
     *
     * @param mixed $id Key describing one row, on primary keys
     *                  with more than field, provide an array
     */
    public function __construct ( $id=NULL ) {
        if (self::$first) {
            self::$db->query('
                CREATE TABLE IF NOT EXISTS `pvlng_reading_num_tmp` (
                    `id`        smallint unsigned NOT NULL DEFAULT 0,
                    `timestamp` int               NOT NULL DEFAULT 0,
                    `data`      decimal(13,4)     NOT NULL DEFAULT 0,
                    PRIMARY KEY (`id`, `timestamp`)
                ) ENGINE=Memory PARTITION BY LINEAR KEY(`id`) PARTITIONS 10
            ');

            self::$first = FALSE;
        }

        parent::__construct($id);
    }

    // -------------------------------------------------------------------------
    // PRIVATE
    // -------------------------------------------------------------------------

    /**
     * First call
     */
    private static $first = TRUE;

}
