const catalyst = require('zcatalyst-sdk-node');
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Data Store helpers ──────────────────────────────────────────────────────

function mapRow(row) {
  const { ROWID, ...rest } = row;
  return { id: String(ROWID), ...rest };
}

async function getSegment(app, name) {
  return app.datastore().segment(name);
}

async function querySegment(app, segmentName, filter) {
  const seg = await getSegment(app, segmentName);
  const rows = await seg.getRows();
  return rows.filter(filter).map(mapRow);
}

// ─── Tool implementations ────────────────────────────────────────────────────

async function getVehicles(app, { userId }) {
  return querySegment(app, 'Vehicles', (r) => r.userId === userId);
}

async function getDocuments(app, { vehicleId, userId }) {
  return querySegment(app, 'Documents', (r) => r.vehicleId === vehicleId && r.userId === userId);
}

async function searchDocuments(app, { query, vehicleId, userId }) {
  const docs = await getDocuments(app, { vehicleId, userId });
  const q = query.toLowerCase();
  return docs.filter(
    (d) =>
      (d.extractedText && d.extractedText.toLowerCase().includes(q)) ||
      (d.notes && d.notes.toLowerCase().includes(q)) ||
      (d.name && d.name.toLowerCase().includes(q))
  );
}

async function getSOTCoverage(app, { vehicleId, userId }) {
  const docs = await getDocuments(app, { vehicleId, userId });
  return docs.filter((d) => d.type === 'sot');
}

async function getWarrantyDetails(app, { vehicleId, userId }) {
  const docs = await getDocuments(app, { vehicleId, userId });
  return docs.filter((d) => d.type === 'warranty');
}

async function getInsuranceDetails(app, { vehicleId, userId }) {
  const docs = await getDocuments(app, { vehicleId, userId });
  return docs.filter((d) => d.type === 'insurance');
}

async function getServiceHistory(app, { vehicleId, userId }) {
  const records = await querySegment(app, 'ServiceRecords', (r) => r.vehicleId === vehicleId && r.userId === userId);
  return records.sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
}

async function getLastService(app, { vehicleId, userId }) {
  const history = await getServiceHistory(app, { vehicleId, userId });
  return history[0] ?? null;
}

async function getPartsReplaced(app, { vehicleId, userId }) {
  const history = await getServiceHistory(app, { vehicleId, userId });
  return history.filter((r) => r.partsChanged).map((r) => ({ date: r.serviceDate, parts: r.partsChanged, workshop: r.workshopName }));
}

async function getReminders(app, { vehicleId, userId }) {
  return querySegment(app, 'Reminders', (r) => r.vehicleId === vehicleId && r.userId === userId);
}

async function getPurchaseQuotation(app, { vehicleId, userId }) {
  const docs = await getDocuments(app, { vehicleId, userId });
  return docs.filter((d) => d.type === 'quotation');
}

async function getOwnershipSummary(app, { vehicleId, userId }) {
  const [vehicles, docs, serviceHistory, reminders] = await Promise.all([
    getVehicles(app, { userId }),
    getDocuments(app, { vehicleId, userId }),
    getServiceHistory(app, { vehicleId, userId }),
    getReminders(app, { vehicleId, userId }),
  ]);
  const vehicle = vehicles.find((v) => v.id === vehicleId);
  return {
    vehicle,
    documentCount: docs.length,
    serviceCount: serviceHistory.length,
    lastService: serviceHistory[0] ?? null,
    activeReminders: reminders.filter((r) => !r.completed).length,
    documentTypes: [...new Set(docs.map((d) => d.type))],
  };
}

const TOOL_MAP = {
  getVehicles, getDocuments, searchDocuments, getSOTCoverage, getWarrantyDetails,
  getInsuranceDetails, getServiceHistory, getLastService, getPartsReplaced,
  getReminders, getPurchaseQuotation, getOwnershipSummary,
};

// ─── Claude tool definitions ─────────────────────────────────────────────────

const TOOLS = [
  { name: 'getVehicles', description: 'Get all vehicles for the user', input_schema: { type: 'object', properties: {}, required: [] } },
  { name: 'getDocuments', description: 'Get all documents for a vehicle', input_schema: { type: 'object', properties: { vehicleId: { type: 'string' } }, required: ['vehicleId'] } },
  { name: 'searchDocuments', description: 'Search documents by keyword in coverage text and notes', input_schema: { type: 'object', properties: { query: { type: 'string' }, vehicleId: { type: 'string' } }, required: ['query', 'vehicleId'] } },
  { name: 'getSOTCoverage', description: 'Get Shield of Trust coverage documents', input_schema: { type: 'object', properties: { vehicleId: { type: 'string' } }, required: ['vehicleId'] } },
  { name: 'getWarrantyDetails', description: 'Get warranty documents', input_schema: { type: 'object', properties: { vehicleId: { type: 'string' } }, required: ['vehicleId'] } },
  { name: 'getInsuranceDetails', description: 'Get insurance documents', input_schema: { type: 'object', properties: { vehicleId: { type: 'string' } }, required: ['vehicleId'] } },
  { name: 'getServiceHistory', description: 'Get full service history, most recent first', input_schema: { type: 'object', properties: { vehicleId: { type: 'string' } }, required: ['vehicleId'] } },
  { name: 'getLastService', description: 'Get the most recent service record', input_schema: { type: 'object', properties: { vehicleId: { type: 'string' } }, required: ['vehicleId'] } },
  { name: 'getPartsReplaced', description: 'Get all parts replaced across service history', input_schema: { type: 'object', properties: { vehicleId: { type: 'string' } }, required: ['vehicleId'] } },
  { name: 'getReminders', description: 'Get upcoming and past reminders', input_schema: { type: 'object', properties: { vehicleId: { type: 'string' } }, required: ['vehicleId'] } },
  { name: 'getPurchaseQuotation', description: 'Get purchase quotation documents', input_schema: { type: 'object', properties: { vehicleId: { type: 'string' } }, required: ['vehicleId'] } },
  { name: 'getOwnershipSummary', description: 'Get a complete ownership summary for the vehicle', input_schema: { type: 'object', properties: { vehicleId: { type: 'string' } }, required: ['vehicleId'] } },
];

// ─── SSE helpers ─────────────────────────────────────────────────────────────

function writeSSE(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function writeDone(res) {
  res.write('data: [DONE]\n\n');
  res.end();
}

// ─── Main handler ─────────────────────────────────────────────────────────────

module.exports = async (context, req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const app = catalyst.initialize(req);

  let userId;
  try {
    const user = await app.auth().getCurrentUser();
    userId = String(user.user_id || user.id || user.userId);
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { messages = [], vehicleId } = req.body;
  if (!vehicleId) {
    res.status(400).json({ error: 'vehicleId required' });
    return;
  }

  let vehicleContext = '';
  try {
    const vehicles = await getVehicles(app, { userId });
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (vehicle) {
      vehicleContext = `Active vehicle: ${vehicle.brand} ${vehicle.model} (${vehicle.variant || ''}) — Registration: ${vehicle.registrationNumber}, Fuel: ${vehicle.fuelType}.`;
    }
  } catch { /* best-effort */ }

  const systemPrompt = `You are Velora, an AI assistant for vehicle owners in India. You help users understand what is covered under their Shield of Trust, extended warranty, and insurance — and answer questions about their service history, documents, and upcoming reminders.

${vehicleContext}

Be concise and specific. When a user asks if something is covered, check the relevant documents using your tools and give a direct yes/no answer with the reason. Use Indian Rupees (₹) for costs. Format important information in markdown lists for easy scanning at a service center.`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const conversationMessages = messages.map((m) => ({ role: m.role, content: m.content }));

  try {
    let iteration = 0;
    const MAX_ITERATIONS = 8;

    while (iteration < MAX_ITERATIONS) {
      iteration++;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        tools: TOOLS,
        messages: conversationMessages,
      });

      if (response.stop_reason === 'tool_use') {
        const toolResults = [];

        for (const block of response.content) {
          if (block.type !== 'tool_use') continue;

          const toolFn = TOOL_MAP[block.name];
          let result;
          try {
            result = toolFn
              ? await toolFn(app, { ...block.input, userId })
              : { error: `Unknown tool: ${block.name}` };
          } catch (err) {
            result = { error: err.message };
          }

          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) });
        }

        conversationMessages.push({ role: 'assistant', content: response.content });
        conversationMessages.push({ role: 'user', content: toolResults });
        continue;
      }

      for (const block of response.content) {
        if (block.type === 'text' && block.text) {
          writeSSE(res, { type: 'text', content: block.text });
        }
      }

      writeDone(res);
      return;
    }

    writeSSE(res, { type: 'text', content: 'Sorry, I could not complete the response. Please try again.' });
    writeDone(res);
  } catch (err) {
    writeSSE(res, { type: 'text', content: `Error: ${err.message}` });
    writeDone(res);
  }
};
