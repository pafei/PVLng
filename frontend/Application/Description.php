<?php
/**
 *
 * @author     Knut Kohl <github@knutkohl.de>
 * @copyright  2012-2014 Knut Kohl
 * @license    MIT License (MIT) http://opensource.org/licenses/MIT
 * @version    1.0.0
 */

if (file_exists(ROOT_DIR . DS . 'description.md')) {
    // Add route only if description file exists
    $app->hook('slim.before', function() use ($app) {
        $app->menu->add(80, '/description', 'Description', TRUE, 'Shift+F7');
    });

    $app->get('/description', function() use ($app) {
        $app->process('Description');
    });

} else {

    $app->hook('slim.before', function() use ($app) {
        $app->menu->add(80, '#', 'Description', TRUE,
                        'Please create "description.md" first,<br />see "description.md.dist" for reference');
    });

}
