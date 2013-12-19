<?php
// vim: set ai ts=4 sw=4 ft=php:

class WriteConfig {

	const HEADER = ";--------------------------------------------------------------------------------;
;          Do NOT edit this file as it is auto-generated by FreePBX.             ;
;--------------------------------------------------------------------------------;
; For information on adding additional paramaters to this file, please visit the ;
; FreePBX.org wiki page, or ask on IRC. This file was created by the new FreePBX ;
; BMO - Big Module Object. Any similarity in naming with BMO from Adventure Time ;
; is totally deliberate.                                                         ;
;--------------------------------------------------------------------------------;
";


	public function __construct($freepbx = null, $array = null) {
		if ($freepbx == null)
			throw new Exception("Need to be instantiated with a FreePBX Object");

		if ($array !== null)
			$this->writeConfigs($array);
	}

	public function writeConfigs($array) {
		foreach ($array as $file => $contents) {
			$this->writeFile($this->validateFilename($file), $contents);
		}
	}

	private function validateFilename($file) {
		// Check to make sure it doesn't have any /'s or ..'s 
		// in it. We're only allowed to write to /etc/asterisk

		if (strpos($file, "/") !== false)
			throw new Exception("$filename contains a /");
		if (strpos($file, "..") !== false)
			throw new Exception("$filename contains ..");

		$filename = "/etc/asterisk/$file";
		if (is_link($filename))
			throw new Exception("$filename is a symlink, not clobbering");

		return $filename;
	}

	private function writeFile($filename, $contents) {
		if ($contents === false) {
			// False means 'delete'
			unlink($filename);
			return true;
		}

		if (is_array($contents)) {
			// It's an array of things.
			//
			// It should be array('object' => array('line', 'line', 'line'))
			//    or
			// array('object' => 'string\nstring\n')
			//
			// Note that the magic item 'HEADER' will be placed at the start of the file,
			// after the default 'Generated by FreePBX' header.
			//
			$output = "\n";
			$header = "";
			foreach ($contents as $title => $item) {
				if ($title == "HEADER") {
					if (is_array($item)) {
						$header = implode("\n", $item)."\n";
					} else {
						$header = $item."\n";
					}
				} else {
					$output .= "[$title]\n";
					if (is_array($item)) {
						foreach ($item as $i => $v) {
							if (is_array($v)) {
								// Multiple settings to the same key
								foreach ($v as $opt) {
									$output .= "$i = $opt\n";
								}
							} else {
								$output .= "$i = $v\n";
							}
						}
					} else {
						$output .= $item;
					}
					$output .= "\n";
				}
			}
		} else {
			$output = $contents;
		}

		// Now I have a string, and can write it out.
		file_put_contents($filename, $this->getHeader().$header.$output);
		return true;
	}

	public function getHeader() {
		return self::HEADER;
	}



}

