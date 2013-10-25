<?php
/**
 *
 *
 * @author      Knut Kohl <github@knutkohl.de>
 * @copyright   2012-2013 Knut Kohl
 * @license     GNU General Public License http://www.gnu.org/licenses/gpl.txt
 * @version     $Id: v1.0.0.2-19-gf67765b 2013-05-05 22:03:31 +0200 Knut Kohl $
 */
namespace Controller;

/**
 *
 */
class Dashboard extends \Controller {

	/**
	 *
	 */
	public function __construct() {
		parent::__construct();

		$this->Tree = \NestedSet::getInstance();
		$this->channels = array();
	}

	/**
	 *
	 */
	public function IndexEmbedded_Action() {
		$this->view->Embedded = TRUE;
		$this->app->foreward('Index');
	}

	/**
	 *
	 */
	public function IndexGET_Action() {
		if ($data = $this->db->Dashboard) {
			$this->Channels = json_decode($data);
		}
	}

	/**
	 *
	 */
	public function IndexPOST_Action() {
		if ($channels = $this->request->post('v')) {
			array_walk($channels, function(&$id) { $id = +$id; });
			$this->db->Dashboard = json_encode($channels);
			$this->Channels = $channels;
		}
	}

	/**
	 *
	 */
	public function Index_Action() {
		$this->view->SubTitle = \I18N::_('Dashboard');

		$tree = $this->Tree->getFullTree();
		array_shift($tree);
		$parent = array( 1 => 0 );

		$data = array();
		foreach ($tree as $node) {

			$parent[$node['level']] = $node['id'];
			$node['parent'] = $parent[$node['level']-1];

			if ($entity = $this->model->getEntity($node['entity'])) {
				// remove id, don't overwrite tree->id!
				#unset($entity->id);
		        $guid = $node['guid'] ?: $entity->guid;
		        $node = array_merge((array) $entity, $node);
		        $node['guid'] = $guid;
				if (in_array($node['id'], $this->Channels)) {
					$node['checked'] = 'checked';
				}
			}

			$data[] = array_change_key_case($node, CASE_UPPER);
		}
		$this->view->Data = $data;
		$this->view->ChannelCount = count($this->Channels);
	}

	// -------------------------------------------------------------------------
	// PROTECTED
	// -------------------------------------------------------------------------

	/**
	 *
	 */
	protected $Tree;

	/**
	 *
	 */
	protected $Channels;

}
