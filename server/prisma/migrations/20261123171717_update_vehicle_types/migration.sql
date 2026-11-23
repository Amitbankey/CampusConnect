
BEGIN;

-- Create the new vehicle type enum
CREATE TYPE "VehicleType_new" AS ENUM ('AUTO', 'CAB');

-- Convert existing vehicle records safely
-- BIKE and CAR will become CAB
ALTER TABLE "Vehicle"
ALTER COLUMN "vehicleType"
TYPE "VehicleType_new"
USING (
  CASE
    WHEN "vehicleType"::text IN ('BIKE', 'CAR') THEN 'CAB'
    ELSE "vehicleType"::text
  END
)::"VehicleType_new";

-- Replace the old enum with the new enum
ALTER TYPE "VehicleType" RENAME TO "VehicleType_old";

ALTER TYPE "VehicleType_new" RENAME TO "VehicleType";

DROP TYPE "VehicleType_old";

COMMIT;
