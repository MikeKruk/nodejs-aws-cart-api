INSERT INTO carts (id, user_id, status) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'OPEN'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ORDERED');

INSERT INTO cart_items (cart_id, product_id, count) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '5156c8f1-f30f-494d-b093-943c7b2c77f8', 2),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '5256f8f1-f30f-494d-b093-943c7b2c77f8', 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '5356d8f1-f30f-494d-b093-943c7b2c77f8', 3),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '5456b8f1-f30f-494d-b093-943c7b2c77f8', 2);