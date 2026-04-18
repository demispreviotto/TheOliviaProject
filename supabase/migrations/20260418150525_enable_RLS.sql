-- ##########################################
-- 8. PERMISOS DE API (GRANT USAGE)
-- ##########################################
-- Esto asegura que la API pueda acceder a las tablas y secuencias
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;