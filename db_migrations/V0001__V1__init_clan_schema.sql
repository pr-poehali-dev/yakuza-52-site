CREATE TABLE t_p6853430_yakuza_52_site.players (
  id SERIAL PRIMARY KEY,
  login VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(100) UNIQUE NOT NULL,
  standoff_id VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'recruit',
  points INTEGER NOT NULL DEFAULT 0,
  kills INTEGER NOT NULL DEFAULT 0,
  deaths INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  bio TEXT,
  region VARCHAR(100),
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p6853430_yakuza_52_site.tournaments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time_start VARCHAR(10) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT '5v5',
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming',
  max_participants INTEGER NOT NULL DEFAULT 10,
  prize VARCHAR(200),
  created_by INTEGER REFERENCES t_p6853430_yakuza_52_site.players(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p6853430_yakuza_52_site.tournament_registrations (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES t_p6853430_yakuza_52_site.tournaments(id),
  player_id INTEGER NOT NULL REFERENCES t_p6853430_yakuza_52_site.players(id),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id, player_id)
);

CREATE TABLE t_p6853430_yakuza_52_site.chat_rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p6853430_yakuza_52_site.messages (
  id SERIAL PRIMARY KEY,
  chat_room_id INTEGER NOT NULL REFERENCES t_p6853430_yakuza_52_site.chat_rooms(id),
  player_id INTEGER NOT NULL REFERENCES t_p6853430_yakuza_52_site.players(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p6853430_yakuza_52_site.sessions (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES t_p6853430_yakuza_52_site.players(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO t_p6853430_yakuza_52_site.players (login, password_hash, nickname, standoff_id, role, joined_at) VALUES ('213302202', '3c24e3c74f2ced06e34de3b3a62e1cb3f1f71a1e46c05d5e0aa4a50e9a765e44', 'Yakudza_Owner', 'SO2-213302', 'owner', CURRENT_DATE);

INSERT INTO t_p6853430_yakuza_52_site.chat_rooms (name, type) VALUES ('Общий чат', 'general'), ('Турнирный чат', 'tournament'), ('Тактика и стратегия', 'general');
