
--psql

-- ===========================
--  TABLE USERS
-- ===========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,  -- auto-increment
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- TABLE GAMES
-- ===========================
CREATE TABLE games (
    id SERIAL PRIMARY KEY, 
    host_user_id INT NOT NULL REFERENCES users(id),
    opponent_user_id INT REFERENCES users(id),
    -- pvp ou ia
    mode VARCHAR(10) NOT NULL CHECK (mode IN ('pvp', 'ia')),
    -- IA seulement
    difficulty VARCHAR(10) CHECK (difficulty IN ('easy','medium','hard')),
    -- status d’une partie
    status VARCHAR(15) NOT NULL DEFAULT 'waiting'
        CHECK (status IN ('waiting','in_progress','saved','finished','abandoned')),
    created_at TIMESTAMP DEFAULT NOW(),
    finished_at TIMESTAMP
);

-- ===========================
-- SETTINGS DE PARTIE
-- ===========================
CREATE TABLE game_settings (
    id SERIAL PRIMARY KEY, 
    game_id INT UNIQUE NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    -- Qui commence
    starter_user_id INT REFERENCES users(id),
    player1_color VARCHAR(20),
    player2_color VARCHAR(20)
);

-- ===========================
-- COUPS DE JEU
-- ===========================
CREATE TABLE game_moves (
    id SERIAL PRIMARY KEY, 
    game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id),
    col_index INT NOT NULL CHECK(col_index >= 0),
    row_index INT NOT NULL CHECK(row_index >= 0),
    -- Ordre des coups
    move_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);


-- ===========================
-- RESULTATS
-- ===========================
CREATE TABLE game_results (
    id SERIAL PRIMARY KEY,
    game_id INT UNIQUE NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    winner_user_id INT REFERENCES users(id),
    duration_seconds INT NOT NULL CHECK(duration_seconds >= 0),
    moves_count INT CHECK(moves_count >= 0),
    result VARCHAR(10) NOT NULL CHECK (result IN ('win','loss','draw')),
    created_at TIMESTAMP DEFAULT NOW()
);


--trigger pour incrémenter move_number
CREATE OR REPLACE FUNCTION increment_move_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Si move_number n'est pas fourni
    IF NEW.move_number IS NULL THEN
        NEW.move_number := COALESCE(
            (SELECT MAX(move_number) FROM game_moves WHERE game_id = NEW.game_id), 
            0
        ) + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger sur game_moves
CREATE TRIGGER trg_increment_move_number
BEFORE INSERT ON game_moves
FOR EACH ROW
EXECUTE FUNCTION increment_move_number();



