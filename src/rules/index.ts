import builtinCodeownersRule from "./builtin/codeowners.js";
import builtinReadmeRule from "./builtin/readme.js";
import builtinStaleBranchesRule from "./builtin/stale-branches.js";

const builtinRules = [builtinCodeownersRule, builtinReadmeRule, builtinStaleBranchesRule];

export const allRules = [...builtinRules];
