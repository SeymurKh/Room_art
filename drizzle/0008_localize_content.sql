-- Localize content columns: plain text -> JSON {"en": ..., "az": ""}.
-- Idempotent guard: skip rows already holding JSON objects.
UPDATE `settings`
  SET `address` = json_object('en', `address`, 'az', '')
  WHERE json_valid(`address`) = 0 OR json_type(`address`) != 'object';
--> statement-breakpoint
UPDATE `about`
  SET `concept` = json_object('en', `concept`, 'az', ''),
      `vision` = json_object('en', `vision`, 'az', ''),
      `identity` = json_object('en', `identity`, 'az', '')
  WHERE json_valid(`concept`) = 0 OR json_type(`concept`) != 'object';
--> statement-breakpoint
UPDATE `artists`
  SET `role` = json_object('en', `role`, 'az', ''),
      `bio` = json_object('en', `bio`, 'az', ''),
      `statement` = json_object('en', `statement`, 'az', '')
  WHERE json_valid(`role`) = 0 OR json_type(`role`) != 'object';
--> statement-breakpoint
UPDATE `artworks`
  SET `medium` = json_object('en', `medium`, 'az', ''),
      `description` = json_object('en', `description`, 'az', '')
  WHERE json_valid(`medium`) = 0 OR json_type(`medium`) != 'object';
--> statement-breakpoint
UPDATE `events`
  SET `date` = json_object('en', `date`, 'az', ''),
      `description` = json_object('en', `description`, 'az', '')
  WHERE json_valid(`date`) = 0 OR json_type(`date`) != 'object';
