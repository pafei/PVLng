<?php
/**
 *
 *
 * @author      Knut Kohl <github@knutkohl.de>
 * @copyright   2012-2014 Knut Kohl
 * @license     MIT License (MIT) http://opensource.org/licenses/MIT
 * @version     1.0.0
 */
namespace Controller;

/**
 *
 */
class Infoframe extends \Controller {

    /**
     *
     */
    public function Index_Action() {

        $dir   = APP_DIR . DS . 'View' . DS . 'Infoframe';
        $frame = $this->app->params->get('frame');

        $config = $dir . DS . $frame . '.php';
        if (!file_exists($config)) {
            \Messages::Error('Missing settings in '.$frame.'.php');
            $this->app->redirect('/');
        }

        foreach (array('png', 'jpg', 'jpeg', 'gif') as $ext) {
            $file = $dir . DS . $frame . '.' . $ext;
            if (file_exists($file)) break;
            $file = NULL;
        }
        if (!$file) {
            \Messages::Error('Missing image: '.$frame.'.(png|jpg|jpeg|gif)');
            $this->app->redirect('/');
        }

        $im = imagecreatefromstring(file_get_contents($file));
        if (!$im) {
            \Messages::Error('Can\'t read image from '.$file);
            $this->app->redirect('/');
        }

        foreach (include $config as $id=>$item) {
            $item = array_merge(
                array(
                    'guid'    => NULL,
                    'start'   => '-5minutes',
                    'period'  => 'last',
                    'font'    => 5,
                    'label'   => '<Label '.$id.'?'.'>',
                    'bgcolor' => NULL,
                    'border'  => 3,
                    'color'   => array(0, 0, 0),
                    'x'       => 0,
                    'y'       => 0,
                ),
                $item
            );

            $bgcolor = $item['bgcolor'] ? imagecolorallocate($im, $item['bgcolor'][0], $item['bgcolor'][1], $item['bgcolor'][2]) : NULL;
            $color   = imagecolorallocate($im, $item['color'][0], $item['color'][1], $item['color'][2]);

            if ($item['guid']) {
                $value = \Channel::byGUID($item['guid'])
                         ->read(array('start'=>$item['start'], 'period'=>$item['period']))
                         ->rewind()->current();
                $label = isset($value['data']) ? sprintf($item['label'], $value['data']) : '';
            } elseif ($item['label'] == '{DATETIME}') {
                $label = date($this->config->get('Locale.DateTime'));
            } elseif ($item['label'] == '{TIME}') {
                $label = date($this->config->get('Locale.TimeShort'));
            } else {
                $label = $item['label'];
            }

            if ($label) {
                $font = $item['font'];
                $x = $item['x'];
                $y = $item['y'];
                if ($bgcolor) {
                    imagefilledrectangle($im, $x-$item['border'], $y-$item['border'],
                                         $x+imagefontwidth($font)*strlen($label)+$item['border'],
                                         $y+imagefontheight($font)+$item['border'], $bgcolor);
                }
                imagestring($im, $font, $x, $y, $label, $color);
            }
        }

        header('Content-Type: image/png');
        imagepng($im);
        exit;
    }
}
