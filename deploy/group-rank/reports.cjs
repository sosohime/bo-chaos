// Run only on the isolated group-ranking host. Default: read-only report queue.
const path = require("node:path");
const fs = require("node:fs");
const root = fs.realpathSync(path.join(__dirname, "../.."));
const loaded = require(path.join(root, "apps/backend-nest/node_modules/dotenv")).config({
  path: process.env.GROUP_RANK_ENV_FILE,
  override: true,
});
const { PrismaClient } = require(
  path.join(root, "apps/backend-nest/node_modules/@mono/prisma-client"),
);
const { GroupRankService } = require(
  path.join(root, "apps/backend-nest/dist/group-rank/group-rank.service"),
);
const db = new PrismaClient();
(async () => {
  if (
    !process.env.GROUP_RANK_ENV_FILE ||
    loaded.error ||
    !/^wx[0-9a-f]{16}$/.test(process.env.GROUP_RANK_APP_ID || "")
  )
    throw new Error("Private application configuration required");
  const url = new URL(process.env.DATABASE_URL || "");
  if (url.pathname !== "/group_rank_test")
    throw new Error("Use only the isolated group_rank_test database");
  const reportId = process.argv
    .find((value) => value.startsWith("--hide="))
    ?.slice(7);
  if (!reportId) {
    const reports = await db.groupRankReport.findMany({
      where: {
        board: {
          space: { appId: process.env.GROUP_RANK_APP_ID },
          deletedAt: null,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { board: true },
    });
    console.log(
      JSON.stringify(
        reports.map((row) => ({
          reportId: row.id,
          reason: row.reason,
          boardName: row.board.templateSnapshot.name,
          createdAt: row.createdAt,
        })),
        null,
        2,
      ),
    );
    return;
  }
  const report = await db.groupRankReport.findFirst({
    where: {
      id: reportId,
      board: {
        space: { appId: process.env.GROUP_RANK_APP_ID },
        deletedAt: null,
      },
    },
    include: { board: true },
  });
  if (!report) throw new Error("Report not found for this application");
  if (!process.argv.includes("--apply")) {
    console.log(
      JSON.stringify({
        dryRun: true,
        reportId,
        action: "remove reported board and clear its scores",
      }),
    );
    return;
  }
  const service = new GroupRankService(db);
  await service.removeBoard(
    { userId: report.board.creatorId, spaceId: report.board.spaceId },
    report.board.id,
  );
  console.log(JSON.stringify({ removed: true, reportId }));
})()
  .catch(() => {
    console.error(
      "Report operation failed; check private configuration and report ID.",
    );
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
