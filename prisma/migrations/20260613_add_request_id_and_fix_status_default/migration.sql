-- AlterTable
ALTER TABLE "project" ALTER COLUMN "status" SET DEFAULT 'queued';

-- AlterTable
ALTER TABLE "generation_job" ADD COLUMN "requestId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "generation_job_requestId_key" ON "generation_job"("requestId");
