-- Seed users --
INSERT 
  INTO `users` (`id`, `state`, `username`) 
  VALUES 
  -- First user --
    ('01J4CVMYB187SCAPZTS7Z9XXXZ', 'COMPLETE', 'Testing');

-- Seed puzzles --
INSERT
  INTO `puzzles` (`id`, `difficulty`, `max_attempts`, `user_id`)
  VALUES 
  -- First puzzle --
    ('01J4CTP7K48Y424NJVCS82G15R', 'EASY', 6, '01J4CVMYB187SCAPZTS7Z9XXXZ'),
  -- Second puzzle --
    ('01J7F0DACH0M4N4S05K7892FTS', 'HARD', 12, '01J4CVMYB187SCAPZTS7Z9XXXZ');

-- Seed puzzle groups --
INSERT
  INTO `puzzle_groups` (`id`, `description`, `puzzle_id`)
  VALUES 
  -- First puzzle groups --
    ('01J4CTSVYFZYXMMJG2HKDVRXHN', 'Slang for mouth.', '01J4CTP7K48Y424NJVCS82G15R'),
    ('01J4CV2RN890NJVEPTX8KWN863', 'Round of _____', '01J4CTP7K48Y424NJVCS82G15R'),
    ('01J4CVAE95Q32NGBDSE1PGK08E', 'Deli bread options', '01J4CTP7K48Y424NJVCS82G15R'),
    ('01J4CVFHE0P5M415HYMNF6MWKG', 'Keep rhythm with music', '01J4CTP7K48Y424NJVCS82G15R'),
  -- Second puzzle groups --
    ('01J7F0FTXTQ7946G7S2JSBRGK0', 'Can be represented as "C".', '01J7F0DACH0M4N4S05K7892FTS'),
    ('01J7F0H12BGF0RDGVYTN0EQGZ2', 'Related to "cease": To "cease" is to come to an end, "Cease" and desist, To cancel something is to "cease" it, and, "Cease" fire.', '01J7F0DACH0M4N4S05K7892FTS'),
    ('01J7F0H5FN7HD9QZWHCWADH6SR', 'Related to "see": "See" Saw, "See" You Again, To Catch a Glimpse is to "see", and, Glasses help you "see".', '01J7F0DACH0M4N4S05K7892FTS'),
    ('01J7F0H97TBPNZR9XMHXMTEJ4N', 'All are seas of the World Ocean.', '01J7F0DACH0M4N4S05K7892FTS');


-- Seed puzzle blocks --
INSERT
  INTO `puzzle_blocks` (`id`, `value`, `puzzle_group_id`)
  VALUES
  -- First puzzle blocks --
  -- Group 1 --
    ('01J4CTVAZEJJH172HXQYY2QPBV', 'TRAP', '01J4CTSVYFZYXMMJG2HKDVRXHN'),
    ('01J4CTX4T8TH9RK9SR1RJY0VFN', 'YAP', '01J4CTSVYFZYXMMJG2HKDVRXHN'),
    ('01J4CTXCRJACVTK31R3SAMKMM3', 'CHOPS', '01J4CTSVYFZYXMMJG2HKDVRXHN'),
    ('01J4CTXJ9WG9TCNH9MFCYHPYVR', 'KISSER', '01J4CTSVYFZYXMMJG2HKDVRXHN'),
  -- Group 2 --
    ('01J4CV80YYX9BA0GBWAV7QGH7P', 'FUNDING', '01J4CV2RN890NJVEPTX8KWN863'),
    ('01J4CV83F631E7MPDQ14G0TBKX', 'GOLF', '01J4CV2RN890NJVEPTX8KWN863'),
    ('01J4CV846445F9YWVC7QD5C899', 'DRINKS', '01J4CV2RN890NJVEPTX8KWN863'),
    ('01J4CV84RBB7V33WZ2DXRHEAB8', 'APPLAUSE', '01J4CV2RN890NJVEPTX8KWN863'),
  -- Group 3 --
    ('01J4CVBFSFZQ3S0HN4YSYDC16Z', 'WRAP', '01J4CVAE95Q32NGBDSE1PGK08E'),
    ('01J4CVBH7QW6VH1YMN79VCPRWB', 'BUN', '01J4CVAE95Q32NGBDSE1PGK08E'),
    ('01J4CVBJ87SGTSGTP57BKCXRYM', 'HERO', '01J4CVAE95Q32NGBDSE1PGK08E'),
    ('01J4CVBKD7T0ME7NK0G78RQR2D', 'ROLL', '01J4CVAE95Q32NGBDSE1PGK08E'),
  -- Group 4 --
    ('01J4CVGYH73QG4WF8ND9AN075B', 'SNAP', '01J4CVFHE0P5M415HYMNF6MWKG'),
    ('01J4CVGZ0F585PVGK4YWHJ9GBS', 'CLAP', '01J4CVFHE0P5M415HYMNF6MWKG'),
    ('01J4CVGZFME50XJQB3RNHS8E08', 'BOB', '01J4CVFHE0P5M415HYMNF6MWKG'),
    ('01J4CVGZZJWM970GQZNZ64JJHA', 'TAP', '01J4CVFHE0P5M415HYMNF6MWKG'),
  -- Second puzzle blocks --
  -- Group 1 --
    ('01J7F0T1WCG59SK271YZXAFMDG', 'Speed of light', '01J7F0FTXTQ7946G7S2JSBRGK0'),
    ('01J7F0T7N46VRN516RSXXH61XE', 'Celsius', '01J7F0FTXTQ7946G7S2JSBRGK0'),
    ('01J7F0TCTMRSXZ5YS7YZZ017XT', 'Programming language', '01J7F0FTXTQ7946G7S2JSBRGK0'),
    ('01J7F0TH4PH7J8GMWTJ59AVZVN', 'Carbon', '01J7F0FTXTQ7946G7S2JSBRGK0'),
  -- Group 2 --
    ('01J7F0TP5B40MKHWZZH4GD6CED', 'Desist', '01J7F0H12BGF0RDGVYTN0EQGZ2'),
    ('01J7F0TSP3M27KXDFHXXHZT86D', 'End', '01J7F0H12BGF0RDGVYTN0EQGZ2'),
    ('01J7F0TYE8N7V93V9F67YV8XJJ', 'Fire', '01J7F0H12BGF0RDGVYTN0EQGZ2'),
    ('01J7F0V26EPTEFCH7J2YBPVDSG', 'Cancel', '01J7F0H12BGF0RDGVYTN0EQGZ2'),
  -- Group 3 --
    ('01J7F0V6DK9W1HV4RQHV74ZTK4', 'Saw', '01J7F0H5FN7HD9QZWHCWADH6SR'),
    ('01J7F0VAH0GN68MAHYKC9T819G', 'You again', '01J7F0H5FN7HD9QZWHCWADH6SR'),
    ('01J7F0VEJDH2PGENRTDY50B8J0', 'Catch a glimpse', '01J7F0H5FN7HD9QZWHCWADH6SR'),
    ('01J7F0VJRZ6RDTJRMP8BW90X7G', 'Glasses', '01J7F0H5FN7HD9QZWHCWADH6SR'),
  -- Group 4 --
    ('01J7F0VSCQBFXYTQWQ1XXV921H', 'Bering', '01J7F0H97TBPNZR9XMHXMTEJ4N'),
    ('01J7F0VWTBVQFRQZGG0VGNE7XH', 'Black', '01J7F0H97TBPNZR9XMHXMTEJ4N'),
    ('01J7F0W0CC5NC95KVAM7N35GVE', 'Red', '01J7F0H97TBPNZR9XMHXMTEJ4N'),
    ('01J7F0W4BG96M13R1NQBXP0BF0', 'Caspian', '01J7F0H97TBPNZR9XMHXMTEJ4N');

-- Seed puzzle likes --
INSERT INTO `puzzle_likes` (`id`, `puzzle_id`, `user_id`)
  VALUES 
  -- First puzzle likes --
    ('01J7H9EM3CSEMW0VMG5KCRNCWF', '01J4CTP7K48Y424NJVCS82G15R', '01J4CVMYB187SCAPZTS7Z9XXXZ'),
  -- Second puzzle likes --
    ('01J7HCXQC4Q0TA2C5PTS9RSSG2', '01J4CTP7K48Y424NJVCS82G15R', '01J78GEQ9RMWZ7W7FPZNGNNT2J');

-- Seed game --
INSERT INTO `games` (`id`, `score`, `challenge_code`, `puzzle_id`, `user_id`)
  VALUES 
  -- First game --
      ('01J7HD11F1DAM7FKHBTD268ZVW', 0, '01J7HD0WGMD7TDRHN0SJBQ7QPN', '01J4CTP7K48Y424NJVCS82G15R', '01J78GEQ9RMWZ7W7FPZNGNNT2J'),
  -- Second game --
      ('01J7H45J702Z4RRPY9SRZWW8K8', 0, '01J7H46C331EDPSHHAF2355200', '01J7F0DACH0M4N4S05K7892FTS', '01J78GEQ9RMWZ7W7FPZNGNNT2J');

-- Seed game correct --
INSERT INTO `game_corrects` (`id`, `puzzle_group_id`, `game_id`)
  VALUES
    -- First game corrects --
      ('01J7PFEXRDNZ2YCMXTMWA7QSJ1', '01J4CTP7K48Y424NJVCS82G15R', '01J7HD11F1DAM7FKHBTD268ZVW');
