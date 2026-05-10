/*
  Warnings:

  - The primary key for the `food_category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_favor_category` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `review_ibfk_1`;

-- DropForeignKey
ALTER TABLE `user_favor_category` DROP FOREIGN KEY `user_favor_category_food_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_favor_category` DROP FOREIGN KEY `user_favor_category_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_mission` DROP FOREIGN KEY `user_mission_ibfk_1`;

-- AlterTable
ALTER TABLE `food_category` DROP PRIMARY KEY,
    MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `review` MODIFY `user_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `user_favor_category` DROP PRIMARY KEY,
    MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `user_id` BIGINT NOT NULL,
    MODIFY `food_category_id` BIGINT NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `user_mission` MODIFY `user_id` BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_favor_category` ADD CONSTRAINT `user_favor_category_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_favor_category` ADD CONSTRAINT `user_favor_category_food_category_id_fkey` FOREIGN KEY (`food_category_id`) REFERENCES `food_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_mission` ADD CONSTRAINT `user_mission_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
