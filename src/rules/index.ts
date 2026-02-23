import builtinBiomeRule from "./builtin/biome.js";
import builtinCodeownersRule from "./builtin/codeowners.js";
import builtinDefaultBranchRule from "./builtin/default-branch.js";
import builtinPinnedWorkflowActionsRule from "./builtin/pinned-workflow-actions.js";
import builtinPnpmRule from "./builtin/pnpm.js";
import builtinReadmeRule from "./builtin/readme.js";
import builtinStaleBranchesRule from "./builtin/stale-branches.js";

const builtinRules = [
  builtinBiomeRule,
  builtinCodeownersRule,
  builtinDefaultBranchRule,
  builtinPinnedWorkflowActionsRule,
  builtinPnpmRule,
  builtinReadmeRule,
  builtinStaleBranchesRule,
];

export const allRules = [...builtinRules];
