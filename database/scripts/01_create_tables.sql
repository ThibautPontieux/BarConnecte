CREATE TABLE "Drinks" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Quantity" NUMERIC(10,2) NOT NULL,
    "Price" NUMERIC(10,2) NOT NULL,
    "Category" INTEGER NOT NULL,
    "Description" TEXT
);