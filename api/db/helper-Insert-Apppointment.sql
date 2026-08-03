-- =============================================================================
-- Helper: Bulk-insert "blocked by admin" appointments over a range of dates
-- =============================================================================
-- Blocks whole days (10:00 -> 19:00) so no customer can book them.
-- Adjust the range, time window and customer info in the `params` block below.
--
-- Usage (Supabase SQL Editor / psql):
--   1. Edit the values inside the `params` CTE.
--   2. Run the whole script.
-- =============================================================================

WITH params AS (
    SELECT
        DATE '2026-09-07'              AS start_date,        -- first day to block (inclusive)
        DATE '2026-09-07'              AS end_date,          -- last day to block (inclusive)
        TIME '10:00:00'                AS block_start_time,  -- daily block start
        TIME '19:00:00'                AS block_end_time,    -- daily block end
        'blocked by admin'             AS notes,
        'completed'                    AS status,
        'Mary'                         AS customer_name,
        'Oak'                          AS customer_lastname,
        '4387799199'                   AS customer_telephone,
        'mariyam.vokalistka@gmail.com' AS customer_email,
        0.00                           AS total_price,
        TRUE                          AS skip_weekends      -- set TRUE to skip Sat/Sun
)
INSERT INTO "public"."appointments" (
    "id",
    "appointment_date",
    "appointment_time",
    "end_time",
    "notes",
    "status",
    "customer_name",
    "customer_lastname",
    "customer_telephone",
    "customer_email",
    "total_price",
    "total_duration_minutes",
    "created_at",
    "updated_at"
)
SELECT
    gen_random_uuid(),
    d::date,
    p.block_start_time,
    p.block_end_time,
    p.notes,
    p.status,
    p.customer_name,
    p.customer_lastname,
    p.customer_telephone,
    p.customer_email,
    p.total_price,
    (EXTRACT(EPOCH FROM (p.block_end_time - p.block_start_time)) / 60)::int,
    current_timestamp,
    current_timestamp
FROM params p
CROSS JOIN generate_series(p.start_date, p.end_date, INTERVAL '1 day') AS d
WHERE (NOT p.skip_weekends OR EXTRACT(ISODOW FROM d) < 6)   -- ISODOW: 6 = Sat, 7 = Sun
  -- Avoid double-blocking a day that already has this exact block
  AND NOT EXISTS (
      SELECT 1
      FROM "public"."appointments" a
      WHERE a.appointment_date = d::date
        AND a.appointment_time = p.block_start_time
        AND a.notes = p.notes
  );