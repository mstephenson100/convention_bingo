CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `locked` tinyint DEFAULT '0',
  `avatar` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_bingo_cards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `row` int NOT NULL,
  `col` int NOT NULL,
  `box_id` int NOT NULL,
  `image_path` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_card_square` (`user_id`,`row`,`col`),
  KEY `box_id` (`box_id`),
  CONSTRAINT `user_bingo_cards_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_bingo_cards_ibfk_2` FOREIGN KEY (`box_id`) REFERENCES `bingo_boxes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4012 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `bingo_boxes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


INSERT INTO bingo_boxes (label) VALUES
('Spot a cosplay of your favorite character'),
('Attend a panel'),
('Take a selfie with a stranger'),
('Buy something from the vendor hall'),
('Get a badge ribbon'),
('Join a photoshoot'),
('See a group cosplay'),
('Wear a costume'),
('Lose your voice'),
('Make a new friend'),
('Trade pins or swag'),
('Visit the gaming hall'),
('Dance at a party'),
('See someone in a wingsuit'),
('Get a picture with a celebrity'),
('Hear someone quote Star Wars'),
('Watch a live performance'),
('Find someone in chainmail'),
('Eat food from a truck'),
('Get lost in a hotel'),
('Attend a midnight panel'),
('Spot a fursuiter'),
('Find someone asleep in public'),
('Witness a marriage proposal'),
('Get your badge signed'),
('Find a D&D shirt'),
('Drink something themed'),
('Take the wrong elevator'),
('See a mashup costume'),
('Run into an old friend'),
('Do a group chant'),
('Find someone juggling'),
('See a TARDIS'),
('Win a raffle or prize'),
('Spot a homestuck cosplayer'),
('Get a high five'),
('Watch a costume malfunction'),
('Ride an escalator in cosplay'),
('Take a nap in a hallway'),
('Help someone with directions'),
('Attend a workshop'),
('See a critical role cosplay'),
('Join a parade'),
('Visit the art show'),
('Find someone from another country'),
('Lose your phone signal'),
('Say “Is it Sunday yet?”'),
('Wear a con shirt from a past year'),
('See a Klingon'),
('Sing karaoke');

