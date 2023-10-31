-- CreateEnum
CREATE TYPE "Action" AS ENUM ('USER_SHOP_NEW', 'USER_SHOP_UPDATE', 'USER_REFERRAL_CREATER', 'USER_REFERRAL_RECEIVER', 'USER_CHOCOLATINE_NEW', 'USER_CHOCOLATINE_UPDATE', 'USER_CHOCOLATINE_REVIEW', 'USER_LINKEDIN_LIKE', 'USER_LINKEDIN_COMMENT', 'USER_LINKEDIN_SHARE', 'INVESTOR_EURO_AMOUNT', 'BUILDER_HOUR_AMOUNT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "username" TEXT,
    "password" TEXT,
    "email_token" TEXT,
    "email_token_expires_at" TIMESTAMP(3),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "referral_id" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOs" (
    "id" TEXT NOT NULL,
    "unique_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_mobile" BOOLEAN NOT NULL DEFAULT false,
    "os" TEXT,
    "is_homescreen" BOOLEAN NOT NULL DEFAULT false,
    "is_app" BOOLEAN NOT NULL DEFAULT false,
    "browser_type" TEXT NOT NULL,
    "browser_name" TEXT NOT NULL,
    "browser_version" TEXT NOT NULL,
    "browser_os" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "UserOs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "google_map_link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "type" TEXT DEFAULT 'Bakery',
    "description" TEXT,
    "name" TEXT NOT NULL,
    "telephone" TEXT,
    "url" TEXT,
    "streetAddress" TEXT,
    "addresspostalCode" TEXT,
    "addressLocality" TEXT NOT NULL,
    "addressCountry" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "openingHoursSpecification" JSONB,
    "createdByUserId" TEXT NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chocolatine" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "priceCurrency" TEXT NOT NULL DEFAULT 'EUR',
    "homemade" TEXT NOT NULL DEFAULT 'I don''t know, nobody tried yet',
    "shopId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,

    CONSTRAINT "Chocolatine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChocolatineReview" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "comment" TEXT,
    "light_or_dense" INTEGER NOT NULL,
    "flaky_or_brioche" INTEGER NOT NULL,
    "buttery" INTEGER NOT NULL,
    "golden_or_pale" INTEGER NOT NULL,
    "crispy_or_soft" INTEGER NOT NULL,
    "big_or_small" INTEGER NOT NULL,
    "chocolate_disposition" INTEGER NOT NULL,
    "good_or_not_good" INTEGER NOT NULL,
    "shopId" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "ChocolatineReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAction" (
    "id" TEXT NOT NULL,
    "action" "Action" NOT NULL,
    "shares" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,

    CONSTRAINT "UserAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_referral_id_key" ON "User"("referral_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserOs_unique_key_key" ON "UserOs"("unique_key");

-- CreateIndex
CREATE UNIQUE INDEX "Chocolatine_shopId_key" ON "Chocolatine"("shopId");

-- AddForeignKey
ALTER TABLE "UserOs" ADD CONSTRAINT "UserOs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chocolatine" ADD CONSTRAINT "Chocolatine_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chocolatine" ADD CONSTRAINT "Chocolatine_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChocolatineReview" ADD CONSTRAINT "ChocolatineReview_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChocolatineReview" ADD CONSTRAINT "ChocolatineReview_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAction" ADD CONSTRAINT "UserAction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
