/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `leagues` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `leagues` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "leagues" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "leagues_slug_key" ON "leagues"("slug");
