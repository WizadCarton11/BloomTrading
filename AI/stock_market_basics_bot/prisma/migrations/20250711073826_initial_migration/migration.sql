-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basic_stock_info_vector_search_chat_history" (
    "id" SERIAL NOT NULL,
    "session_id" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "basic_stock_info_vector_search_chat_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "basic_stock_info_vector_search_chat_history" ADD CONSTRAINT "basic_stock_info_vector_search_chat_history_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
