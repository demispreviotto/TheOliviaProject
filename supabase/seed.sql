-- ##########################################
-- SEED.SQL - Datos de prueba para The Olivia Project
-- ##########################################

DO $$ 
DECLARE
    user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- 1. Insertar en auth.users (Igual que antes)
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (
        user_id, '00000000-0000-0000-0000-000000000000', 'admin@theoliviaproject.com', 
        crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated',
        '{"provider":"email","providers":["email"]}', '{"full_name": "Admin Olivia"}', 
        now(), now(), '', '', '', ''
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Insertar en auth.identities (CORREGIDO)
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        user_id,
        format('{"sub":"%s","email":"%s"}', user_id, 'admin@theoliviaproject.com')::jsonb,
        'email',
        user_id, -- <--- AQUÍ ESTABA EL ERROR: provider_id debe ser el ID del usuario para el provider 'email'
        now(),
        now(),
        now()
    ) ON CONFLICT (provider, provider_id) DO NOTHING;

-- 2. POBLAR CLIENTES (Ponemos los IDs a mano)
    INSERT INTO public.customers (id, category, full_name, company_name, phone, email, delivery_address)
    VALUES 
    ('a1111111-1111-1111-1111-111111111111', 'individual', 'Juan Pérez', NULL, '1122334455', 'juan@email.com', 'Calle Falsa 123, CABA'),
    ('b2222222-2222-2222-2222-222222222222', 'wholesale', 'Café Central', 'Central Coffee SRL', '1155667788', 'contacto@cafecentral.com', 'Av. Santa Fe 2000, CABA')
    ON CONFLICT (id) DO NOTHING;


    -- 3. POBLAR PRODUCTOS
    INSERT INTO public.products (id, product_name, product_category, presentation, wholesale_price, retail_price)
    VALUES 
    ('c3333333-3333-3333-3333-333333333333', 'Budín de Pera', 'budin', 'Grande 500g', 800.00, 1200.00),
    ('d4444444-4444-4444-4444-444444444444', 'Pepas de Membrillo', 'pepas', 'Bolsa x 12 unidades', 500.00, 900.00)
    ON CONFLICT (id) DO NOTHING;


    -- 4. POBLAR UN PEDIDO (Venta de Juan Pérez)
    -- Usamos el ID de Juan: 'a1111111...'
    INSERT INTO public.orders (id, customer_id, order_status, delivery_mode, payment_state, delivery_date, total_price)
    VALUES 
    ('e5555555-5555-5555-5555-555555555555', 'a1111111-1111-1111-1111-111111111111', 'pending', 'delivery', 'pending', current_date + interval '2 days', 2100.00)
    ON CONFLICT (id) DO NOTHING;


    -- 5. DETALLE DEL PEDIDO
    -- Vinculamos al pedido 'e5555...' y al producto 'c3333...' (Budín)
    INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, discount_amount, notes)
    VALUES 
    ('e5555555-5555-5555-5555-555555555555', 'c3333333-3333-3333-3333-333333333333', 2, 1200.00, 300.00, 'Promo inicial')
    ON CONFLICT DO NOTHING;

END $$;