-- CreateTable
CREATE TABLE "Twit" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Twit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "twitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Like_twitId_userId_key" ON "Like"("twitId", "userId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_twitId_fkey" FOREIGN KEY ("twitId") REFERENCES "Twit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
