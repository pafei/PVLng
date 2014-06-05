<?php
/**
 * Copy this file e.g. to "compress.conf.php"
 *
 * @author     Knut Kohl <github@knutkohl.de>
 * @copyright  2012-2014 Knut Kohl
 * @license    MIT License (MIT) http://opensource.org/licenses/MIT
 * @version    1.0.0
 */
return array(

    /**
     * Standard definition for all not explicit named channels
     *
     * Please mind, that the aggregation minutes must follow this rule:
     * - The "next" minutes aggregation must be a multiple of the previous like this:
     *   1 > 5 > 10 > 30 > 60 > 120 or
     *   1 > 5 > 15 > 30 > 60 > 300 ...
     *
     * Only then works the further aggregation of formerly aggregated readings!
     */
    STANDARD => array(
         '7d' =>    1, // older than  7 days   -  one reading per    1 minutes
         '1m' =>    5, // older than  1 month  -  one reading per    5 minutes
         '3m' =>   10, // older than  3 month  -  one reading per   10 minutes
         '1y' =>   30, // older than  1 year   -  one reading per   30 minutes
         '5y' =>   60, // older than  5 years  -  one reading per   60 minutes
        '10y' => 1440, // older than 10 years  -  one reading per 1440 minutes (1 day)
    ),

    /**
     * To disable standard and only work on some further defined channels,
     * set STANDARD to NULL
     */
    // STANDARD => NULL,

    /**
     * To specify different ranges for a channel, define a section with the GUID
     * from channel view as key
     */
    '0000-0000-0000-0000-0000-0000-0000-0000' => array(
        '1m'  =>   5, // older than 1 month  -  one reading per  5 minutes
        '6m'  =>  15, // older than 6 month  -  one reading per 15 minutes
        '1y'  =>  60, // older than 1 year   -  one reading per 60 minutes
    ),

    /**
     * To exclude a channel at all, set to NULL
     */
    '0000-0000-0000-0000-0000-0000-0000-0000' => NULL,

);
