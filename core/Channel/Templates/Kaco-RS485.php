<?php
/**
 * @author      Knut Kohl <github@knutkohl.de>
 * @copyright   2016 Knut Kohl
 * @license     MIT License (MIT) http://opensource.org/licenses/MIT
 * @version     1.0.0
 *
 * 1.0.0
 * - Inital creation
 */
return array(

    'name' => 'Kaco inverter',

    'description' => '
        Kaco solar inverter connected with RS485:
        <ul>
            <li>E-Total lifetime (Wh)</li>
            <li>Pac (W)</li>
            <li>Uac (V)</li>
            <li>Iac (A)</li>
            <li>Pdc (W)</li>
            <li>Udc (V)</li>
            <li>Idc (A)</li>
            <li>Temperture (°C)</li>
            <li>State (string)</li>
        </ul>
    ',


    'channels' => array(

        /**
         * 1st channel - Grouping channel
         * other       - Real channels
         *
         * Only required attributes must be filled
         */

        // Grouping channel
        array(
            'type'        => 40, // Kaco inverter
            'name'        => 'Kaco inverter (RS485)',
        ),

        // Real channels
        array(
            'type'        => 50, // Energy meter absolute
            'name'        => 'E-Total',
            'channel'     => 10,
            'unit'        => 'Wh',
            'decimals'    => 0,
            'meter'       => 1,
            'adjust'      => 1,
            'comment'     => 'Fill the "cost" with the amount of money you get for each watt hour (e.g. cent / 1000 / 1000 to get EUR).'."\n\n"
                           . 'Adjust offset automatic, transmitted value resets each morning.',
        ),

        array(
            'type'        => 51, // Power sensor
            'name'        => 'Pac',
            'channel'     => 8,
            'unit'        => 'W',
            'decimals'    => 0,
            'valid_from'  => 1,
            'comment'     => 'Set lower valid border to avoid store invalid data (inverter off)'
        ),

        array(
            'type'        => 52, // Voltage sensor
            'name'        => 'Uac',
            'channel'     => 6,
            'unit'        => 'V',
            'decimals'    => 0,
            'valid_from'  => 1,
            'comment'     => 'Set lower valid border to avoid store invalid data (inverter off)'
        ),

        array(
            'type'        => 53, // Current sensor
            'name'        => 'Iac',
            'channel'     => 7,
            'unit'        => 'A',
            'decimals'    => 1,
            'valid_from'  => 0.001,
            'comment'     => 'Set lower valid border to avoid store invalid data (inverter off)'
        ),

        array(
            'type'        => 51, // Power sensor
            'name'        => 'Pdc',
            'channel'     => 5,
            'unit'        => 'W',
            'decimals'    => 0,
            'valid_from'  => 1,
            'comment'     => 'Set lower valid border to avoid store invalid data (inverter off)'
        ),

        array(
            'type'        => 52, // Voltage sensor
            'name'        => 'Udc',
            'channel'     => 3,
            'unit'        => 'V',
            'decimals'    => 0,
            'valid_from'  => 1,
            'comment'     => 'Set lower valid border to avoid store invalid data (inverter off)'
        ),

        array(
            'type'        => 53, // Current sensor
            'name'        => 'Idc',
            'channel'     => 4,
            'unit'        => 'A',
            'decimals'    => 1,
            'valid_from'  => 0.001,
            'comment'     => 'Set lower valid border to avoid store invalid data (inverter off)'
        ),

        array(
            'type'        => 91, // Switch, non-numeric
            'name'        => 'State',
            'channel'     => 2,
            'numeric'     => 0,
            'tags'        => 'The following JSON map object will translate the numeric reading value during write to textual representation (ALL IN ONE LINE).'."\n\n"
                            .'WRITEMAP::{"0":"Startup","1":"Startup","2":"Shutdown","3":"MPP","4":"MPP","5":"MPP","6":"Wait","7":"Wait","8":"Wait","10":"Overheated off","11":"Overheated","12":"Overload shutdown","13":"Overload shutdown L1","14":"Grid failure","15":"Transition for night","18":"RCD A off","19":"Insulation resistance","30":"Error measurement","31":"RCD B error","32":"Error self-test","33":"Error DC","34":"Error com."}'
        ),

        array(
            'type'        => 60, // Temperature sensor
            'name'        => 'Inverter temperature',
            'channel'     => 9,
            'unit'        => '°C',
            'decimals'    => 1,
        ),

    ),
);
