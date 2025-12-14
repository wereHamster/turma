import builtinCodeownersRule from "./builtin/codeowners.js";
import builtinPinnedWorkflowActionsRule from "./builtin/pinned-workflow-actions.js";
import builtinReadmeRule from "./builtin/readme.js";
import builtinStaleBranchesRule from "./builtin/stale-branches.js";

const builtinRules = [
  builtinCodeownersRule,
  builtinPinnedWorkflowActionsRule,
  builtinReadmeRule,
  builtinStaleBranchesRule,
];

export const allRules = [...builtinRules];
