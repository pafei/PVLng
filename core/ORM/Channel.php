<?php
/**
 *
 */
namespace ORM;

/**
 *
 */
class Channel extends ChannelBase {

    /**
     * Setter for 'extra'
     */
    public function setExtra( $value ) {
        return parent::setExtra(str_replace('\r', '', json_encode($value)));
    }

    /**
     * Getter for 'extra'
     */
    public function getExtra() {
        return json_decode(parent::getExtra());
    }

    /**
     * Get full name with description (if defined): Name (Description)
     */
    public function getFullName() {
        $name = $this->getName();
        if ($description = $this->getDescription) $name .= ' ('.$description.')';
        return $name;
    }

}
