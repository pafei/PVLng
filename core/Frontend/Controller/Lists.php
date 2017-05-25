<?php
/**
 *
 *
 * @author      Knut Kohl <github@knutkohl.de>
 * @copyright   2012-2014 Knut Kohl
 * @license     MIT License (MIT) http://opensource.org/licenses/MIT
 * @version     1.0.0
 */
namespace Frontend\Controller;

/**
 *
 */
use Channel\Channel as Channel;
use Core\Messages;
use Frontend\Controller;
use PVLng\PVLng;
use Yryie\Yryie;
use DBQuery;
use I18N;

/**
 *
 */
class Lists extends Controller
{
    /**
     *
     */
    public function indexAction()
    {
        $this->view->SubTitle = I18N::translate('List');

        $q = DBQuery::forge('pvlng_tree_view')
             ->get('guid')->get('name')->get('description')
             ->get('type')->get('unit')->get('graph', 'available')->get('icon')
             ->get(
                 'CONCAT(REPEAT("&nbsp; &nbsp; ", `level`-2), IF(`haschilds`,"&nbsp;&bull;","&rarr;"), "&nbsp;")',
                 'indent'
             )
             ->filter('`id` <> 1 AND `alias_of` IS NULL');

        $this->view->Channels = $this->db->queryRowsArray($q);

        try {
            if ($id = $this->app->params['id']) {
                $channel = Channel::byChannel($id);
                $this->view->GUID = $channel->guid;
            } elseif ($guid = $this->app->params['guid']) {
                $channel = Channel::byGUID($guid);
                $this->view->GUID = $channel->guid;
            }
        } catch (Exception $e) {
            Messages::Info('Unknown channel');
        }

        $this->preparePresetAndPeriod();
    }
}
