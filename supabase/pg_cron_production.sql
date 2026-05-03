-- supabase/pg_cron_production.sql
-- Ejecutar UNA SOLA VEZ desde el SQL Editor del Dashboard de Supabase (producción).
-- Requiere que pg_cron esté habilitado: Database → Extensions → pg_cron.
--
-- Este script programa la transición automática pending→cooking a las 00:00 ART.
-- ART = UTC-5, por lo que 00:00 ART = 05:00 UTC.

SELECT cron.schedule(
  'auto-cooking-transition',  -- nombre único del job
  '0 5 * * *',                -- 05:00 UTC = 00:00 ART todos los días
  $$
    SELECT public.transition_items_to_cooking();

$$ );

-- Para verificar que el job quedó registrado:
-- SELECT * FROM cron.job;

-- Para eliminar el job si fuera necesario:
-- SELECT cron.unschedule('auto-cooking-transition');