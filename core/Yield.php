<?php
/**
 * Used as base for Yield, Plant, Inverter and String
 */
abstract class AbstractYield {

    /**
     *
     */
    protected $data = array();

    /**
     *
     */
    public function asArray () {
        return $this->data;
    }

    /**
     *
     */
    public function asJson () {
        return json_encode($this->asArray());
    }

    /**
     *
     */
    public function isValid () {
        return TRUE;
    }

    /**
     * Put 0 in front
     *
     * @param &$powers array Transfer by reference to avoid full copy
     * @param $count integer Count of 0 to pad
     */
    protected function leftPadPowers ($powers, $count) {
        for ($i = 0; $i < $count; ++$i) {
            array_unshift($powers, 0);
        }
        return $powers;
    }

    /**
     * Push 0 at the end
     *
     * @param &$powers array Transfer by reference to avoid full copy
     * @param $count integer Count of 0 to pad
     */
    protected function rightPadPowers ($powers, $count) {
        for ($i = 0; $i < $count; ++$i) {
            $powers[] = 0;
        }
        return $powers;
    }

}

/**
 *
 */
class YieldOverall extends AbstractYield {

    /**
     *
     */
    protected $data = array(
        'creator'                => 'www.pv-log.com',
        'version'                => '1.0',
        'filecontent'            => 'Minutes',
        'deleteDayBeforeImport'    => 0,
        'utc_offset'            => NULL,
        'plant'                    => NULL,
    );

    /**
     *
     */
    public function __construct ($creator = 'www.pv-log.com', $type = 'Minutes', $deleteDayBeforeImport = 0, $utcOffset = NULL) {
        $this->data['creator'] = $creator;
        $this->data['version'] = '1.0';
        $this->data['filecontent'] = $type;
        $this->data['deleteDayBeforeImport'] = (int)$deleteDayBeforeImport;
        $this->data['utc_offset'] = $utcOffset;
        $this->data['plant'] = new YieldPlant();
    }

    /**
     *
     */
    public function setType ($type) {
        $this->data['filecontent'] = $type;
        return $this;
    }

    /**
     *
     */
    public function getType () {
        return $this->data['filecontent'];
    }

    /**
     *
     */
    public function setUtcOffset ($utcOffset) {
        $this->data['utc_offset'] = (int)$utcOffset;
        return $this;
    }

    /**
     *
     */
    public function getUtcOffset () {
        return $this->data['utc_offset'];
    }

    /**
     *
     */
    public function setDeleteDayBeforeImport ($deleteDayBeforeImport) {
        $this->data['deleteDayBeforeImport'] = (int)$deleteDayBeforeImport;
        return $this;
    }

    /**
     *
     */
    public function getDeleteDayBeforeImport () {
        return $this->data['deleteDayBeforeImport'];
    }

    /**
     *
     */
    public function setCreator ($creator) {
        $this->data['creator'] = $creator;
        return $this;
    }

    /**
     *
     */
    public function getCreator () {
        return $this->data['creator'];
    }

    /**
     *
     */
    public function setPlant (YieldPlant $plant) {
        $this->data['plant'] = $plant;
        return $this;
    }

    /**
     *
     */
    public function getPlant () {
        return $this->data['plant'];
    }

    /**
     *
     */
    public function asArray() {
        $return = $this->data;
/*
        // some debugging
        $return['dbg'] = array(
            'Start' => date('r', $return['plant']->getTimestampStart()),
            'End'   => date('r', $return['plant']->getTimestampEnd())
        );
*/
        $return['plant'] = $return['plant']->asArray();
        return $return;
    }

}

class YieldPlant extends AbstractYield {

    /**
     *
     */
    protected $data = array(
        'recordTimestampStart'    => 0,
        'recordTimestampEnd'    => 0,
        'intervallInSeconds'    => 0,
        'currentTotalWh'        => 0,
        'totalWh'                => 0,
        'powerAcW'                => array(),
        'inverter'                => array(),
    );

    /**
     *
     */
    public function __construct ($timestampStart = 0, $timestampEnd = 0, $intervallSeconds = 300, $powerValues = array(), $currentTotalWattHours = 0, $dailyWattHours = 0) {
        $this->data['recordTimestampStart'] = (int)$timestampStart;
        $this->data['recordTimestampEnd'] = (int)$timestampEnd;
        $this->data['intervallInSeconds'] = (int)$intervallSeconds;
        $this->data['powerAcW'] = $powerValues;
        $this->data['currentTotalWh'] = (int)$currentTotalWattHours;
        $this->data['totalWh'] = (int)$dailyWattHours;
        $this->data['inverter'] = array();
    }

    /**
     *
     */
    public function setTimestampStart ($timestamp) {
        $this->data['recordTimestampStart'] = (int)$timestamp;
        return $this;
    }

    /**
     *
     */
    public function getTimestampStart () {
        return $this->data['recordTimestampStart'];
    }

    /**
     *
     */
    public function setTimestampEnd ($timestamp) {
        $this->data['recordTimestampEnd'] = (int)$timestamp;
        return $this;
    }

    /**
     *
     */
    public function getTimestampEnd () {
        return $this->data['recordTimestampEnd'];
    }

    /**
     *
     */
    public function setPowerValues ($values) {
        $this->data['powerAcW'] = $values;
        return $this;
    }

    /**
     *
     */
    public function getPowerValues () {
        return $this->data['powerAcW'];
    }

    /**
     *
     */
    public function addPowerValue ($value) {
        $this->data['powerAcW'][] = (int)$value;
        return $this;
    }

    /**
     *
     */
    public function setDailyWattHours ($value) {
        $this->data['totalWh'] = (int)$value;
        return $this;
    }

    /**
     *
     */
    public function getDailyWattHours () {
        return $this->data['totalWh'];
    }

    /**
     *
     */
    public function setCurrentTotalWattHours ($currentTotalWattHours) {
        $this->data['currentTotalWh'] = (int)$currentTotalWattHours;
        return $this;
    }

    /**
     *
     */
    public function getCurrentTotalWattHours () {
        return $this->data['currentTotalWh'];
    }

    /**
     *
     */
    public function setIntervallInSeconds ($intervallSeconds) {
        $this->data['intervallInSeconds'] = (int)$intervallSeconds;
        return $this;
    }

    /**
     *
     */
    public function getIntervallInSeconds () {
        return $this->data['intervallInSeconds'];
    }

    /**
     *
     */
    public function addInverter (YieldInverter $inverter) {
        $this->data['inverter'][count($this->data['inverter']) + 1] = $inverter;
        return $this;
    }

    /**
     *
     */
    public function asArray () {

        // Find lowest start and highest end
        $plantStart = PHP_INT_MAX;
        $plantEnd = 0;

        foreach ($this->data['inverter'] as $inverter) {
            $timestamp = $inverter->getTimestampStart();
            if ($timestamp < $plantStart)  {
                $plantStart = $timestamp;
            }
            $timestamp = $inverter->getTimestampEnd();
            if ($timestamp > $plantEnd) {
                $plantEnd = $timestamp;
            }
            foreach ($inverter->getStrings() as $string) {
                $timestamp = $string->getTimestampStart();
                if ($timestamp < $plantStart) {
                    $plantStart = $timestamp;
                }
                $timestamp = $string->getTimestampEnd();
                if ($timestamp > $plantEnd) {
                    $plantEnd = $timestamp;
                }
            }
        }

        $currentTotalWattHours = 0;
        $dailyWattHours = 0;
        // overal pwoer array length
        $powersCnt = 0;

        // Fetch powers and fix array sizes
        foreach ($this->data['inverter'] as $idInverter => $inverter) {

            // inverter
            $start = $inverter->getTimestampStart();
            $end = $inverter->getTimestampEnd();
            $powers = $inverter->getPowerValues();

            if ($cnt = count($powers)) {
                $intervall = ($end - $start) / $cnt;
                // fill up missing values
                $powers = $this->leftPadPowers($powers, round(($start - $plantStart) / $intervall));
                $powers = $this->rightPadPowers($powers, round(($plantEnd - $end) / $intervall));
            }

            // set new values
            $inverter->setPowerValues($powers);

            // sum up current and daily watt hours for corresponding parent plant values
            $currentTotalWattHours += $inverter->getCurrentTotalWattHours();
            $dailyWattHours += $inverter->getDailyWattHours();

            // calc plant 'powerAcW'
            if (empty($this->data['powerAcW'])) {
                // init with 1st inverter ...
                $this->data['powerAcW'] = $powers;
                $powersCnt = count($powers);
            } else {
                $powers = $this->rightPadPowers($powers, $powersCnt - count($powers));
                // add further inverter
                foreach ($this->data['powerAcW'] as $id => $power) {
                    $this->data['powerAcW'][$id] += $powers[$id];
                }
            }

            $currentTotalWattHoursInverter = 0;
            $dailyWattHoursInverter = 0;

            // same for strings
            foreach ($inverter->getStrings() as $string) {

                // sum up current and daily watt hours for corresponding parent inverter values
                $currentTotalWattHoursInverter += $string->getCurrentTotalWattHours();
                $dailyWattHoursInverter += $string->getDailyWattHours();

                // inverter
                $start = $string->getTimestampStart();
                $end = $string->getTimestampEnd();
                $powers = $string->getPowerValues();

                if ($cnt = count($powers)) {
                    $intervall = ($end - $start) / $cnt;
                    // fill up missing values
                    $powers = $this->leftPadPowers($powers, round(($start - $plantStart) / $intervall));
                    $powers = $this->rightPadPowers($powers, $powersCnt - count($powers));
                }

                // set new values
                $string->setPowerValues($powers);
            }

            // set the summed up strings instead of inverter value as plant sum if the inverter has not a given value already
            if ($currentTotalWattHoursInverter > 0 && $this->data['inverter'][$idInverter]->getCurrentTotalWattHours() == 0) {
                $currentTotalWattHours = $currentTotalWattHoursInverter;
            }
            if ($dailyWattHoursInverter > 0 && $this->data['inverter'][$idInverter]->getDailyWattHours() == 0) {
                $dailyWattHours = $dailyWattHoursInverter;
            }

            // set the calculated string value into the inverter if it has not a given value
            if ($this->data['inverter'][$idInverter]->getCurrentTotalWattHours() == 0) {
                $this->data['inverter'][$idInverter]->setCurrentTotalWattHours($currentTotalWattHoursInverter);
            }
            if ($this->data['inverter'][$idInverter]->getDailyWattHours() == 0) {
                $this->data['inverter'][$idInverter]->setDailyWattHours($dailyWattHoursInverter);
            }

        }

        // set the calculated inverter value into the plant if it has not a given value
        if ($this->data['currentTotalWh'] == 0) {
            $this->data['currentTotalWh'] = $currentTotalWattHours;
        }
        if ($this->data['totalWh'] == 0) {
            $this->data['totalWh'] = $dailyWattHours;
        }

        $this->setTimestampStart($plantStart);
        $this->setTimestampEnd($plantEnd);
        if ($plantStart != $plantEnd || $this->getIntervallInSeconds() == 0) {
            if ($cnt = count($this->data['powerAcW'])) {
                $this->setIntervallInSeconds(ceil(($plantEnd - $plantStart) / $cnt));
            }
        }

        $return = $this->data;
        foreach ($return['inverter'] as $id => $inverter) {
            if (is_object($inverter) && $inverter instanceof YieldInverter) {
                $return['inverter'][$id] = $inverter->asArray();
            }
        }
        return $return;
    }

}

/**
 *
 */
class YieldInverter extends AbstractYield {

    /**
     *
     */
    protected $recordTimestampStart;

    /**
     *
     */
    protected $recordTimestampEnd;

    /**
     *
     */
    protected $data = array(
        'currentTotalWh'    => 0,
        'totalWh'            => 0,
        'powerAcW'            => array(),
        'strings'            => array(),
    );

    /**
     *
     */
    public function __construct ($powerValues = array(), $currentTotalWattHours = 0, $dailyWattHours = 0) {
        $this->data['currentTotalWh'] = (int)$currentTotalWattHours;
        $this->data['totalWh'] = (int)$dailyWattHours;
        $this->data['powerAcW'] = $powerValues;
        $this->data['strings'] = array();
    }

    /**
     *
     */
    public function setCurrentTotalWattHours ($currentTotalWattHours) {
        $this->data['currentTotalWh'] = (int)$currentTotalWattHours;
        return $this;
    }

    /**
     *
     */
    public function getCurrentTotalWattHours () {
        // if we only got a single yield value in the inverter and no currentTotalWh set,
        // this single yield value is the currentTotalWh and we return it as that
        if (count($this->data['powerAcW']) == 1 && $this->data['currentTotalWh'] == 0) {
            return current($this->data['powerAcW']);
        }
        return $this->data['currentTotalWh'];
    }

    /**
     *
     */
    public function getDailyWattHours () {
        return $this->data['totalWh'];
    }

    /**
     *
     */
    public function setDailyWattHours ($value) {
        $this->data['totalWh'] = (int)$value;
        return $this;
    }

    /**
     *
     */
    public function getPowerValues () {
        return $this->data['powerAcW'];
    }

    /**
     *
     */
    public function setPowerValues ($values) {
        $this->data['powerAcW'] = $values;
        return $this;
    }

    /**
     *
     */
    public function setTimestampStart ($timestamp) {
        $this->recordTimestampStart = (int)$timestamp;
        return $this;
    }

    /**
     *
     */
    public function getTimestampStart () {
        return $this->recordTimestampStart;
    }

    /**
     *
     */
    public function setTimestampEnd ($timestamp) {
        $this->recordTimestampEnd = (int)$timestamp;
        return $this;
    }

    /**
     *
     */
    public function getTimestampEnd () {
        return $this->recordTimestampEnd;
    }

    /**
     *
     */
    public function addPowerValue ($value) {
        $this->data['powerAcW'][] = (int)$value;
        return $this;
    }

    /**
     *
     */
    public function addString (YieldString $string) {
        $this->data['strings'][count($this->data['strings']) + 1] = $string;
        return $this;
    }

    /**
     *
     */
    public function setStrings($strings) {
        $this->data['strings'] = $strings;
        return $this;
    }

    /**
     *
     */
    public function getStrings() {
        return $this->data['strings'];
    }

    /**
     *
     */
    public function asArray () {
        $return = $this->data;
        $currentTotalWattHours = 0;
        $dailyWattHours = 0;
        foreach ($return['strings'] as $id => $string) {
            if (is_object($string) && $string instanceof YieldString) {
                $return['strings'][$id] = $string->asArray();
                $currentTotalWattHours += $string->getCurrentTotalWattHours();
                $dailyWattHours += $string->getDailyWattHours();
            }
        }
        if ($return['currentTotalWh'] == 0) {
            $return['currentTotalWh'] = $currentTotalWattHours;
        }
        if ($return['totalWh'] == 0) {
            $return['totalWh'] = $dailyWattHours;
        }
        return $return;
    }

}

/**
 *
 */
class YieldString extends AbstractYield {

    /**
     *
     */
    protected $recordTimestampStart;

    /**
     *
     */
    protected $recordTimestampEnd;

    /**
     *
     */
    protected $data = array(
        'currentTotalWh'    => 0,
        'totalWh'            => 0,
        'powerAcW'            => array(),
    );

    /**
     *
     */
    public function __construct ($powerValues = array(), $currentTotalWattHours = 0, $dailyWattHours = 0) {
        $this->data['powerAcW'] = $powerValues;
        $this->data['totalWh'] = (int)$dailyWattHours;
        $this->data['currentTotalWh'] = (int)$currentTotalWattHours;
    }

    /**
     *
     */
    public function setCurrentTotalWattHours ($currentTotalWattHours) {
        $this->data['currentTotalWh'] = (int)$currentTotalWattHours;
        return $this;
    }

    /**
     *
     */
    public function getCurrentTotalWattHours () {
        return $this->data['currentTotalWh'];
    }

    /**
     *
     */
    public function setDailyWattHours ($value) {
        $this->data['totalWh'] = (int)$value;
        return $this;
    }

    /**
     *
     */
    public function getDailyWattHours () {
        return $this->data['totalWh'];
    }

    /**
     *
     */
    public function setPowerValues ($values) {
        $this->data['powerAcW'] = $values;
        return $this;
    }

    /**
     *
     */
    public function getPowerValues () {
        return $this->data['powerAcW'];
    }

    /**
     *
     */
    public function addPowerValue ($value) {
        $this->data['powerAcW'][] = (int)$value;
        return $this;
    }

    /**
     *
     */
    public function setTimestampStart ($timestamp) {
        $this->recordTimestampStart = (int)$timestamp;
        return $this;
    }

    /**
     *
     */
    public function getTimestampStart () {
        return $this->recordTimestampStart;
    }

    /**
     *
     */
    public function setTimestampEnd ($timestamp) {
        $this->recordTimestampEnd = (int)$timestamp;
        return $this;
    }

    /**
     *
     */
    public function getTimestampEnd () {
        return $this->recordTimestampEnd;
    }

}
