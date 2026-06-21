-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provider_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `provider` ENUM('tencent', 'alibaba', 'cloudeka', 'manual') NOT NULL,
    `api_key` VARCHAR(191) NULL,
    `api_secret` VARCHAR(191) NULL,
    `region_default` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `provider_account_id` INTEGER NOT NULL,
    `provider` ENUM('tencent', 'alibaba', 'cloudeka', 'manual') NOT NULL,
    `region` VARCHAR(191) NULL,
    `cpu` INTEGER NOT NULL,
    `ram` INTEGER NOT NULL,
    `storage` INTEGER NOT NULL,
    `bandwidth` VARCHAR(191) NULL,
    `transfer` VARCHAR(191) NULL,
    `price_monthly` DECIMAL(12, 2) NOT NULL,
    `cost_monthly` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `os_options` VARCHAR(191) NULL,
    `provisioning_type` ENUM('manual', 'api', 'stock') NOT NULL DEFAULT 'manual',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `vps_name` VARCHAR(191) NOT NULL,
    `selected_os` VARCHAR(191) NULL,
    `status` ENUM('pending', 'approved', 'provisioning', 'active', 'cancelled') NOT NULL DEFAULT 'pending',
    `total_price` DECIMAL(12, 2) NOT NULL,
    `billing_cycle` VARCHAR(191) NOT NULL DEFAULT 'monthly',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vps_instances` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `order_id` INTEGER NULL,
    `product_id` INTEGER NOT NULL,
    `provider_account_id` INTEGER NULL,
    `vps_name` VARCHAR(191) NOT NULL,
    `provider` ENUM('tencent', 'alibaba', 'cloudeka', 'manual') NOT NULL,
    `region` VARCHAR(191) NULL,
    `operating_system` VARCHAR(191) NULL,
    `cpu` INTEGER NOT NULL,
    `ram` INTEGER NOT NULL,
    `storage` INTEGER NOT NULL,
    `bandwidth` VARCHAR(191) NULL,
    `transfer` VARCHAR(191) NULL,
    `ip_address` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `status` ENUM('provisioning', 'active', 'suspended', 'expired', 'terminated') NOT NULL DEFAULT 'provisioning',
    `expired_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_provider_account_id_fkey` FOREIGN KEY (`provider_account_id`) REFERENCES `provider_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vps_instances` ADD CONSTRAINT `vps_instances_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vps_instances` ADD CONSTRAINT `vps_instances_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vps_instances` ADD CONSTRAINT `vps_instances_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vps_instances` ADD CONSTRAINT `vps_instances_provider_account_id_fkey` FOREIGN KEY (`provider_account_id`) REFERENCES `provider_accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
