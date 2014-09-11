<?php
/**
 *
 * @author     Knut Kohl <github@knutkohl.de>
 * @copyright  2012-2014 Knut Kohl
 * @license    MIT License (MIT) http://opensource.org/licenses/MIT
 * @version    1.0.0
 */
if (!Session::get('User')) return;

/**
 *
 */
PVLng::Menu( 'channel', 50, '#', __('Channels') );

/**
 *
 */
PVLng::SubMenu(
    'channel', 10, '/type', __('ChannelTypes')
);

PVLng::SubMenu(
    'channel', 20, '/channel', __('Channels'), __('ChannelsHint') . ' (Shift+F4)'
);

PVLng::SubMenu(
    'channel', 21, '/channel/add', __('CreateChannel')
);

PVLng::SubMenu(
    'channel', 30, '/overview', __('Overview'), __('OverviewHint')
);

PVLng::SubMenu(
    'channel', 40, '/tariff', __('Tariffs'), __('TariffsHint')
);

/**
 * Routes
 */
$app->get('/channel', $checkAuth, function() use ($app) {
    $app->process('Channel');
});

$app->get('/channel/new/:type', $checkAuth, function( $type ) use ($app) {
    $app->process('Channel', 'New', array('type' => $type));
});

$app->map('/channel/add(/:clone)', $checkAuth, function( $clone=0 ) use ($app) {
    $app->process('Channel', 'Add', array('clone' => $clone));
})->via('GET', 'POST');

$app->get('/channel/template', $checkAuth, function() use ($app) {
    $app->redirect('/channel/add#template');
});

$app->post('/channel/template', $checkAuth, function() use ($app) {
    $app->process('Channel', 'Template');
});

$app->get('/channel/edit/:id', $checkAuth, function( $id ) use ($app) {
    $app->process('Channel', 'Edit', array('id' => $id));
});

$app->get('/channel/edit/:guid', $checkAuth, function( $guid ) use ($app) {
    $app->process('Channel', 'Edit', array('guid' => $guid));
});

$app->post('/channel/alias', $checkAuth, function() use ($app) {
    $app->process('Channel', 'Alias');
});

$app->post('/channel/edit', $checkAuth, function() use ($app) {
    $app->process('Channel', 'Edit');
});

$app->post('/channel/delete', $checkAuth, function() use ($app) {
    $app->process('Channel', 'Delete');
});
