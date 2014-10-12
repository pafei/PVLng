<?php
/**
 *
 * @author     Knut Kohl <github@knutkohl.de>
 * @copyright  2012-2014 Knut Kohl
 * @license    MIT License (MIT) http://opensource.org/licenses/MIT
 * @version    1.0.0
 */

$app->hook('slim.before', function() use ($app) {
    $app->menu->add(60, '/info', 'Information', !!$app->user, 'Shift+F6');
});

/**
 * Routes
 */
$app->map('/info', $checkAuth, function() use ($app) {
    $app->process('Info');
})->via('GET', 'POST');
