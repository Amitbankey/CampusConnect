/*
  Warnings:

  - A unique constraint covering the columns `[rideId,studentId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Booking_studentId_idx" ON "Booking"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_rideId_studentId_key" ON "Booking"("rideId", "studentId");

-- CreateIndex
CREATE INDEX "Ride_pickup_destination_departureTime_idx" ON "Ride"("pickup", "destination", "departureTime");

-- CreateIndex
CREATE INDEX "Ride_status_departureTime_idx" ON "Ride"("status", "departureTime");

-- CreateIndex
CREATE INDEX "Ride_driverId_idx" ON "Ride"("driverId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
