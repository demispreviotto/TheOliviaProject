-- supabase/seed.sql
-- ##########################################
-- SEED.SQL - Datos de prueba para The Olivia Project
-- ##########################################

DO $$
DECLARE
    user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- 1. AUTH: usuario administrador
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (
        user_id, '00000000-0000-0000-0000-000000000000', 'admin@theoliviaproject.com',
        crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated',
        '{"provider":"email","providers":["email"]}', '{"full_name": "Admin Olivia"}',
        now(), now(), '', '', '', ''
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
        gen_random_uuid(), user_id,
        format('{"sub":"%s","email":"%s"}', user_id, 'admin@theoliviaproject.com')::jsonb,
        'email', user_id, now(), now(), now()
    ) ON CONFLICT (provider, provider_id) DO NOTHING;

    INSERT INTO public.profiles (id, full_name, role)
    VALUES (user_id, 'Admin Olivia', 'admin')
    ON CONFLICT (id) DO NOTHING;

    -- 2. CLIENTES
    INSERT INTO public.customers (id, category, full_name, company_name, phone, email, delivery_address)
    VALUES
    ('a1111111-1111-1111-1111-111111111111', 'individual', 'Juan Pérez',    NULL,                '1122334455', 'juan@email.com',              'Calle Falsa 123, CABA'),
    ('b2222222-2222-2222-2222-222222222222', 'wholesale',  'Café Central',  'Central Coffee SRL','1155667788', 'contacto@cafecentral.com',    'Av. Santa Fe 2000, CABA')
    ON CONFLICT (id) DO NOTHING;

    -- 3. PRODUCTOS
    INSERT INTO public.products (variety, product_category, unit, grams, retail_price, wholesale_price)
    VALUES
    -- Budín integral
    ('Pera con chocolate',              'budin_integral',   1, 570,    8400,  7170),
    ('Pera con chocolate',              'budin_integral',   1, 360,       0,  4770),
    ('Cítrico con frutos secos',        'budin_integral',   1, 570,    8400,  7170),
    ('Cítrico con frutos secos',        'budin_integral',   1, 360,       0,  4770),
    ('Zanahoria con nuez',              'budin_integral',   1, 570,    8400,  7170),
    ('Zanahoria con nuez',              'budin_integral',   1, 360,       0,  4770),
    ('Limón con frutos rojos',          'budin_integral',   1, 570,    8400,  7170),
    ('Limón con frutos rojos',          'budin_integral',   1, 360,       0,  4770),
    ('Banana, almendras y chips',       'budin_integral',   1, 570,    8400,  7170),
    ('Banana, almendras y chips',       'budin_integral',   1, 360,       0,  4770),
    ('Manzana con frutos secos',        'budin_integral',   1, 570,    8400,  7170),
    ('Manzana con frutos secos',        'budin_integral',   1, 360,       0,  4770),
    ('Naranja, castañas y arándanos',   'budin_integral',   1, 570,    8400,  7170),
    ('Naranja, castañas y arándanos',   'budin_integral',   1, 360,       0,  4770),
    ('Varios',                          'budin_integral',   1, 570,       0,  7170),
    ('Varios',                          'budin_integral',   1, 360,       0,  4770),
    -- Budín avena
    ('Manzana y nuez',                  'budin_avena',      1, 570,    6400,  4770),
    ('Chips de chocolate',              'budin_avena',      1, 360,    6400,  4770),
    ('Naranja y frutas secas',          'budin_avena',      1, 570,    6400,  4770),
    ('Arándanos y chocolate blanco',    'budin_avena',      1, 360,    6400,  4770),
    -- Pepas
    ('Membrillo',                       'pepas',           10, NULL,   4050,  3450),
    ('Membrillo',                       'pepas',            5, NULL,      0,  1750),
    ('Batata',                          'pepas',           10, NULL,   4050,  3450),
    ('Batata',                          'pepas',            5, NULL,      0,  1750),
    ('Dulce de leche',                  'pepas',           10, NULL,   4050,  3450),
    ('Dulce de leche',                  'pepas',            5, NULL,      0,  1750),
    -- Cookies
    ('Chips',                           'cookies',         10, NULL,   4050,  3450),
    ('Chips',                           'cookies',          5, NULL,      0,  1750),
    -- Galletitas
    ('Algarroba y naranja',             'galletitas',      10, NULL,   4050,  3450),
    ('Algarroba y naranja',             'galletitas',       5, NULL,      0,  1750),
    ('Limón',                           'galletitas',      10, NULL,   4050,  3450),
    ('Limón',                           'galletitas',       5, NULL,      0,  1750),
    -- Cookies XL
    ('Chocolate y nuez',                'cookies_xl',       2, NULL,      0,  2700),
    ('Chocolate y nuez',                'cookies_xl',       4, NULL,   5600,     0),
    ('Frutos secos',                    'cookies_xl',       2, NULL,      0,  2700),
    ('Frutos secos',                    'cookies_xl',       4, NULL,   5600,     0),
    -- Alfajores
    ('Algarroba y almendras',           'alfajores',        2, NULL,      0,  2860),
    ('Algarroba y almendras',           'alfajores',        4, NULL,   6300,     0),
    ('Nuez',                            'alfajores',        2, NULL,      0,  2860),
    ('Nuez',                            'alfajores',        4, NULL,   6300,     0),
    -- Pan, Talitas, Galleta marinera, Torta
    ('Multisemillas',                   'pan',              1, 800,    6300,  4100),
    ('Talitas',                         'talitas',          1, 120,    4000,  2950),
    ('Galleta marinera',                'galleta_marinera', 1, 120,    4000,  2950),
    ('Avena',                           'torta',            1, NULL,      0,  3740);

    -- 4. PEDIDO DE PRUEBA (Juan Pérez)
    INSERT INTO public.orders (id, customer_id, order_status, delivery_mode, payment_state, delivery_date, total_price)
    VALUES ('e5555555-5555-5555-5555-555555555555', 'a1111111-1111-1111-1111-111111111111', 'pending', 'delivery', 'pending', current_date + interval '2 days', 16800.00)
    ON CONFLICT (id) DO NOTHING;

    -- 5. ÍTEM DEL PEDIDO (referencia por subquery, no por ID hardcodeado)
    INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, discount_amount, notes)
    SELECT
        'e5555555-5555-5555-5555-555555555555',
        id,
        2,
        8400.00,
        0.00,
        'Pedido de prueba'
    FROM public.products
    WHERE variety = 'Pera con chocolate' AND product_category = 'budin_integral' AND grams = 570
    LIMIT 1;

END $$;
