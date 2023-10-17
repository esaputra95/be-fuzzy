-- CreateTable
CREATE TABLE `factors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NULL,
    `name` VARCHAR(100) NULL,
    `description` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `indicators` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subVariableId` INTEGER NOT NULL,
    `code` VARCHAR(20) NULL,
    `name` TEXT NULL,
    `references` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `type` SMALLINT NULL,

    INDEX `subVariableId`(`subVariableId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `knowladgeManagementDetail` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `knowledgeManagementId` INTEGER NULL,
    `subVariableId` INTEGER NULL,
    `type` INTEGER NULL,

    INDEX `knowledgeManagementId`(`knowledgeManagementId`),
    INDEX `subVariableId`(`subVariableId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `knowledgeManagement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subVariableId` INTEGER NULL,
    `factorId` INTEGER NULL,
    `indicatorId` INTEGER NULL,
    `reference` VARCHAR(255) NULL,

    INDEX `factorId`(`factorId`),
    INDEX `indicatorId`(`indicatorId`),
    INDEX `subVariableId`(`subVariableId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questionnaireFinals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `respondentId` INTEGER NULL,
    `indicatorId1` INTEGER NULL,
    `indicatorId2` INTEGER NULL,
    `value` DECIMAL(6, 2) NULL,

    INDEX `indicatorId1`(`indicatorId1`),
    INDEX `indicatorId2`(`indicatorId2`),
    INDEX `respondentId`(`respondentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questionnaires` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `respondentId` INTEGER NULL,
    `indicatorId1` INTEGER NULL,
    `indicatorId2` INTEGER NULL,
    `value` DECIMAL(6, 2) NULL,

    INDEX `indicatorId1`(`indicatorId1`),
    INDEX `indicatorId2`(`indicatorId2`),
    INDEX `respondentId`(`respondentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `respondents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NULL,
    `nik` VARCHAR(50) NULL,
    `gender` ENUM('Laki-Laki', 'Perempuan') NULL,
    `position` VARCHAR(50) NULL,
    `speciality` VARCHAR(150) NULL,
    `faculty` INTEGER NULL,
    `university` VARCHAR(150) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subVariables` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `variableId` INTEGER NULL,
    `code` VARCHAR(20) NULL,
    `name` VARCHAR(100) NULL,
    `description` VARCHAR(255) NULL,
    `km` ENUM('yes', 'no') NULL DEFAULT 'no',

    INDEX `variableId`(`variableId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `username` VARCHAR(100) NULL,
    `password` VARCHAR(255) NULL,
    `role` ENUM('expert', 'admin') NULL DEFAULT 'admin',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `variables` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NULL,
    `name` VARCHAR(100) NULL,
    `description` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `indicators` ADD CONSTRAINT `indicators_ibfk_1` FOREIGN KEY (`subVariableId`) REFERENCES `subVariables`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `knowladgeManagementDetail` ADD CONSTRAINT `knowladgemanagementdetail_ibfk_1` FOREIGN KEY (`knowledgeManagementId`) REFERENCES `knowledgeManagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `knowladgeManagementDetail` ADD CONSTRAINT `knowladgemanagementdetail_ibfk_2` FOREIGN KEY (`subVariableId`) REFERENCES `subVariables`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `knowledgeManagement` ADD CONSTRAINT `knowledgemanagement_ibfk_1` FOREIGN KEY (`factorId`) REFERENCES `factors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `knowledgeManagement` ADD CONSTRAINT `knowledgemanagement_ibfk_2` FOREIGN KEY (`indicatorId`) REFERENCES `indicators`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `knowledgeManagement` ADD CONSTRAINT `knowledgemanagement_ibfk_3` FOREIGN KEY (`subVariableId`) REFERENCES `subVariables`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `questionnaireFinals` ADD CONSTRAINT `questionnairefinals_ibfk_1` FOREIGN KEY (`respondentId`) REFERENCES `respondents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questionnaireFinals` ADD CONSTRAINT `questionnairefinals_ibfk_2` FOREIGN KEY (`indicatorId1`) REFERENCES `indicators`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questionnaireFinals` ADD CONSTRAINT `questionnairefinals_ibfk_3` FOREIGN KEY (`indicatorId2`) REFERENCES `indicators`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questionnaires` ADD CONSTRAINT `questionnaires_ibfk_1` FOREIGN KEY (`respondentId`) REFERENCES `respondents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questionnaires` ADD CONSTRAINT `questionnaires_ibfk_2` FOREIGN KEY (`indicatorId1`) REFERENCES `indicators`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questionnaires` ADD CONSTRAINT `questionnaires_ibfk_3` FOREIGN KEY (`indicatorId2`) REFERENCES `indicators`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subVariables` ADD CONSTRAINT `subvariables_ibfk_1` FOREIGN KEY (`variableId`) REFERENCES `variables`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

