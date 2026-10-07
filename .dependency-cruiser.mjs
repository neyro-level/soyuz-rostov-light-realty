/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: "platform-must-not-import-project",
      comment:
        "Platform reads project through configs later; it must not import src/project.",
      severity: "error",
      from: { path: "^src/platform" },
      to: { path: "^src/project" },
    },
    {
      name: "project-must-not-import-app",
      comment: "Project layer stays configuration-only.",
      severity: "error",
      from: { path: "^src/project" },
      to: { path: "^src/app" },
    },
    {
      name: "ui-must-not-import-snapshot-storage",
      comment: "UI renders props; it must not reach snapshot storage.",
      severity: "error",
      from: { path: "^src/ui" },
      to: {
        path: "^src/platform/(snapshot|catalog/(snapshot-repository|local))",
      },
    },
    {
      name: "app-must-not-import-snapshot-storage",
      comment: "App uses repository runtime, not snapshot files directly.",
      severity: "error",
      from: {
        path: "^src/app",
        pathNot: "^src/app/(api/internal/sync|healthz)",
      },
      to: {
        path: "^src/platform/(snapshot|catalog/(snapshot-repository|local))",
      },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
  },
};
