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
$api->get(
    '/data/scatter/:GUIDx/:GUIDy',
    $APIkeyRequired,
    function($GUIDx, $GUIDy) use ($api)
{
    $request = $api->request->get();

    Channel::calcStartEnd($request);

    $xChannel = Channel::ByGUID($GUIDx);
    $yChannel = Channel::ByGUID($GUIDy);

    $buffer = new Buffer;

    if ($api->request->get('attributes')) {
        $buffer->write($xChannel->getAttributes());
        $buffer->write($yChannel->getAttributes());
    }

    $sql = $api->db->sql(
        'CALL `pvlng_scatter`({1}, {2}, {3}, {4})',
        $xChannel->entity, $yChannel->entity,
        $request['start'], $request['end']
    );

    if ($api->request->get('sql')) {
        $api->response()->header(
            'X-SQL',
            str_replace(array("\n", "\r"), array(' ', ''), $sql)
        );
    }

    $cnt = 0;

    $api->db->setBuffered();

    if ($res = $api->db->query($sql)) {
        while ($row = $res->fetch_row()) {
            $cnt++;
            $buffer->write(array_values($row));
        }
        $res->close();
    }

    $api->response()->header('X-Rows', $cnt);

    $api->render($buffer);
})->name('GET /data/scatter/:x/:y')->help = array(
    'since'       => 'r6',
    'description' => 'Fetch data for scatter plot',
    'apikey'      => true,
);
