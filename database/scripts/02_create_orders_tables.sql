-- Création de la table Orders
CREATE TABLE "Orders" (
                          "Id" SERIAL PRIMARY KEY,
                          "CustomerName" VARCHAR(100) NOT NULL,
                          "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                          "AcceptedAt" TIMESTAMP WITH TIME ZONE NULL,
                          "ReadyAt" TIMESTAMP WITH TIME ZONE NULL,
                          "CompletedAt" TIMESTAMP WITH TIME ZONE NULL,
                          "Status" INTEGER NOT NULL DEFAULT 0,
                          "TotalAmount" NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Création de la table OrderItems
CREATE TABLE "OrderItems" (
                              "Id" SERIAL PRIMARY KEY,
                              "OrderId" INTEGER NOT NULL,
                              "DrinkId" INTEGER NOT NULL,
                              "DrinkName" VARCHAR(100) NOT NULL,
                              "Quantity" INTEGER NOT NULL,
                              "UnitPrice" NUMERIC(10,2) NOT NULL,

                              CONSTRAINT "FK_OrderItems_Orders"
                                  FOREIGN KEY ("OrderId") REFERENCES "Orders"("Id") ON DELETE CASCADE,
                              CONSTRAINT "FK_OrderItems_Drinks"
                                  FOREIGN KEY ("DrinkId") REFERENCES "Drinks"("Id") ON DELETE RESTRICT
);

-- Index pour améliorer les performances
CREATE INDEX "IX_Orders_Status" ON "Orders"("Status");
CREATE INDEX "IX_Orders_CreatedAt" ON "Orders"("CreatedAt");
CREATE INDEX "IX_OrderItems_OrderId" ON "OrderItems"("OrderId");
CREATE INDEX "IX_OrderItems_DrinkId" ON "OrderItems"("DrinkId");
