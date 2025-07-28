-- Insertion de quelques commandes de test
INSERT INTO "Orders" ("CustomerName", "CreatedAt", "Status", "TotalAmount")
VALUES 
('Alice Martin', NOW() - INTERVAL '5 minutes', 0, 15.50),
('Bob Dupont', NOW() - INTERVAL '10 minutes', 1, 8.00),
('Claire Dubois', NOW() - INTERVAL '15 minutes', 3, 12.50);

-- Récupération des IDs des commandes créées
DO $$
DECLARE 
    order1_id INTEGER;
    order2_id INTEGER;
    order3_id INTEGER;
BEGIN
    SELECT "Id" INTO order1_id FROM "Orders" WHERE "CustomerName" = 'Alice Martin';
    SELECT "Id" INTO order2_id FROM "Orders" WHERE "CustomerName" = 'Bob Dupont';
    SELECT "Id" INTO order3_id FROM "Orders" WHERE "CustomerName" = 'Claire Dubois';

    -- Articles pour la commande d'Alice (En attente)
    INSERT INTO "OrderItems" ("OrderId", "DrinkId", "DrinkName", "Quantity", "UnitPrice")
    VALUES 
    (order1_id, 1, 'Coca-Cola', 2, 1.50),
    (order1_id, 11, 'Bière', 3, 4.50);

    -- Articles pour la commande de Bob (Acceptée)
    INSERT INTO "OrderItems" ("OrderId", "DrinkId", "DrinkName", "Quantity", "UnitPrice")
    VALUES 
    (order2_id, 6, 'Café', 4, 2.00);

    -- Articles pour la commande de Claire (Prête)
    INSERT INTO "OrderItems" ("OrderId", "DrinkId", "DrinkName", "Quantity", "UnitPrice")
    VALUES 
    (order3_id, 12, 'Vin rouge', 1, 5.00),
    (order3_id, 8, 'Jus de pomme', 1, 2.50),
    (order3_id, 11, 'Bière', 1, 3.00);
END $$;
