<?php
/**
 *
 * @author     Knut Kohl <github@knutkohl.de>
 * @copyright  2012-2014 Knut Kohl
 * @license    MIT License (MIT) http://opensource.org/licenses/MIT
 * @version    1.0.0
 */

$app->hook('slim.before', function() use ($app) {
    $app->languages->add( 0, 'en', 'English', 'gb');
    $app->languages->add(10, 'de', 'Deutsch');
});
