
BEGIN;

CREATE TYPE "VehicleType_new" AS ENUM ('AUTO', 'CAB');

ALTER TABLE "Vehicle"
ALTER COLUMN "vehicleType"
TYPE "VehicleType_new"
USING (
  CASE
    WHEN "vehicleType"::text IN ('BIKE', 'CAR') THEN 'CAB'
    ELSE "vehicleType"::text
  END
)::"VehicleType_new";

ALTER TYPE "VehicleType" RENAME TO "VehicleType_old";

ALTER TYPE "VehicleType_new" RENAME TO "VehicleType";

DROP TYPE "VehicleType_old";

COMMIT;
