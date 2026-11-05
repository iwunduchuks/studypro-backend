-- CreateEnum
CREATE TYPE "NoteDetailLevel" AS ENUM ('overview', 'studyGuide', 'detailed');

-- CreateEnum
CREATE TYPE "ExerciseDetailLevel" AS ENUM ('shallow', 'comprehensive');

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Context" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "Context_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "detailLevel" "NoteDetailLevel" NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "order" TEXT NOT NULL,
    "detailLevel" "ExerciseDetailLevel" NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Context_topicId_idx" ON "Context"("topicId");

-- CreateIndex
CREATE INDEX "Note_contextId_idx" ON "Note"("contextId");

-- CreateIndex
CREATE INDEX "Exercise_contextId_idx" ON "Exercise"("contextId");

-- AddForeignKey
ALTER TABLE "Context" ADD CONSTRAINT "Context_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "Context"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "Context"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
