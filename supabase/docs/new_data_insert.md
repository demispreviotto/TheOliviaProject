Listo. Para usarlo:      

  1. Completar .env.local con la service role key local:                                                                                                                                   npx supabase status
  # Copiar el valor de "service_role key" → SUPABASE_LOCAL_SERVICE_ROLE_KEY                                                                                                              
  
  2. Ejecutar:
  # Local
  node supabase/load-products.mjs --local

  # Remoto (completar SUPABASE_REMOTE_URL y SUPABASE_REMOTE_SERVICE_ROLE_KEY antes)
    node supabase/load-products.mjs --remote --sql
    +
    pegar query generada en SQL EDITOR. 