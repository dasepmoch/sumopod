-- AlterTable
ALTER TABLE `orders`
    MODIFY `status` ENUM('pending', 'paid', 'approved', 'provisioning', 'active', 'cancelled') NOT NULL DEFAULT 'pending';
