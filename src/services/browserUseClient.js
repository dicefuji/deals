const BROWSER_USE_API_BASE = "https://api.browser-use.com/api/v2";
const DEFAULT_MODEL = process.env.BROWSER_USE_MODEL || "browser-use-2.0";
const DEFAULT_TIMEOUT_MS = 120000;
const POLL_INTERVAL_MS = 2500;
const DEBUG_HISTORY_LIMIT = 5;

const structuredOutputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["agentSummary", "deals"],
  properties: {
    agentSummary: { type: "string" },
    deals: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "storeName",
          "itemName",
          "promotionType",
          "promotionLabel",
          "priceBefore",
          "priceAfter",
          "estimatedSavings",
          "deliveryFee",
          "serviceFee",
          "etaMinutes",
          "isDashPassRequired",
          "sourceUrl",
          "confidenceNote"
        ],
        properties: {
          storeName: { type: "string" },
          itemName: { type: "string" },
          promotionType: {
            type: "string",
            enum: ["bogo", "free_item", "percent_off", "amount_off_threshold", "free_delivery", "membership_only", "combo_deal", "unknown"]
          },
          promotionLabel: { type: "string" },
          priceBefore: { type: "number" },
          priceAfter: { type: "number" },
          estimatedSavings: { type: "number" },
          deliveryFee: { type: "number" },
          serviceFee: { type: "number" },
          etaMinutes: { type: "number" },
          isDashPassRequired: { type: "boolean" },
          sourceUrl: { type: "string" },
          confidenceNote: { type: "string" }
        }
      }
    }
  }
};

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function buildTaskPrompt(userInput) {
  return [
    "You are finding the best DoorDash food deals for a user.",
    "Use only DoorDash pages and stay on doordash.com.",
    "Collect prepared-food or restaurant deals only.",
    "Exclude grocery, convenience, retail, pharmacy, alcohol, and household deals.",
    "Do not add anything to cart and do not attempt checkout.",
    "Find up to 10 candidate deals that fit the user's meal intent.",
    "Prefer BOGO, free-item, combo-deal, percent-off, and dollar-off offers.",
    "Estimate delivered cost using visible item price plus visible delivery and service fees.",
    "If a fee is not shown, use 0 and explain the uncertainty in confidenceNote.",
    "If DashPass seems required for a promo, set isDashPassRequired to true.",
    `Meal intent: ${userInput.query || "Dinner"}.`,
    `Budget cap: $${Number(userInput.budget || 0).toFixed(2)}.`,
    `Max ETA preference: ${Number(userInput.maxEtaMinutes || 0)} minutes.`,
    `Prioritize BOGO: ${userInput.prioritizeBogo ? "yes" : "no"}.`,
    "Return fewer deals rather than including irrelevant non-food results.",
    "The response must match the provided structured output exactly."
  ].join(" ");
}

async function browserUseFetch(path, init = {}) {
  const response = await fetch(`${BROWSER_USE_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Browser-Use-API-Key": getRequiredEnv("BROWSER_USE_API_KEY"),
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Browser Use API error ${response.status}: ${text}`);
  }

  return response.status === 204 ? null : response.json();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseTaskOutput(output) {
  if (!output) {
    throw new Error("Browser Use completed without returning structured output.");
  }

  if (typeof output === "object") {
    return output;
  }

  try {
    return JSON.parse(output);
  } catch {
    const jsonMatch = output.match(/\{[\s\S]*\}$/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Browser Use returned output that was not valid structured JSON.");
  }
}

async function getTaskDiagnostics(taskId, sessionId) {
  const [task, session, logs] = await Promise.all([
    browserUseFetch(`/tasks/${taskId}`, { method: "GET" }).catch(() => null),
    sessionId ? browserUseFetch(`/sessions/${sessionId}`, { method: "GET" }).catch(() => null) : Promise.resolve(null),
    browserUseFetch(`/tasks/${taskId}/logs`, { method: "GET" }).catch(() => null)
  ]);

  return {
    task,
    session,
    logs
  };
}

function summarizeTaskSteps(task) {
  if (!task?.steps?.length) {
    return [];
  }

  return task.steps.slice(-DEBUG_HISTORY_LIMIT).map((step) => ({
    number: step.number,
    url: step.url || null,
    nextGoal: step.nextGoal || null,
    evaluationPreviousGoal: step.evaluationPreviousGoal || null,
    actions: Array.isArray(step.actions) ? step.actions : []
  }));
}

function createDebugContext(task, session, logs) {
  return {
    taskId: task?.id || null,
    sessionId: task?.sessionId || session?.id || null,
    status: task?.status || null,
    liveUrl: session?.liveUrl || null,
    logDownloadUrl: logs?.downloadUrl || null,
    lastSteps: summarizeTaskSteps(task),
    output: task?.output || null
  };
}

function attachDebugContext(error, debug) {
  error.debug = debug;
  return error;
}

export async function runDoorDashDealTask(userInput) {
  const task = await browserUseFetch("/tasks", {
    method: "POST",
    body: JSON.stringify({
      task: buildTaskPrompt(userInput),
      llm: DEFAULT_MODEL,
      startUrl: "https://www.doordash.com/browse/deals",
      maxSteps: 30,
      structuredOutput: JSON.stringify(structuredOutputSchema),
      allowedDomains: ["doordash.com", "www.doordash.com"],
      vision: true,
      thinking: false,
      highlightElements: false,
      sessionSettings: {
        profileId: getRequiredEnv("BROWSER_USE_PROFILE_ID"),
        enableRecording: false
      }
    })
  });

  const startTime = Date.now();

  while (Date.now() - startTime < DEFAULT_TIMEOUT_MS) {
    const currentTask = await browserUseFetch(`/tasks/${task.id}`, {
      method: "GET"
    });

    if (currentTask.status === "finished") {
      const diagnostics = await getTaskDiagnostics(currentTask.id, currentTask.sessionId);

      return {
        taskId: currentTask.id,
        sessionId: currentTask.sessionId,
        liveUrl: diagnostics.session?.liveUrl || null,
        structured: parseTaskOutput(currentTask.output)
      };
    }

    if (currentTask.status === "failed" || currentTask.status === "stopped") {
      const diagnostics = await getTaskDiagnostics(currentTask.id, currentTask.sessionId);
      throw attachDebugContext(
        new Error(currentTask.output || `Browser Use task ${currentTask.status}.`),
        createDebugContext(diagnostics.task, diagnostics.session, diagnostics.logs)
      );
    }

    await sleep(POLL_INTERVAL_MS);
  }

  const diagnostics = await getTaskDiagnostics(task.id, task.sessionId);
  throw attachDebugContext(
    new Error("Browser Use task timed out before returning results."),
    createDebugContext(diagnostics.task, diagnostics.session, diagnostics.logs)
  );
}
