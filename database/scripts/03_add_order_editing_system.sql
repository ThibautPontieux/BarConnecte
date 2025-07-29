-- =====================================================
-- Migration: Ajout des fonctionnalités d'édition de commandes
-- Version: 03
-- Date: 2025-07-29
-- Description: Ajoute les colonnes nécessaires pour l'édition 
--              et le tracking des modifications de commandes
-- =====================================================

-- Vérifier que la table Orders existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables 
                   WHERE table_schema = 'public' 
                   AND table_name = 'Orders') THEN
        RAISE EXCEPTION 'La table Orders n''existe pas. Veuillez d''abord exécuter les migrations précédentes.';
END IF;
END $$;

-- Ajouter les nouvelles colonnes à la table Orders
ALTER TABLE "Orders"
    ADD COLUMN IF NOT EXISTS "IsPartiallyModified" BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS "ModificationReason" VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS "LastModifiedAt" TIMESTAMP WITH TIME ZONE NULL;

-- Créer un index sur les commandes modifiées pour améliorer les performances
CREATE INDEX IF NOT EXISTS "IX_Orders_IsPartiallyModified"
    ON "Orders" ("IsPartiallyModified")
    WHERE "IsPartiallyModified" = TRUE;

-- Créer un index sur la date de modification
CREATE INDEX IF NOT EXISTS "IX_Orders_LastModifiedAt"
    ON "Orders" ("LastModifiedAt")
    WHERE "LastModifiedAt" IS NOT NULL;

-- Créer un index composé pour les requêtes complexes de recherche
CREATE INDEX IF NOT EXISTS "IX_Orders_Status_Modified"
    ON "Orders" ("Status", "IsPartiallyModified", "LastModifiedAt");

-- Ajouter des contraintes de validation
ALTER TABLE "Orders"
    ADD CONSTRAINT "CK_Orders_ModificationReason"
        CHECK (
            ("IsPartiallyModified" = FALSE AND "ModificationReason" IS NULL AND "LastModifiedAt" IS NULL)
                OR
            ("IsPartiallyModified" = TRUE AND "ModificationReason" IS NOT NULL AND "LastModifiedAt" IS NOT NULL)
            );

-- Commentaires pour la documentation
COMMENT ON COLUMN "Orders"."IsPartiallyModified" IS 'Indique si la commande a été partiellement modifiée par le barman';
COMMENT ON COLUMN "Orders"."ModificationReason" IS 'Raison de la modification fournie par le barman (max 500 caractères)';
COMMENT ON COLUMN "Orders"."LastModifiedAt" IS 'Date et heure de la dernière modification de la commande';

-- Insérer un enregistrement de version pour le tracking des migrations
INSERT INTO "MigrationHistory" ("Version", "AppliedAt", "Description")
VALUES ('03_add_order_editing_features', NOW(), 'Ajout des fonctionnalités d''édition et tracking des modifications de commandes')
    ON CONFLICT DO NOTHING;

-- Créer la table MigrationHistory si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS "MigrationHistory" (
                                                  "Id" SERIAL PRIMARY KEY,
                                                  "Version" VARCHAR(100) NOT NULL UNIQUE,
    "AppliedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "Description" TEXT NOT NULL
    );

-- Vérification post-migration: s'assurer que les colonnes ont été ajoutées
DO $$
DECLARE
column_count INTEGER;
BEGIN
SELECT COUNT(*) INTO column_count
FROM information_schema.columns
WHERE table_name = 'Orders'
  AND column_name IN ('IsPartiallyModified', 'ModificationReason', 'LastModifiedAt');

IF column_count != 3 THEN
        RAISE EXCEPTION 'Erreur de migration: toutes les colonnes n''ont pas été ajoutées correctement';
END IF;
    
    RAISE NOTICE 'Migration 03_add_order_editing_features appliquée avec succès!';
END $$;

