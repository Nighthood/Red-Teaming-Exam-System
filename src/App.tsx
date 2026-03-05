import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { Clock, ShieldAlert, FileText, Download, CheckCircle, Play, Loader2 } from 'lucide-react';

type AppState = 'setup' | 'generating' | 'active' | 'revealed';

interface LogEntry {
  timestamp: string;
  event: string;
  details?: string;
}

interface InjectedError {
  errorType: string;
  errorDescription: string;
  justification: string;
}

interface DocumentData {
  title: string;
  content: string;
  errors: InjectedError[];
}

const STRATEGIC_TOPICS = [
  "Strategy: 'NATO First' Policy",
  "Strategy: Transformation to Warfighting Readiness",
  "Strategy: Whole-of-Society Resilience",
  "Strategy: Defence as an Engine for Economic Growth",
  "Strategy: A New Partnership with Industry",
  "Strategy: Strategic Capability Partnerships",
  "Concept: The Integrated Force Model",
  "Concept: The Digital Targeting Web",
  "Concept: The 'High-Low' Capability Mix",
  "Concept: Atlantic Bastion",
  "Concept: Recce-Strike",
  "Concept: Hybrid Carrier Airwings",
  "Concept: Agile Combat Employment",
  "Foresight: Intensifying Multipolarity and Strategic Competition",
  "Foresight: Rapid and Unpredictable Technological Change",
  "Foresight: Climate Change and Resource Competition",
  "Foresight: Demographic Shifts and Instability",
  "Foresight: Evolving and Opportunistic Hostile Alignments",
  "Foresight: Erosion of Nuclear Non-Proliferation",
  "Foresight: The Enduring Threat of Terrorism"
];

export default function App() {
  const [appState, setAppState] = useState<AppState>('setup');
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [scratchpadText, setScratchpadText] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [sessionId, setSessionId] = useState('');
  const [generationStatus, setGenerationStatus] = useState('');
  const [zuluTime, setZuluTime] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const docPaneRef = useRef<HTMLDivElement>(null);

  const getZuluTimestamp = () => {
    return new Date().toISOString().replace('T', ' ').replace('Z', ' ZULU');
  };

  const addLog = (event: string, details?: string) => {
    setLogs(prev => [...prev, { timestamp: getZuluTimestamp(), event, details }]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setZuluTime(getZuluTimestamp());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const startGeneration = async () => {
    setAppState('generating');
    const sid = crypto.randomUUID().split('-')[0].toUpperCase();
    setSessionId(sid);
    
    const statuses = [
      "Step 1: Strategic Planning - Defining Theme & Flaws...",
      "Step 2: Document Synthesis - Generating Formal Briefing...",
      "Step 3: Finalizing - Structuring Content..."
    ];
    
    setLogs([{ timestamp: getZuluTimestamp(), event: "SESSION_INITIALIZED", details: `Session ID: ${sid}` }]);
    
    // Random Calculations
    const topicIndex = Math.floor(Math.random() * 20);
    const selectedTopic = STRATEGIC_TOPICS[topicIndex];
    const errorCount = Math.floor(Math.random() * 5) + 1;
    
    addLog("CALCULATION_PERFORMED", `Selected Topic: [${topicIndex + 1}] ${selectedTopic}\nTarget Error Count: ${errorCount}`);
    addLog("GENERATION_STARTED", "Initiating multi-stage strategic document synthesis...");
    
    let statusIndex = 0;
    setGenerationStatus(statuses[statusIndex]);
    
    const statusInterval = setInterval(() => {
      statusIndex = Math.min(statusIndex + 1, statuses.length - 1);
      setGenerationStatus(statuses[statusIndex]);
    }, 5000);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // PHASE 1: PLANNING
      addLog("API_CALL_PHASE_1_INITIATED", "Requesting strategic plan and error design from Gemini...");
      
      const planningPrompt = `
You are a strategic planner for the UK Ministry of Defence. 
Your task is to plan a Strategic Document (Strategy, Concept, or Foresight Assessment) on the following topic: "${selectedTopic}".

CRITICAL CONSTRAINTS:
1. The strategic concept must NOT be centered around Artificial Intelligence (AI), Machine Learning, or autonomous cyber systems.
2. You must plan exactly ${errorCount} subtle, logical, or foundational flaws to inject into the final document.
3. These flaws must be internally consistent but logically fatal, appropriate to the context of the document being written.

Return your plan as a JSON object:
{
  "documentTheme": "A brief description of the document's focus",
  "outline": ["Section 1 focus", "Section 2 focus", "..."],
  "plannedErrors": [
    {
      "errorType": "Type of error",
      "errorDescription": "Detailed description of how this flaw will be manifested",
      "justification": "Why this is a fatal issue"
    }
  ]
}
      `;

      addLog("PROMPT_PHASE_1", planningPrompt);

      const planningResponse = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: planningPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              documentTheme: { type: Type.STRING },
              outline: { type: Type.ARRAY, items: { type: Type.STRING } },
              plannedErrors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    errorType: { type: Type.STRING },
                    errorDescription: { type: Type.STRING },
                    justification: { type: Type.STRING },
                  },
                  required: ['errorType', 'errorDescription', 'justification'],
                }
              }
            },
            required: ['documentTheme', 'outline', 'plannedErrors'],
          },
        },
      });

      addLog("API_RESPONSE_PHASE_1_RECEIVED", planningResponse.text);
      const plan = JSON.parse(planningResponse.text);

      // PHASE 2: SYNTHESIS
      addLog("API_CALL_PHASE_2_INITIATED", "Requesting full document synthesis based on the approved plan...");

      const synthesisPrompt = `
Based on the following strategic plan, write a full formal Strategic Document for the UK Ministry of Defence.

PLAN:
Theme: ${plan.documentTheme}
Outline: ${plan.outline.join(', ')}
Injected Flaws to Include:
${plan.plannedErrors.map((e: any, i: number) => `${i+1}. ${e.errorType}: ${e.errorDescription}`).join('\n')}

REQUIREMENTS:
1. The document should be approximately 800–1,200 words.
2. Use UK-specific terminology and reflect the tone of a formal document issued by the UK MOD.
3. Use rich Markdown formatting (headings ##, subheadings ###, bulleted lists).
4. Ensure the planned flaws are woven seamlessly into the logic of the document so they are subtle but identifiable by a professional.

Return the final document as a JSON object:
{
  "title": "The formal title of the document",
  "content": "The full Markdown text of the document",
  "errors": [
    {
      "errorType": "Type of error",
      "errorDescription": "Description of the flaw as it appears in the text",
      "justification": "Why this is a fatal issue"
    }
  ]
}
      `;

      addLog("PROMPT_PHASE_2", synthesisPrompt);

      const synthesisResponse = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: synthesisPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              errors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    errorType: { type: Type.STRING },
                    errorDescription: { type: Type.STRING },
                    justification: { type: Type.STRING },
                  },
                  required: ['errorType', 'errorDescription', 'justification'],
                }
              }
            },
            required: ['title', 'content', 'errors'],
          },
        },
      });

      addLog("API_RESPONSE_PHASE_2_RECEIVED", synthesisResponse.text);
      const data = JSON.parse(synthesisResponse.text);
      
      setDocumentData(data);
      clearInterval(statusInterval);
      setAppState('active');
      addLog("TEST_TIMER_STARTED", "10:00 countdown initiated.");
      setTimeRemaining(600);
    } catch (error) {
      addLog("API_CALL_FAILED", error instanceof Error ? error.message : String(error));
      console.error(error);
      clearInterval(statusInterval);
      setAppState('setup');
      alert('Failed to generate scenario. Please try again.');
    }
  };

  useEffect(() => {
    if (appState === 'active' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setAppState('revealed');
            addLog("TEST_TIMER_EXPIRED", "Analysis phase concluded.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (appState !== 'active' && timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [appState, timeRemaining]);

  // Log scrolling
  useEffect(() => {
    const pane = docPaneRef.current;
    if (!pane || appState !== 'active') return;

    let lastScrollY = 0;
    const handleScroll = () => {
      const currentScrollY = pane.scrollTop;
      if (Math.abs(currentScrollY - lastScrollY) > 200) {
        addLog("USER_MOVEMENT", `Scrolled to position: ${currentScrollY}px`);
        lastScrollY = currentScrollY;
      }
    };

    pane.addEventListener('scroll', handleScroll);
    return () => pane.removeEventListener('scroll', handleScroll);
  }, [appState]);

  const handleScratchpadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setScratchpadText(newText);
    if (appState === 'active') {
      // Log keystroke event (simplified to content update)
      const lastChar = newText.slice(-1);
      addLog("USER_KEYSTROKE", `Input updated. Last character: "${lastChar}"`);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const downloadTxt = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportLog = () => {
    const logContent = logs.map(l => `[${l.timestamp}] ${l.event}${l.details ? `\nDetails: ${l.details}` : ''}`).join('\n\n');
    downloadTxt(`RedTeam_Log_${sessionId}.txt`, `SESSION LOG - ${sessionId}\nDATE: ${new Date().toDateString()}\n\n${logContent}`);
  };

  const exportScenario = () => {
    if (!documentData) return;
    downloadTxt(`RedTeam_Scenario_${sessionId}.txt`, `${documentData.title}\n\n${documentData.content}`);
  };

  const exportErrors = () => {
    if (!documentData) return;
    const errorsText = documentData.errors.map((err, index) => `
FLAW #${index + 1}
Error Type: ${err.errorType}
Description: ${err.errorDescription}
Justification: ${err.justification}
`).join('\n');
    downloadTxt(`RedTeam_Errors_${sessionId}.txt`, `INJECTED FLAWS - ${sessionId}\n${errorsText}`);
  };

  const exportNotes = () => {
    downloadTxt(`RedTeam_Notes_${sessionId}.txt`, `ANALYST NOTES - ${sessionId}\n\n${scratchpadText}`);
  };

  return (
    <>
      {/* Screen Layout */}
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans print:hidden">
        <div className="w-full max-w-[1600px] aspect-video bg-zinc-900 rounded-xl shadow-2xl overflow-hidden flex flex-col border border-zinc-800 relative">
          {/* Header */}
          <header className="h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0 z-20 relative">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              <h1 className="font-bold tracking-widest uppercase text-sm text-zinc-300">MOD Red-Team Eval</h1>
            </div>
            
            {appState === 'active' || appState === 'revealed' ? (
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none mb-1">Zulu Time</span>
                  <span className="font-mono text-xs text-zinc-400">{zuluTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Session ID</span>
                  <span className="font-mono text-sm text-zinc-300 bg-zinc-800 px-2 py-1 rounded">{sessionId}</span>
                </div>
                <div className={`flex items-center gap-2 font-mono text-2xl ${timeRemaining <= 60 && appState === 'active' ? 'text-red-500 animate-pulse' : 'text-zinc-100'}`}>
                  <Clock className="w-5 h-5" />
                  {formatTime(timeRemaining)}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none mb-1">Zulu Time</span>
                <span className="font-mono text-xs text-zinc-400">{zuluTime}</span>
              </div>
            )}
          </header>

          {/* Main Content */}
          <main className="flex-1 flex overflow-hidden relative">
            {appState === 'setup' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
                <ShieldAlert className="w-24 h-24 text-zinc-800 mb-6" />
                <h2 className="text-3xl font-light tracking-tight mb-2">Blinded Human Benchmark</h2>
                <p className="text-zinc-400 max-w-md text-center mb-8">
                  You will be presented with a generated UK Military Strategic Document. 
                  It contains a random number of logically fatal flaws. You have 10 minutes to identify them.
                </p>
                <button 
                  onClick={startGeneration}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md font-medium tracking-wide transition-colors flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Initialize Scenario
                </button>
              </div>
            )}

            {appState === 'generating' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
                <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-6" />
                <h2 className="text-xl font-medium tracking-wide mb-2">Generating Scenario</h2>
                <p className="text-zinc-400 font-mono text-sm">{generationStatus}</p>
                <div className="w-64 h-1 bg-zinc-800 rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-red-500 animate-pulse w-full origin-left" style={{ animationDuration: '3s' }}></div>
                </div>
              </div>
            )}

            {/* Left Pane: Document */}
            <div 
              ref={docPaneRef}
              className="w-[60%] h-full bg-[#f4f4f0] text-zinc-900 overflow-y-auto border-r border-zinc-800 relative"
            >
              <div className="max-w-3xl mx-auto p-12 font-serif">
                {documentData && (
                  <>
                    <div className="border-b-2 border-zinc-900 pb-6 mb-8 text-center">
                      <h1 className="text-3xl font-bold mb-2 uppercase tracking-wider">{documentData.title}</h1>
                      <p className="text-sm font-sans tracking-widest text-zinc-600 uppercase">Ministry of Defence • Strategic Assessment</p>
                      <p className="text-xs font-sans text-zinc-500 mt-2">CLASSIFICATION: OFFICIAL-SENSITIVE (SIMULATED)</p>
                    </div>
                    <div className="prose prose-zinc prose-p:leading-relaxed prose-headings:font-bold max-w-none">
                      <ReactMarkdown>{documentData.content}</ReactMarkdown>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Pane: Scratchpad */}
            <div className="w-[40%] h-full bg-zinc-900 flex flex-col">
              <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
                <h2 className="font-medium text-zinc-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Analyst Scratchpad
                </h2>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Findings & Justification</span>
              </div>
              <div className="flex-1 p-4 flex flex-col">
                <textarea
                  className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-md p-4 text-zinc-300 font-mono text-sm resize-none focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Document your findings here. Identify the fatal flaw and justify your reasoning..."
                  value={scratchpadText}
                  onChange={handleScratchpadChange}
                  disabled={appState === 'revealed'}
                />
              </div>
              
              {/* Footer Actions */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-950 shrink-0">
                {appState === 'active' ? (
                  <button
                    onClick={() => {
                      setAppState('revealed');
                      addLog("TEST_SUBMITTED_EARLY", `Time remaining: ${formatTime(timeRemaining)}`);
                    }}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Submit Analysis / Reveal Truth
                  </button>
                ) : appState === 'revealed' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={exportLog}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      Log (.txt)
                    </button>
                    <button
                      onClick={exportScenario}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      Scenario (.txt)
                    </button>
                    <button
                      onClick={exportErrors}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      Errors (.txt)
                    </button>
                    <button
                      onClick={exportNotes}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      Notes (.txt)
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </main>

          {/* Ground Truth Modal/Panel */}
          {appState === 'revealed' && documentData && (
            <div className="absolute bottom-0 left-0 w-[60%] h-[50%] bg-zinc-950 border-t border-r border-zinc-800 p-6 shadow-2xl animate-in slide-in-from-bottom-8 overflow-y-auto">
              <div className="flex items-center gap-2 mb-6 sticky top-0 bg-zinc-950 py-2 z-10 border-b border-zinc-800">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-red-500 uppercase tracking-wider">Ground Truth Revealed ({documentData.errors.length} Flaws)</h3>
              </div>
              
              <div className="space-y-8">
                {documentData.errors.map((error, index) => (
                  <div key={index} className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Flaw #{index + 1}</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Error Type</span>
                        <p className="font-medium text-zinc-200">{error.errorType}</p>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Injected Flaw</span>
                        <p className="text-sm text-zinc-300 leading-relaxed">{error.errorDescription}</p>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Justification (Why it's fatal)</span>
                        <p className="text-sm text-zinc-300 leading-relaxed">{error.justification}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
