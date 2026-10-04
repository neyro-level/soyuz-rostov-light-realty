export const PROJECT_FIXTURE =
  process.env.PROJECT_FIXTURE ?? "fixture-sz-rostov";

export const data = {
  fixtureDir: `fixtures/${PROJECT_FIXTURE}`,
};

export function isAltFixture(): boolean {
  return PROJECT_FIXTURE === "fixture-alt";
}
