/**
 * BTF Switchboard — local LLM prompt router.
 *
 * prompt in → { model, tier } out, in <1ms, no network.
 * Sits BEFORE OpenRouter: it only picks the model ID; you make the call.
 *
 * Heuristic port tuned for GTM/agent prompts — boundaries and keyword lists
 * are ours, not a byte-exact clone of any npm package. Correct moonshotai/ slugs.
 *
 * Browser + Node (ESM). No dependencies.
 *
 *   import { route, DEFAULT_TABLES } from "./btf-switchboard.js";
 *   const { model, tier } = route("Prove x is irrational, step by step");
 *   // → { model: "moonshotai/kimi-k3", tier: "REASONING", ... }
 */

// --- scoring dimensions (weight + keyword list) ---
export const DIM = {
  // reasoning = logic/proof/multi-step thinking → REASONING tier
  reasoning: {w:0.20, kw:["prove","theorem","derive","step by step","chain of thought","formally","mathematical","proof","logically","reason through","think through","first principles","trade-off","edge case"]},
  // code = literal code/syntax → COMPLEX
  code:      {w:0.15, kw:["function","class","import ","def ","select ","async","await","const ","```","=>","refactor","stack trace","exception"]},
  // technical + business-analysis vocab → COMPLEX (deep analysis, not trivial)
  technical: {w:0.12, kw:["algorithm","optimize","architecture","distributed","kubernetes","microservice","database","infrastructure","analyze","analysis","variance","attribute","forecast","segment","cohort","driver","root cause","deep dive","pipeline","churn","attribution","strategy"]},
  creative:  {w:0.05, kw:["story","poem","compose","brainstorm","creative","imagine","write a","draft a","post about","in your voice","founder-voice"]},
  simple:    {w:0.06, kw:["what is","define","translate","hello","hi ","hey","yes or no","capital of","how old","who is","when was","thanks","summarize","reply to","assign","route the","one-line"]},
  agentic:   {w:0.13, kw:["read file","read the","look at","check the","open the","edit ","modify","update the","write to","create file","execute","deploy","install","npm","pip","compile","after that","and also","once done","step 1","step 2","until it","keep trying","iterate","make sure","verify","debug","fix it","fix the","the repo"]},
  imperative:{w:0.03, kw:["build","implement","design","develop","generate","configure","set up","migrate"]},
  output:    {w:0.03, kw:["json","yaml","xml","table","csv","markdown","schema","format as","structured"]},
  domain:    {w:0.04, kw:["quantum","fpga","vlsi","risc-v","asic","genomics","topological","homomorphic","zero-knowledge","lattice-based"]},
};

// boundaries tuned to this port's score scale
export const BOUND = { simpleMedium:-0.03, mediumComplex:0.08, complexReasoning:0.20 };
export const CONF  = { steep:45, thresh:0.55, defaultTier:"MEDIUM", forceComplexTokens:100000 };

// tier → model. Free open-weight for workflow miles, frontier for thinking.
export const DEFAULT_TABLES = {
  std: {
    SIMPLE:    "google/gemma-3-27b-it:free",
    MEDIUM:    "meta-llama/llama-3.3-70b-instruct:free",
    COMPLEX:   "anthropic/claude-sonnet-4.6",
    REASONING: "moonshotai/kimi-k3",
  },
  // agentic / tool-loop work → proven callers, not free
  ag: {
    SIMPLE:    "moonshotai/kimi-k2.5",
    MEDIUM:    "anthropic/claude-haiku-4.5",
    COMPLEX:   "moonshotai/kimi-k3",
    REASONING: "anthropic/claude-opus-4.6",
  },
};

export const isFree = s => /:free\b/.test(s || "");

/** Classify a prompt into a tier with confidence + the signals that fired. */
export function classify(text){
  const t = (text || "").toLowerCase();
  const tokens = Math.ceil((text || "").length / 4);
  const signals = [];
  let score = 0;
  for (const [name, d] of Object.entries(DIM)){
    const hits = d.kw.filter(k => t.includes(k));
    if (hits.length){
      const mag = Math.min(1.3, hits.length * 0.6);   // saturating count
      const dir = (name === "simple") ? -1 : 1;        // simple pushes down
      score += d.w * mag * dir;
      signals.push(`${name} ×${hits.length}`);
    }
  }
  score += Math.min(0.08, tokens / 4000);              // long, dense prompts nudge up
  if (tokens > 40) signals.push(`${tokens} tokens`);

  const agentic = DIM.agentic.kw.filter(k => t.includes(k)).length >= 2;

  let tier;
  if (score < BOUND.simpleMedium) tier = "SIMPLE";
  else if (score < BOUND.mediumComplex) tier = "MEDIUM";
  else if (score < BOUND.complexReasoning) tier = "COMPLEX";
  else tier = "REASONING";

  const bounds = [BOUND.simpleMedium, BOUND.mediumComplex, BOUND.complexReasoning];
  const dist = Math.min(...bounds.map(b => Math.abs(score - b)));
  const confidence = 1 / (1 + Math.exp(-CONF.steep * dist));
  const ambiguous = confidence < CONF.thresh;

  return { tier, ambiguous, confidence, signals, tokens, agentic, score };
}

/**
 * Route a prompt to a model ID.
 * @param {string} prompt
 * @param {{agentic?:boolean, tables?:typeof DEFAULT_TABLES}} [opts]
 * @returns {{model:string, tier:string, useAgentic:boolean, ...classifyResult}}
 */
export function route(prompt, opts = {}){
  const { agentic = false, tables = DEFAULT_TABLES } = opts;
  const r = classify(prompt);
  let tier = r.ambiguous ? CONF.defaultTier : r.tier;
  if (r.tokens > CONF.forceComplexTokens) tier = "COMPLEX";
  const useAgentic = agentic || r.agentic;
  const model = (useAgentic ? tables.ag : tables.std)[tier];
  // ...r first so the RESOLVED tier/model win over the raw classify fields
  return { ...r, rawTier: r.tier, tier, model, useAgentic };
}
