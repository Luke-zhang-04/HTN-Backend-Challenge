/*
  Warnings:

  - You are about to drop the column `phone` on the `user` table. All the data in the column will be lost.
  - Added the required column `company` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneId` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `phone`,
    ADD COLUMN `company` VARCHAR(32) NOT NULL,
    ADD COLUMN `phoneId` INTEGER UNSIGNED NOT NULL;

-- CreateTable
CREATE TABLE `phoneNumber` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `prefix` VARCHAR(5) NOT NULL,
    `main` VARCHAR(15) NOT NULL,
    `ext` VARCHAR(11) NOT NULL,
    `userId` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `phoneNumber_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `phoneNumber` ADD CONSTRAINT `phoneNumber_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
