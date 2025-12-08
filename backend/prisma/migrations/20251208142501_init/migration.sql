-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Prompt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "licenseType" TEXT NOT NULL,
    "storyIpId" TEXT,
    "storyLicenseTermsId" TEXT,
    "parentPromptId" TEXT,
    "isListed" BOOLEAN NOT NULL DEFAULT true,
    "trustScore" REAL NOT NULL DEFAULT 0,
    "effectivenessScore" REAL NOT NULL DEFAULT 0,
    "verificationCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Prompt_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prompt_parentPromptId_fkey" FOREIGN KEY ("parentPromptId") REFERENCES "Prompt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Prompt" ("category", "createdAt", "creatorId", "description", "effectivenessScore", "id", "isListed", "licenseType", "promptText", "storyIpId", "storyLicenseTermsId", "title", "trustScore", "verificationCount") SELECT "category", "createdAt", "creatorId", "description", "effectivenessScore", "id", "isListed", "licenseType", "promptText", "storyIpId", "storyLicenseTermsId", "title", "trustScore", "verificationCount" FROM "Prompt";
DROP TABLE "Prompt";
ALTER TABLE "new_Prompt" RENAME TO "Prompt";
CREATE INDEX "Prompt_creatorId_idx" ON "Prompt"("creatorId");
CREATE INDEX "Prompt_category_idx" ON "Prompt"("category");
CREATE INDEX "Prompt_isListed_idx" ON "Prompt"("isListed");
CREATE INDEX "Prompt_trustScore_idx" ON "Prompt"("trustScore");
CREATE INDEX "Prompt_verificationCount_idx" ON "Prompt"("verificationCount");
CREATE INDEX "Prompt_parentPromptId_idx" ON "Prompt"("parentPromptId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
