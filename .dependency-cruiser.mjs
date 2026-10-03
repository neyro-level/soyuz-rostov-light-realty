/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: "platform-must-not-import-project",
      comment: "Platform reads project through configs later; it must not import src/project.",
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
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
  },
};
