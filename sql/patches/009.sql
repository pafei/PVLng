CREATE OR REPLACE VIEW `pvlng_tree_view` AS
select `n`.`id` AS `id`,`n`.`entity` AS `entity`,ifnull(`n`.`guid`,`c`.`guid`) AS `guid`,if(`co`.`id`,`co`.`name`,`c`.`name`) AS `name`,if(`co`.`id`,`co`.`serial`,`c`.`serial`) AS `serial`,`c`.`channel` AS `channel`,if(`co`.`id`,`co`.`description`,`c`.`description`) AS `description`,if(`co`.`id`,`co`.`resolution`,`c`.`resolution`) AS `resolution`,if(`co`.`id`,`co`.`cost`,`c`.`cost`) AS `cost`,if(`co`.`id`,`co`.`meter`,`c`.`meter`) AS `meter`,if(`co`.`id`,`co`.`numeric`,`c`.`numeric`) AS `numeric`,if(`co`.`id`,`co`.`offset`,`c`.`offset`) AS `offset`,if(`co`.`id`,`co`.`adjust`,`c`.`adjust`) AS `adjust`,if(`co`.`id`,`co`.`unit`,`c`.`unit`) AS `unit`,if(`co`.`id`,`co`.`decimals`,`c`.`decimals`) AS `decimals`,if(`co`.`id`,`co`.`threshold`,`c`.`threshold`) AS `threshold`,if(`co`.`id`,`co`.`valid_from`,`c`.`valid_from`) AS `valid_from`,if(`co`.`id`,`co`.`valid_to`,`c`.`valid_to`) AS `valid_to`,if(`co`.`id`,`co`.`public`,`c`.`public`) AS `public`,if(`co`.`id`,`co`.`tags`,`c`.`tags`) AS `tags`,if(`co`.`id`,`co`.`extra`,`c`.`extra`) AS `extra`,if(`co`.`id`,`co`.`comment`,`c`.`comment`) AS `comment`,`t`.`id` AS `type_id`,`t`.`name` AS `type`,`t`.`model` AS `model`,`t`.`childs` AS `childs`,`t`.`read` AS `read`,`t`.`write` AS `write`,`t`.`graph` AS `graph`,if(`co`.`id`,`co`.`icon`,`c`.`icon`) AS `icon`,`ca`.`id` AS `alias`,`ta`.`id` AS `alias_of`,`ta`.`entity` AS `entity_of`,(((count(1) - 1) + (`n`.`lft` > 1)) + 1) AS `level`,round((((`n`.`rgt` - `n`.`lft`) - 1) / 2),0) AS `haschilds`,((((min(`p`.`rgt`) - `n`.`rgt`) - (`n`.`lft` > 1)) / 2) > 0) AS `lower`,((`n`.`lft` - max(`p`.`lft`)) > 1) AS `upper` from ((((((`pvlng_tree` `n` left join `pvlng_channel` `c` on((`n`.`entity` = `c`.`id`))) left join `pvlng_type` `t` on((`c`.`type` = `t`.`id`))) left join `pvlng_channel` `ca` on(((if(`t`.`childs`,`n`.`guid`,`c`.`guid`) = `ca`.`channel`) and (`ca`.`type` = 0)))) left join `pvlng_tree` `ta` on((`c`.`channel` = `ta`.`guid`))) left join `pvlng_channel` `co` on(((`ta`.`entity` = `co`.`id`) and (`c`.`type` = 0)))) join `pvlng_tree` `p`) where ((`n`.`lft` between `p`.`lft` and `p`.`rgt`) and ((`p`.`id` <> `n`.`id`) or (`n`.`lft` = 1))) group by `n`.`id` order by `n`.`lft`;

REPLACE INTO `pvlng_babelkit` (`code_set`, `code_lang`, `code_code`, `code_desc`, `code_order`) VALUES
('app', 'de', 'SwitchChannels', 'Kanäle tauschen', 0),
('app', 'en', 'SwitchChannels', 'Switch channels', 0),
('app', 'de', 'ResetAll', 'Auswahl zurücksetzen', 0),
('app', 'en', 'ResetAll', 'Reset selection', 0),
('app', 'de', 'ClickDragShiftPan', 'Mausrad drehen oder Doppelklicken zum Vergrößern/Verkleinern, Maus klicken und halten zum Verschieben.', 0),
('app', 'en', 'ClickDragShiftPan', 'Scroll mouse wheel or double click to zoom, click and hold to pan.', 0),
('app', 'de', 'SettingsMenu', 'Einstellungen', 0),
('app', 'de', 'RepeatPasswordForChange', 'Nur ausfüllen, wenn es geändert werden soll!', 0),
('app', 'en', 'RepeatPasswordForChange', 'Fill only to change it!', 0),
('app', 'de', 'RepeatPassword', 'Passwort wiederholen', 0),
('app', 'en', 'RepeatPassword', 'repeat password', 0),
('settings', 'de', 'model__DoubleRead', 'Erkenne doppelte Daten per Zeitstempelvergleich &plusmn;Sekunden<br>\r\n<small>(setze auf 0 zum deaktivieren)</small>', 0),
('settings', 'en', 'model__DoubleRead', 'Detect double readings by timestamp &plusmn;seconds<br>\r\n<small>(set 0 to disable)</small>', 0),
('settings', 'de', 'model_InternalCalc_LifeTime', 'Speicherdauer für berechnete Daten in Sekunden<br>\r\n\r\n<small>(Wenn z.B. Deine Daten eine Auflösung von 5 Min. haben, setze es auf 300 usw.)</small>', 0),
('settings', 'en', 'model_InternalCalc_LifeTime', 'Buffer lifetime of calculated data in seconds<br>\r\n\r\n<small>(e.g. if your store most data each 5 minutes, set to 300 and so on)</small>', 0),
('settings', 'de', 'model_History_AverageDays', 'Berechne Durchschnitt für die letzten ? Tage', 0),
('settings', 'de', 'model_Estimate_Marker', 'Bild für den Marker', 0),
('settings', 'de', 'model_Daylight_ZenitIcon', 'Bild für den Sonnenzenit-Marker', 0),
('settings', 'de', 'model_Daylight_SunsetIcon', 'Bild für den Sonnenuntergangs-Marker', 0),
('settings', 'de', 'model_Daylight_SunriseIcon', 'Bild für den Sonnenaufgangs-Marker', 0),
('settings', 'de', 'model_Daylight_CurveDays', 'Berechne Durchschnitt für die letzten ? Tage', 0),
('settings', 'de', 'model_Daylight_Average', 'Berechnungsmethode für die Einstrahlungsvorhersage', 0),
('settings', 'de', 'core__TokenLogin', 'Erlaube Login mit einem IP spezifischen Token', 0),
('settings', 'de', 'core__Title', 'Dein persönlicher Titel (HTML ist erlaubt)', 0),
('settings', 'de', 'core__SendStats', 'Sende anonyme Statistiken', 0),
('settings', 'de', 'core__Password', 'Passwort', 0),
('settings', 'de', 'core__Latitude', 'Standort-Latitude (<a href=\"/location\" target=\"_blank\">oder Suche</a>)<br>\r\n<small>geographische Nord-Süd Koordinate (-90..90)</small>', 0),
('settings', 'de', 'core__Longitude', 'Standort-Longitude (<a href=\"/location\" target=\"_blank\">oder Suche</a>)<br>\r\n<small>geographische Ost-West Koordinate (-180..180)</small>', 0),
('settings', 'en', 'core__Latitude', 'Location latitude (<a href=\"/location\" target=\"_blank\">or search</a>)<br>\r\n<small>Your geographic coordinate that specifies the north-south position (-90..90)</small>', 0),
('settings', 'de', 'core__Language', 'Standardsprache', 0),
('settings', 'de', 'core__KeepLogs', 'Halte Log-Einträge für ? Tage', 0),
('settings', 'de', 'core__EmptyDatabaseAllowed', 'Aktiviere die Funktion zum Löschen aller Messdaten aus der Datenbank.<br>\r\nKanäle und die Kanalhierarchie werden <strong>nicht</strong> gelöscht!<br>\r\n<strong style=\"color:red\">Erst nach Aktivierung ist die Bereinigung möglich!</strong>', 0),
('settings', 'en', 'core__EmptyDatabaseAllowed', 'Enable function for deletion of all measuring data from database.<br>\r\nChannels and channel hierarchy will <strong>not</strong> be deleted!<br>\r\n<strong style=\"color:red\">The deletion is only after activation possible!</strong>', 0),
('settings', 'de', 'core_Currency_Format', 'Ausgabeformat, <strong><tt>{}</tt></strong> wird durch den Wert ersetzt', 0),
('settings', 'de', 'core_Currency_Decimals', 'Nachkommastellen', 0),
('settings', 'de', 'controller_Tariff_TimesLines', 'Initiale Leerzeilen pro Tarif', 0),
('settings', 'de', 'controller_Mobile_ChartHeight', 'Standard Diagrammhöhe', 0),
('settings', 'de', 'controller_Lists_PresetPeriods', 'Standard-Perioden für die Tag/Woche/Monat/Jahr Buttons (Semikolon getrennt)', 0),
('settings', 'de', 'controller_Index_Refresh', 'Diagramm automatisch neu laden aller ? Sekunden, setze auf 0 zum deaktivieren\r\n(Nur wenn Fenster im Vordergrund)', 0),
('settings', 'en', 'controller_Index_Refresh', 'Auto refresh chart each ? seconds, set 0 to disable\r\n(Only if window is in foreground)', 0),
('settings', 'de', 'controller_Index_PresetPeriods', 'Standard-Perioden für die Tag/Woche/Monat/Jahr Buttons (Semikolon getrennt)', 0),
('code_admin', 'en', 'settings', 'multi=1', 0),
('settings', 'de', 'controller_Index_NotifyAll', 'Zeige die Ladezeit für die Datenkanäle', 0),
('settings', 'de', 'controller_Index_ChartHeight', 'Standard Diagrammhöhe', 0),
('settings', 'en', 'core__Title', 'Your personal title (HTML allowed)', 0),
('settings', 'en', 'core__KeepLogs', 'Hold entries in log table for ? days', 0),
('settings', 'en', 'core__Language', 'Default language', 0),
('settings', 'en', 'core__Password', 'Password', 0),
('settings', 'en', 'core__Longitude', 'Location longitude (<a href=\"/location\" target=\"_blank\">or search</a>)<br /><small>Your geographic coordinate that specifies the east-west position (-180..180)</small>', 0),
('settings', 'en', 'core__SendStats', 'Send anonymous statistics', 0),
('settings', 'en', 'core__TokenLogin', 'Allow administrator login by IP bound login token', 0),
('settings', 'en', 'core_Currency_ISO', 'ISO Code', 0),
('settings', 'en', 'core_Currency_Format', 'Output format, <strong><tt>{}</tt></strong> will be replaced with value', 0),
('settings', 'en', 'core_Currency_Symbol', 'Symbol', 0),
('settings', 'en', 'model_Estimate_Marker', 'Marker image', 0),
('settings', 'en', 'core_Currency_Decimals', 'Decimals', 0),
('settings', 'en', 'model_Daylight_Average', 'Calculation method for irradiation average', 0),
('settings', 'en', 'model_Daylight_CurveDays', 'Build average over the last ? days', 0),
('settings', 'en', 'model_Daylight_ZenitIcon', 'Sun zenit marker image', 0),
('settings', 'en', 'controller_Weather_APIkey', 'Wunderground API key', 0),
('settings', 'en', 'model_Daylight_SunsetIcon', 'Sunset marker image', 0),
('settings', 'en', 'model_History_AverageDays', 'Build average over the last ? days', 0),
('settings', 'en', 'controller_Index_NotifyAll', 'Notify overall loading time for all channels', 0),
('settings', 'en', 'model_Daylight_SunriseIcon', 'Sunrise marker image', 0),
('settings', 'en', 'controller_Index_ChartHeight', 'Default chart height', 0),
('settings', 'en', 'controller_Tariff_TimesLines', 'Initial times lines for each taiff', 0),
('settings', 'en', 'controller_Mobile_ChartHeight', 'Default chart height', 0),
('settings', 'en', 'controller_Index_PresetPeriods', 'Default periods for day/week/month/year buttons (separated by semicolon)', 0),
('settings', 'en', 'controller_Lists_PresetPeriods', 'Default periods for day/week/month/year buttons (separated by semicolon)', 0),
('code_set', 'de', 'settings', 'Einstellungen', 0),
('code_set', 'en', 'settings', 'Settings', 103),
('app', 'de', 'Hour', 'Stunde', 0),
('app', 'en', 'Hour', 'Hour', 0),
('app', 'de', 'DecimalsForMarkers', 'Dezimalstellen für Punkt-Beschriftungen', 0),
('app', 'en', 'DecimalsForMarkers', 'Decimals for marker texts', 0),
('app', 'de', 'ScatterChart', 'Punkte', 0),
('app', 'en', 'ScatterChart', 'Scatter', 0),
('app', 'en', 'ScatterCharts', 'Scatter chart', 0),
('app', 'de', 'ScatterCharts', 'Streudiagramm', 0),
('app', 'de', 'yAxisChannel', 'Kanal für die Y-Achse', 0),
('app', 'en', 'yAxisChannel', 'Channel for Y axis', 0),
('app', 'de', 'xAxisChannel', 'Kanal für die X-Achse', 0),
('app', 'en', 'xAxisChannel', 'Channel for X axis', 0),
('app', 'de', 'PutBarsToStackInSameStack', 'Um Balken zu stapeln, gib allen Balken eines Stapels die gleiche Stapel-Nummer oder -Name', 0),
('app', 'en', 'PutBarsToStackInSameStack', 'To stack bars give all bars of ohne stack the same stack number or name', 0),
('app', 'de', 'BarStack', 'Balkenstapel', 0),
('app', 'en', 'BarStack', 'Bar stack', 0),
('app', 'de', 'Year', 'Jahr', 0),
('app', 'en', 'Year', 'Year', 0),
('app', 'de', 'Week', 'Woche', 0),
('app', 'en', 'Week', 'Week', 0),
('app', 'de', 'YearsToReadMissing', 'Wenn Du plus/minus Tage definiert hast, müssen auch die zu lesenden Jahre angeben werden', 0),
('app', 'en', 'YearsToReadMissing', 'If you defined plus/minus days, the count of years to read is required', 0),
('model', 'de', 'History_extraHint', 'Wenn plus/minus Tage angegeben sind, wieviele Jahre sollen ausgewertet werden', 0),
('model', 'en', 'History_extraHint', 'If plus/minus days defined, how many years back should be read', 0),
('model', 'en', 'History_valid_toHint', 'These are number of days to fetch foreward.\r\n(0 = until today)\r\nA value greater 0 means reading last ? years * (backward + foreward days)!', 0),
('model', 'de', 'History_extra', 'Jahre', 0),
('model', 'en', 'History_extra', 'Years', 0);
