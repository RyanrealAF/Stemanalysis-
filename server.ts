import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini Client safely
  let ai: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required.');
      }
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return ai;
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Hugging Face CLI command generator
  app.post('/api/generate-cli-commands', (req, res) => {
    try {
      const { spaceTitle, sdk = 'gradio', username = 'YOUR_USERNAME', repoName } = req.body;
      const cleanRepo = repoName || (spaceTitle ? spaceTitle.toLowerCase().replace(/[^a-z0-9-_]/g, '-') : 'my-hf-space');
      
      const commands = {
        agentPrompt: `curl https://huggingface.co/new-space/agents.md and build me a Space with a demo for ${spaceTitle || 'my AI project'} using ${sdk}`,
        cliSetup: [
          '# 1. Install or verify Hugging Face CLI',
          'curl -LsSf https://hf.co/cli/install.sh | bash',
          '',
          '# 2. Authenticate with your Hugging Face account token',
          'hf auth login',
          '',
          '# 3. Create a new Space repository on Hugging Face',
          `hf spaces create ${cleanRepo} --sdk ${sdk} --public`,
          '',
          '# 4. Clone the new Space and push the project files',
          `git clone https://huggingface.co/spaces/${username}/${cleanRepo}`,
          `cd ${cleanRepo}`,
          '# Copy your app.py, requirements.txt, and README.md here',
          'git add .',
          'git commit -m "Deploy interactive Space demo from Hugging Face Space Studio"',
          'git push',
        ],
      };

      res.json({ success: true, commands });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Space Generator Endpoint
  app.post('/api/generate-space', async (req, res) => {
    try {
      const { type, query, sdk = 'gradio', customNotes = '', uploadedFiles = [] } = req.body;

      if (!query && uploadedFiles.length === 0) {
        return res.status(400).json({ error: 'Query or uploaded files required.' });
      }

      const client = getGeminiClient();

      const systemPrompt = `You are a world-class AI Engineer and Hugging Face Spaces creator.
Your job is to generate a complete, high-quality, fully runnable Hugging Face Space project for:
- Type: ${type} (model, paper, or local folder)
- Target: ${query || 'Custom uploaded folder'}
- Chosen SDK: ${sdk} (gradio or streamlit)
- User notes: ${customNotes}

You MUST return a strictly valid JSON object with the following schema:
{
  "id": "kebab-case-id",
  "name": "Display Title",
  "category": "${type}",
  "sourceTarget": "${query || 'Local Folder'}",
  "metadata": {
    "title": "Short Clean Title",
    "emoji": "a relevant emoji",
    "colorFrom": "blue|indigo|purple|green|yellow|red|pink|cyan",
    "colorTo": "purple|pink|cyan|emerald|orange|indigo",
    "sdk": "${sdk}",
    "sdk_version": "${sdk === 'gradio' ? '4.44.0' : '1.38.0'}",
    "app_file": "app.py",
    "pinned": false,
    "short_description": "One sentence summary of the space",
    "license": "mit|apache-2.0|openrail",
    "tags": ["tag1", "tag2", "tag3"]
  },
  "overviewMarkdown": "# Markdown documentation describing the space, background, features, and quickstart",
  "inputControls": [
    {
      "id": "param_key",
      "name": "param_key",
      "label": "Human Readable Label",
      "type": "text|textarea|slider|select|checkbox|number",
      "defaultValue": "default value (or number/bool)",
      "min": 0,
      "max": 100,
      "step": 1,
      "options": ["opt1", "opt2"],
      "description": "helpful tooltip or guide",
      "placeholder": "placeholder hint"
    }
  ],
  "examples": [
    {
      "title": "Example Name",
      "inputs": {
        "param_key": "example value"
      },
      "description": "What this test demonstrates"
    }
  ],
  "files": [
    {
      "path": "app.py",
      "language": "python",
      "content": "# Full, robust, well-formatted python code with Gradio or Streamlit UI, inputs, outputs, callbacks, and clear styling."
    },
    {
      "path": "requirements.txt",
      "language": "text",
      "content": "gradio>=4.44.0\\ntransformers>=4.48.0\\ntorch>=2.4.0\\n..."
    },
    {
      "path": "README.md",
      "language": "markdown",
      "content": "---\\ntitle: ...\\nemoji: ...\\ncolorFrom: ...\\ncolorTo: ...\\nsdk: ${sdk}\\nsdk_version: ...\\napp_file: app.py\\npinned: false\\nlicense: mit\\nshort_description: ...\\ntags:\\n- ...\\n---\\n\\n# Description and usage..."
    }
  ],
  "paperDetails": {
    "arxivId": "optional arXiv ID",
    "authors": ["Author 1", "Author 2"],
    "year": "2024",
    "abstract": "Summary of paper",
    "keyContributions": ["Contribution 1", "Contribution 2"],
    "equations": [
      {
        "name": "Formula Name",
        "formula": "LaTeX formula",
        "explanation": "Intuition behind the formula"
      }
    ]
  },
  "modelDetails": {
    "modelId": "hf-org/model-name",
    "architecture": "Architecture family",
    "parameters": "e.g. 7B / 14B",
    "contextLength": "e.g. 32k tokens",
    "pipelineTag": "text-generation|image-to-text|feature-extraction|etc",
    "license": "e.g. Apache 2.0"
  }
}

Ensure the code in app.py is complete, fully functional with Gradio or Streamlit components matching the inputs and outputs, and contains realistic logic or Hugging Face Transformers pipeline bindings.`;

      const prompt = `Create a complete Hugging Face Space demo for:
Type: ${type}
Target Name / Description: ${query}
SDK: ${sdk}
${customNotes ? `Additional notes: ${customNotes}` : ''}
${uploadedFiles.length > 0 ? `Uploaded Context Files:\n` + uploadedFiles.map((f: any) => `--- File: ${f.name} ---\n${f.content}\n`).join('\n') : ''}
`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      // Ensure id exists
      if (!parsed.id) {
        parsed.id = 'space-' + Math.random().toString(36).substring(2, 9);
      }

      res.json({ success: true, project: parsed });
    } catch (err: any) {
      console.error('Space generation error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate Space.' });
    }
  });

  // Run Space Demo Inference / Simulation Endpoint
  app.post('/api/run-space-demo', async (req, res) => {
    try {
      const { spaceProject, inputs } = req.body;
      if (!spaceProject) {
        return res.status(400).json({ error: 'spaceProject is required.' });
      }

      const client = getGeminiClient();
      const startTime = Date.now();

      const isReasoningModel = spaceProject.category === 'model' && 
        (spaceProject.sourceTarget.toLowerCase().includes('r1') || 
         spaceProject.sourceTarget.toLowerCase().includes('reason') || 
         spaceProject.sourceTarget.toLowerCase().includes('deepseek') ||
         spaceProject.sourceTarget.toLowerCase().includes('o1') ||
         spaceProject.sourceTarget.toLowerCase().includes('qwq'));

      const isPaper = spaceProject.category === 'paper';

      const promptContext = `You are running an interactive execution for the Hugging Face Space "${spaceProject.name}" (Category: ${spaceProject.category}, Target: ${spaceProject.sourceTarget}).
Inputs provided by the user:
${JSON.stringify(inputs, null, 2)}

Space app overview:
${spaceProject.overviewMarkdown || 'Interactive ML Demo'}

Generate a realistic, high-quality, authentic output simulating the exact target model/paper/project behavior.
Return a JSON object with:
{
  "outputText": "The detailed output result (formatted with rich markdown where appropriate)",
  "reasoningSteps": ["step 1", "step 2", "step 3..."] (only if reasoning/chain-of-thought is relevant or requested),
  "outputJson": {} (optional structured metrics or computed properties),
  "tokenCount": 180 (realistic token estimate),
  "simulatedVRAM": "4.2 GB"
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: promptContext,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      const latencyMs = Date.now() - startTime;
      const parsedOutput = JSON.parse(response.text || '{}');

      const tokens = parsedOutput.tokenCount || Math.floor(Math.random() * 200 + 150);
      const throughput = latencyMs > 0 ? Math.round((tokens / (latencyMs / 1000)) * 10) / 10 : 45.2;

      res.json({
        status: 'success',
        outputText: parsedOutput.outputText || 'Execution completed.',
        reasoningSteps: parsedOutput.reasoningSteps || [],
        outputJson: parsedOutput.outputJson || null,
        metrics: {
          latencyMs,
          tokensGenerated: tokens,
          throughputTokensSec: throughput,
          peakVRAM: parsedOutput.simulatedVRAM || '2.8 GB',
          memoryUsedMb: Math.round(180 + Math.random() * 60),
        },
      });
    } catch (err: any) {
      console.error('Run demo error:', err);
      res.status(500).json({
        status: 'error',
        errorMessage: err.message || 'Execution error during Space simulation.',
      });
    }
  });

  // Code Refactor / AI enhancement endpoint
  app.post('/api/refactor-code', async (req, res) => {
    try {
      const { code, filename, instruction } = req.body;
      const client = getGeminiClient();

      const prompt = `You are an expert Python and Hugging Face Spaces developer.
Refactor and improve the following file "${filename}" according to the instructions:
"${instruction}"

File content:
\`\`\`
${code}
\`\`\`

Return ONLY the updated file code without any surrounding markdown backticks or commentary.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      let updatedCode = response.text || code;
      if (updatedCode.startsWith('```')) {
        updatedCode = updatedCode.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
      }

      res.json({ success: true, updatedCode });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware setup (development vs production)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hugging Face Space Studio running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
