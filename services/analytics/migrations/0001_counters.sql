-- 独立互动数据库；不改动会议和城市静态数据。
CREATE TABLE IF NOT EXISTS analytics_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT OR IGNORE INTO analytics_metadata (key, value)
VALUES ('started_at', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

CREATE TABLE IF NOT EXISTS analytics_counters (
  metric TEXT NOT NULL CHECK (metric IN ('support','expectation','conference','city')),
  entity_id TEXT NOT NULL,
  total INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0),
  updated_at TEXT NOT NULL,
  PRIMARY KEY (metric, entity_id)
);
CREATE TABLE IF NOT EXISTS analytics_events (
  event_id TEXT PRIMARY KEY,
  metric TEXT NOT NULL CHECK (metric IN ('support','expectation','conference','city')),
  entity_id TEXT NOT NULL,
  received_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS analytics_events_received ON analytics_events(received_at);
-- 唯一事件插入与总数累加在同一 SQL 事务中完成；重复 event_id 不触发累加。
CREATE TRIGGER IF NOT EXISTS analytics_count_event
AFTER INSERT ON analytics_events
BEGIN
  INSERT INTO analytics_counters (metric, entity_id, total, updated_at)
  VALUES (NEW.metric, NEW.entity_id, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  ON CONFLICT(metric, entity_id) DO UPDATE SET
    total = total + 1,
    updated_at = excluded.updated_at;
END;
