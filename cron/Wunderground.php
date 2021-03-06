<?php
/**
 * Fetch weather data from Wunderground API
 *
 * @author      Knut Kohl <github@knutkohl.de>
 * @copyright   2012-2014 Knut Kohl
 * @license     MIT License (MIT) http://opensource.org/licenses/MIT
 * @version     1.0.0
 */

/**
 * Settings from configuration can be accessed by
 * $section['<key>'] (keys lowercase)
 */

$lat = $config->get('Core.Latitude');
$lon = $config->get('Core.Longitude');

if (!$lat OR !$lon) {
    out(0, 'Missing location!');
    return;
}

$key = $config->get('Controller.Weather.APIkey');

if (!$key) {
    out(0, 'Missing Wunderground API key!');
    return;
}

$url = sprintf('http://api.wunderground.com/api/%s/conditions/hourly/lang:%s/q/%f,%f.json',
               $key, $section['language'], $lat, $lon);

okv(1, 'URL', $url);

// Start curl sequence
if (!curl(array(
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => 1
), $data, $info)) return;

okv(2, 'Received', $data);

if (TESTMODE) return;

// Anything went wrong?
if ($info['http_code'] != 200) {
    out(0, print_r($data, TRUE));
    return;
}

$data = json_decode($data, TRUE);
$cnt = Channel::byGUID($section['channel'])->write($data);

// Forecast
foreach ($data['hourly_forecast'] as $forecast) {
    $cnt += Channel::byGUID($section['channel'])->write($forecast, $forecast['FCTTIME']['epoch']);
}

okv(1, 'Channels updated', $cnt);
