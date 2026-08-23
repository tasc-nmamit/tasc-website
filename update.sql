
-- CreateTable
CREATE TABLE "MarathonWeeklyContest" (
    "id" STRING NOT NULL,
    "weekNumber" INT4 NOT NULL,
    "targetYear" INT4 NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "title" STRING NOT NULL,
    "description" STRING,
    "link" STRING NOT NULL,
    "isConfirmed" BOOL NOT NULL DEFAULT false,

    CONSTRAINT "MarathonWeeklyContest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarathonWeeklyScore" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "contestId" STRING NOT NULL,
    "score" INT4 NOT NULL DEFAULT 0,
    "completed" BOOL NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarathonWeeklyScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarathonWeeklyContest_weekNumber_targetYear_key" ON "MarathonWeeklyContest"("weekNumber", "targetYear");

-- CreateIndex
CREATE UNIQUE INDEX "MarathonWeeklyScore_userId_contestId_key" ON "MarathonWeeklyScore"("userId", "contestId");

-- AddForeignKey
ALTER TABLE "MarathonWeeklyScore" ADD CONSTRAINT "MarathonWeeklyScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarathonWeeklyScore" ADD CONSTRAINT "MarathonWeeklyScore_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "MarathonWeeklyContest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

