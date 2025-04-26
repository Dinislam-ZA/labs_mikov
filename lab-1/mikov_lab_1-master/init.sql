-- Удаление таблиц в правильном порядке
DROP TABLE IF EXISTS PLAN_VYP;
DROP TABLE IF EXISTS VKHODIM;
DROP TABLE IF EXISTS NORMY;
DROP TABLE IF EXISTS IZDEL;
DROP TABLE IF EXISTS DETALI;
DROP TABLE IF EXISTS MATER;

-------------------------------------------------
-- 1. Таблица материалов
CREATE TABLE IF NOT EXISTS MATER (
  SHIFR_MAT TEXT PRIMARY KEY,
  NAZV_MAT TEXT NOT NULL,
  ED_IZM TEXT,
  TSENA REAL,
  INTERV_POST INTEGER,
  VREMYA_VYPOL INTEGER
);

-- Вставка данных в таблицу MATER
INSERT INTO MATER (SHIFR_MAT, NAZV_MAT, ED_IZM, TSENA, INTERV_POST, VREMYA_VYPOL) VALUES
  ('M1', 'сталь',   'кг', 23, 3, 2),
  ('M2', 'чугун',   'кг', 12, 4, 1),
  ('M3', 'железо',  'кг', 15, 3, 2);

-------------------------------------------------
-- 2. Таблица деталей
CREATE TABLE IF NOT EXISTS DETALI (
  SHIFR_DET TEXT PRIMARY KEY,
  NAZV_DET TEXT NOT NULL,
  ED_IZM TEXT
);

-- Вставка данных в таблицу DETALI
INSERT INTO DETALI (SHIFR_DET, NAZV_DET, ED_IZM) VALUES
  ('D1', 'втулка', 'шт.'),
  ('D2', 'фланец', 'шт.'),
  ('D3', 'палец',  'шт.');

-------------------------------------------------
-- 3. Таблица изделий
CREATE TABLE IF NOT EXISTS IZDEL (
  SHIFR_IZD TEXT PRIMARY KEY,
  NAZV TEXT NOT NULL,
  ED_IZM TEXT
);

-- Вставка данных в таблицу IZDEL
INSERT INTO IZDEL (SHIFR_IZD, NAZV, ED_IZM) VALUES
  ('I1', 'Изделие 1', 'шт.'),
  ('I2', 'Изделие 2', 'шт.');

-------------------------------------------------
-- 4. Таблица норм расхода материалов на детали
CREATE TABLE IF NOT EXISTS NORMY (
  SHIFR_MAT TEXT,
  SHIFR_DET TEXT,
  ED_IZM TEXT,
  NAZV TEXT,
  NORMA_RASX REAL,
  PRIMARY KEY (SHIFR_MAT, SHIFR_DET),
  FOREIGN KEY (SHIFR_MAT) REFERENCES MATER(SHIRF_MAT),
  FOREIGN KEY (SHIFR_DET) REFERENCES DETALI(SHIRF_DET)
);

-- Вставка данных в таблицу NORMY
INSERT INTO NORMY (SHIFR_MAT, SHIFR_DET, ED_IZM, NAZV, NORMA_RASX) VALUES
  ('M1', 'D1', 'кг/шт.', 'норма', 2.1),
  ('M1', 'D2', 'кг/шт.', 'норма', 1.8),
  ('M2', 'D1', 'кг/шт.', 'норма', 3.4),
  ('M2', 'D3', 'кг/шт.', 'норма', 4.3),
  ('M3', 'D2', 'кг/шт.', 'норма', 1.5),
  ('M3', 'D3', 'кг/шт.', 'норма', 3.7);

-------------------------------------------------
-- 5. Таблица включения деталей в изделие с учетом количества деталей (KOLICH)
CREATE TABLE IF NOT EXISTS VKHODIM (
  SHIFR_DET TEXT,
  SHIFR_IZD TEXT,
  ED_IZM TEXT,
  KOLICH INTEGER,  -- количество деталей, входящих в изделие
  PRIMARY KEY (SHIFR_DET, SHIFR_IZD),
  FOREIGN KEY (SHIFR_DET) REFERENCES DETALI(SHIRF_DET),
  FOREIGN KEY (SHIFR_IZD) REFERENCES IZDEL(SHIRF_IZD)
);

-- Вставка данных в таблицу VKHODIM
INSERT INTO VKHODIM (SHIFR_DET, SHIFR_IZD, ED_IZM, KOLICH) VALUES
  ('D1', 'I1', 'шт./изд.', 7),
  ('D2', 'I1', 'шт./изд.', 9),
  ('D2', 'I2', 'шт./изд.', 8),
  ('D3', 'I2', 'шт./изд.', 5);

-------------------------------------------------
-- 6. Таблица плана выпуска изделий (количество изделий)
CREATE TABLE IF NOT EXISTS PLAN_VYP (
  DEN INTEGER,      -- номер дня
  SHIFR_IZD TEXT,
  KOLICH INTEGER,    -- количество изделий
  PRIMARY KEY (DEN, SHIFR_IZD),
  FOREIGN KEY (SHIFR_IZD) REFERENCES IZDEL(SHIRF_IZD)
);

-- Вставка данных в таблицу PLAN_VYP
-- План для изделия I1 (дни 1-25)
INSERT INTO PLAN_VYP (DEN, SHIFR_IZD, KOLICH) VALUES
  (1, 'I1', 7),
  (2, 'I1', 11),
  (3, 'I1', 8),
  (4, 'I1', 9),
  (5, 'I1', 12),
  (6, 'I1', 13),
  (7, 'I1', 9),
  (8, 'I1', 7),
  (9, 'I1', 7),
  (10, 'I1', 11),
  (11, 'I1', 14),
  (12, 'I1', 8),
  (13, 'I1', 11),
  (14, 'I1', 4),
  (15, 'I1', 7),
  (16, 'I1', 5),
  (17, 'I1', 8),
  (18, 'I1', 9),
  (19, 'I1', 10),
  (20, 'I1', 14),
  (21, 'I1', 17),
  (22, 'I1', 12),
  (23, 'I1', 11),
  (24, 'I1', 10),
  (25, 'I1', 8);

-- План для изделия I2 (дни 1-25)
INSERT INTO PLAN_VYP (DEN, SHIFR_IZD, KOLICH) VALUES
  (1, 'I2', 5),
  (2, 'I2', 12),
  (3, 'I2', 8),
  (4, 'I2', 7),
  (5, 'I2', 4),
  (6, 'I2', 3),
  (7, 'I2', 15),
  (8, 'I2', 4),
  (9, 'I2', 8),
  (10, 'I2', 7),
  (11, 'I2', 4),
  (12, 'I2', 20),
  (13, 'I2', 25),
  (14, 'I2', 14),
  (15, 'I2', 11),
  (16, 'I2', 10),
  (17, 'I2', 15),
  (18, 'I2', 5),
  (19, 'I2', 7),
  (20, 'I2', 10),
  (21, 'I2', 8),
  (22, 'I2', 4),
  (23, 'I2', 12),
  (24, 'I2', 15),
  (25, 'I2', 18);
