/*
  Warnings:

  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "basic_stock_info_vector_search_chat_history" DROP CONSTRAINT "basic_stock_info_vector_search_chat_history_session_id_fkey";

-- DropTable
DROP TABLE "session";

-- CreateTable
CREATE TABLE "conversation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "basic_stock_info_vector_search_chat_history" ADD CONSTRAINT "basic_stock_info_vector_search_chat_history_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
