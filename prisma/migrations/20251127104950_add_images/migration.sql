-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "trashSpotId" INTEGER,
    "collectionSpotId" INTEGER,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_trashSpotId_fkey" FOREIGN KEY ("trashSpotId") REFERENCES "TrashSpot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_collectionSpotId_fkey" FOREIGN KEY ("collectionSpotId") REFERENCES "CollectionSpots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
