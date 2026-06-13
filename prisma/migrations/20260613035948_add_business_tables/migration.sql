-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "audienceRole" TEXT,
    "audienceLevel" TEXT,
    "aspectRatio" TEXT NOT NULL DEFAULT '16:9',
    "targetDurationSec" INTEGER,
    "voiceProvider" TEXT,
    "voiceId" TEXT,
    "currentStoryboardVersionId" TEXT,
    "finalVideoAssetId" TEXT,
    "thumbnailAssetId" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storyboard_version" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "generatedPrompt" TEXT NOT NULL,
    "llmModel" TEXT NOT NULL,
    "llmResponseRaw" TEXT NOT NULL,
    "totalDurationSec" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storyboard_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scene" (
    "id" TEXT NOT NULL,
    "storyboardVersionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "narrationText" TEXT NOT NULL,
    "visualDescription" TEXT NOT NULL,
    "emotionalTone" TEXT,
    "audioAssetId" TEXT,
    "imageAssetId" TEXT,
    "startTimeSec" DOUBLE PRECISION,
    "durationSec" DOUBLE PRECISION,
    "animationPreset" TEXT,
    "generationJobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "assetType" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "durationSec" DOUBLE PRECISION,
    "width" INTEGER,
    "height" INTEGER,
    "assetKey" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "metadata" TEXT,
    "lifecycleStatus" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_job" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "aiProvider" TEXT NOT NULL,
    "aiModel" TEXT,
    "inputParams" TEXT NOT NULL,
    "outputAssetId" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generation_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "render_job" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "storyboardVersionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "renderEngine" TEXT NOT NULL DEFAULT 'remotion',
    "compositionId" TEXT,
    "inputProps" TEXT NOT NULL,
    "outputVideoUrl" TEXT,
    "outputThumbnailUrl" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "render_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_event" (
    "id" TEXT NOT NULL,
    "generationJobId" TEXT,
    "renderJobId" TEXT,
    "eventType" TEXT NOT NULL,
    "message" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_record" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "provider" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "metadata" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_currentStoryboardVersionId_key" ON "project"("currentStoryboardVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "project_finalVideoAssetId_key" ON "project"("finalVideoAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "project_thumbnailAssetId_key" ON "project"("thumbnailAssetId");

-- CreateIndex
CREATE INDEX "project_userId_createdAt_idx" ON "project"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "project_status_idx" ON "project"("status");

-- CreateIndex
CREATE INDEX "storyboard_version_projectId_idx" ON "storyboard_version"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "storyboard_version_projectId_versionNumber_key" ON "storyboard_version"("projectId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "scene_audioAssetId_key" ON "scene"("audioAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "scene_imageAssetId_key" ON "scene"("imageAssetId");

-- CreateIndex
CREATE INDEX "scene_storyboardVersionId_order_idx" ON "scene"("storyboardVersionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "scene_storyboardVersionId_order_key" ON "scene"("storyboardVersionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "asset_assetKey_key" ON "asset"("assetKey");

-- CreateIndex
CREATE INDEX "asset_userId_createdAt_idx" ON "asset"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "asset_assetKey_idx" ON "asset"("assetKey");

-- CreateIndex
CREATE INDEX "asset_checksum_idx" ON "asset"("checksum");

-- CreateIndex
CREATE INDEX "asset_lifecycleStatus_idx" ON "asset"("lifecycleStatus");

-- CreateIndex
CREATE UNIQUE INDEX "generation_job_outputAssetId_key" ON "generation_job"("outputAssetId");

-- CreateIndex
CREATE INDEX "generation_job_userId_createdAt_idx" ON "generation_job"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "generation_job_projectId_status_idx" ON "generation_job"("projectId", "status");

-- CreateIndex
CREATE INDEX "generation_job_status_idx" ON "generation_job"("status");

-- CreateIndex
CREATE INDEX "render_job_projectId_status_idx" ON "render_job"("projectId", "status");

-- CreateIndex
CREATE INDEX "render_job_status_idx" ON "render_job"("status");

-- CreateIndex
CREATE INDEX "job_event_generationJobId_createdAt_idx" ON "job_event"("generationJobId", "createdAt");

-- CreateIndex
CREATE INDEX "job_event_renderJobId_createdAt_idx" ON "job_event"("renderJobId", "createdAt");

-- CreateIndex
CREATE INDEX "usage_record_userId_recordedAt_idx" ON "usage_record"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "usage_record_resourceType_idx" ON "usage_record"("resourceType");

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_currentStoryboardVersionId_fkey" FOREIGN KEY ("currentStoryboardVersionId") REFERENCES "storyboard_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_finalVideoAssetId_fkey" FOREIGN KEY ("finalVideoAssetId") REFERENCES "asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_thumbnailAssetId_fkey" FOREIGN KEY ("thumbnailAssetId") REFERENCES "asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storyboard_version" ADD CONSTRAINT "storyboard_version_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scene" ADD CONSTRAINT "scene_storyboardVersionId_fkey" FOREIGN KEY ("storyboardVersionId") REFERENCES "storyboard_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scene" ADD CONSTRAINT "scene_audioAssetId_fkey" FOREIGN KEY ("audioAssetId") REFERENCES "asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scene" ADD CONSTRAINT "scene_imageAssetId_fkey" FOREIGN KEY ("imageAssetId") REFERENCES "asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scene" ADD CONSTRAINT "scene_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "generation_job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_job" ADD CONSTRAINT "generation_job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_job" ADD CONSTRAINT "generation_job_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_job" ADD CONSTRAINT "generation_job_outputAssetId_fkey" FOREIGN KEY ("outputAssetId") REFERENCES "asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "render_job" ADD CONSTRAINT "render_job_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_event" ADD CONSTRAINT "job_event_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "generation_job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_event" ADD CONSTRAINT "job_event_renderJobId_fkey" FOREIGN KEY ("renderJobId") REFERENCES "render_job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_record" ADD CONSTRAINT "usage_record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
