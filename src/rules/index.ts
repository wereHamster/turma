import builtinCodeownersRule from "./builtin/codeowners.js";
import builtinReadmeRule from "./builtin/readme.js";

const builtinRules = [builtinCodeownersRule, builtinReadmeRule];

export const allRules = [...builtinRules];
