import React, { useState } from 'react';
import { generateResumeContent } from './aiConfig';
import jsPDF from 'jspdf';
import { FileText, Mail, Globe, Download, Sparkles, User } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('resume');
  const [loading, setLoading] = useState(false);

  // --- 1. SHARED DATA ---
  const [sharedData, setSharedData] = useState({
    name: "",
    email: "",
    skills: "",
    rawExperience: ""
  });

  // --- 2. SPECIFIC INPUTS ---
  const [resumeJobTitle, setResumeJobTitle] = useState("");
  const [letterCompany, setLetterCompany] = useState("");
  const [letterJobDesc, setLetterJobDesc] = useState("");

  // --- 3. AI RESULTS ---
  const [resumeResult, setResumeResult] = useState("");
  const [letterResult, setLetterResult] = useState("");
  const [portfolioResult, setPortfolioResult] = useState("");

  const handleSharedChange = (e) => {
    setSharedData({ ...sharedData, [e.target.name]: e.target.value });
  };

  // --- AI FUNCTION: RESUME ---
  const generateResume = async () => {
    if (!sharedData.rawExperience) return alert("Please enter your experience in Step 1!");
    setLoading(true);
    const prompt = `
      You are an expert resume writer. Rewrite this experience into professional resume bullet points.
      
      Name: ${sharedData.name}
      Target Role: ${resumeJobTitle}
      Skills: ${sharedData.skills}
      Messy Experience: ${sharedData.rawExperience}
      
      Format: Return ONLY the clean, professional bullet points. No intro text.
    `;
    const result = await generateResumeContent(prompt);
    setResumeResult(result);
    setLoading(false);
  };

  // --- AI FUNCTION: COVER LETTER ---
  const generateLetter = async () => {
    if (!letterCompany) return alert("Please enter the Company Name!");
    setLoading(true);
    const prompt = `
      Write a professional cover letter for ${sharedData.name}.
      
      My Skills: ${sharedData.skills}
      My Experience: ${sharedData.rawExperience}
      Applying to Company: ${letterCompany}
      Job Description: ${letterJobDesc}
      
      Tone: Confident and professional. Keep it under 200 words.
    `;
    const result = await generateResumeContent(prompt);
    setLetterResult(result);
    setLoading(false);
  };

  // --- AI FUNCTION: PORTFOLIO BIO (UPDATED FOR WEB GENERATION) ---
  const generatePortfolio = async () => {
    if (!sharedData.name) return alert("Please enter your Name in Step 1!");
    setLoading(true);

    // We now tell Gemini to act as a web developer and write pure HTML
    const prompt = `
      You are an expert frontend web developer. Create a stunning, single-page personal portfolio website for ${sharedData.name}.
      
      Skills: ${sharedData.skills}
      Experience: ${sharedData.rawExperience}
      Email: ${sharedData.email}
      
      Requirements:
      1. Return ONLY pure, raw HTML code. DO NOT wrap it in markdown code blocks (like \`\`\`html). No explanations.
      2. Include <script src="https://cdn.tailwindcss.com"></script> in the <head> for styling.
      3. Use a modern, dark-theme UI with a Hero section, About section, and a Projects section.
      4. Ensure it is fully responsive.
    `;

    try {
      let result = await generateResumeContent(prompt);
      // Clean up the output just in case the AI still tries to add markdown backticks
      result = result.replace(/```html/gi, '').replace(/```/g, '').trim();
      setPortfolioResult(result);
    } catch (error) {
      alert("Error generating portfolio. Please try again.");
    }
    setLoading(false);
  };

  // --- DOWNLOAD PDF HELPER ---
  const downloadPDF = (filename, content) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(filename.replace(/_/g, " "), 20, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    const splitText = doc.splitTextToSize(content || "", 180);
    doc.text(splitText, 20, 30);

    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#1e1e24] text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500 selection:text-white">

      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-8 text-center lg:text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold text-blue-500 tracking-tight">
          🚀 AI Career Builder
        </h1>
        <p className="text-slate-400 mt-2 text-sm md:text-lg">
          Resume • Cover Letter • Portfolio Generator
        </p>
      </header>

      {/* MAIN 2-COLUMN GRID */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT SIDE: Inputs (Takes 5/12 columns on desktop) */}
        <div className="lg:col-span-5 space-y-6">

          {/* STEP 1: Core Profile */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-2">
              <User size={24} className="text-blue-500" /> Step 1: Your Core Profile
            </h3>
            <p className="text-slate-400 text-sm mb-4">Enter your details once, use them for all 3 tools.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" placeholder="Full Name" onChange={handleSharedChange} className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              <input name="email" placeholder="Email Address" onChange={handleSharedChange} className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              <input name="skills" placeholder="Skills (React, Python, Java...)" onChange={handleSharedChange} className="md:col-span-2 w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              <textarea name="rawExperience" placeholder="Paste your messy experience here (e.g. I built a crop prediction app...)" onChange={handleSharedChange} className="md:col-span-2 w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all h-24 resize-none" />
            </div>
          </div>

          {/* STEP 2: Tools Area */}
          <div>
            {/* TABS */}
            <div className="flex gap-2 pl-4">
              <button onClick={() => setActiveTab('resume')} className={`px-6 py-3 rounded-t-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'resume' ? 'bg-slate-800 text-blue-400 border-t border-l border-r border-slate-700' : 'bg-slate-900/50 text-slate-500 hover:text-slate-300'}`}>
                <FileText size={18} /> Resume
              </button>
              <button onClick={() => setActiveTab('letter')} className={`px-6 py-3 rounded-t-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'letter' ? 'bg-slate-800 text-blue-400 border-t border-l border-r border-slate-700' : 'bg-slate-900/50 text-slate-500 hover:text-slate-300'}`}>
                <Mail size={18} /> Letter
              </button>
              <button onClick={() => setActiveTab('portfolio')} className={`px-6 py-3 rounded-t-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'portfolio' ? 'bg-slate-800 text-blue-400 border-t border-l border-r border-slate-700' : 'bg-slate-900/50 text-slate-500 hover:text-slate-300'}`}>
                <Globe size={18} /> Portfolio
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="bg-slate-800 p-6 rounded-b-2xl rounded-tr-2xl border border-slate-700 shadow-xl min-h-[250px]">

              {activeTab === 'resume' && (
                <div className="animate-in fade-in duration-300">
                  <h3 className="text-xl font-bold text-white mb-1">Resume Builder</h3>
                  <p className="text-slate-400 text-sm mb-4">AI turns your raw experience into professional bullet points.</p>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Target Job Title</label>
                  <input placeholder="e.g. Frontend Developer" value={resumeJobTitle} onChange={(e) => setResumeJobTitle(e.target.value)} className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all mb-4" />
                  <button onClick={generateResume} disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2">
                    {loading ? "Generating..." : "✨ Generate Resume Points"}
                  </button>
                </div>
              )}

              {activeTab === 'letter' && (
                <div className="animate-in fade-in duration-300">
                  <h3 className="text-xl font-bold text-white mb-1">Cover Letter Writer</h3>
                  <p className="text-slate-400 text-sm mb-4">AI writes a targeted letter for this specific company.</p>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Company Name</label>
                  <input placeholder="e.g. Google" value={letterCompany} onChange={(e) => setLetterCompany(e.target.value)} className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all mb-4" />
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Job Description (Optional)</label>
                  <textarea placeholder="Paste requirements here..." value={letterJobDesc} onChange={(e) => setLetterJobDesc(e.target.value)} className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all h-24 resize-none mb-4" />
                  <button onClick={generateLetter} disabled={loading} className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2">
                    {loading ? "Writing..." : "✨ Write Cover Letter"}
                  </button>
                </div>
              )}

              {activeTab === 'portfolio' && (
                <div className="animate-in fade-in duration-300">
                  <h3 className="text-xl font-bold text-white mb-1">Portfolio Generator</h3>
                  <p className="text-slate-400 text-sm mb-4">Generates a fully coded, responsive portfolio website.</p>
                  <div className="bg-orange-900/30 border border-orange-500/30 p-4 rounded-lg mb-4 text-orange-200 text-sm">
                    <strong>Tip:</strong> Ensure you filled out Step 1 completely for the best result!
                  </div>
                  <button onClick={generatePortfolio} disabled={loading} className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2">
                    {loading ? "Creating Web Page..." : "✨ Generate Portfolio Website"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Live Preview (Takes 7/12 columns on desktop) */}
        <div className="lg:col-span-7">

          {/* STICKY CONTAINER: This stays on screen when scrolling the left side! */}
          <div className="sticky top-8 bg-slate-50 text-slate-900 rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[calc(100vh-4rem)] min-h-[600px] overflow-hidden">

            {/* Preview Header */}
            <div className="bg-white border-b border-slate-200 p-5 flex justify-between items-center z-10">
              <h3 className="font-bold flex items-center gap-2 text-lg">
                <Sparkles size={20} className="text-yellow-500" />
                {activeTab === 'resume' ? "Resume Preview" : activeTab === 'letter' ? "Letter Preview" : "Live Web Preview"}
              </h3>

              {/* Only show PDF download for Resume and Letter. Portfolio is HTML now! */}
              {(activeTab === 'resume' && resumeResult) || (activeTab === 'letter' && letterResult) ? (
                <button onClick={() => downloadPDF(activeTab === 'resume' ? "My_Resume" : "My_Cover_Letter", activeTab === 'resume' ? resumeResult : letterResult)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                  <Download size={16} /> Save PDF
                </button>
              ) : null}
            </div>

            {/* Preview Body (Scrollable) */}
            <div className={`flex-1 overflow-y-auto bg-[#fafafa] ${activeTab === 'portfolio' ? 'p-0' : 'p-8'}`}>

              {/* IF PORTFOLIO TAB IS ACTIVE AND WE HAVE A RESULT: RENDER IFRAME */}
              {activeTab === 'portfolio' && portfolioResult ? (
                <iframe
                  srcDoc={portfolioResult}
                  className="w-full h-full min-h-[600px] border-0 bg-white"
                  title="Portfolio Preview"
                  sandbox="allow-scripts"
                />
              ) : (
                /* OTHERWISE: RENDER TEXT FOR RESUME/LETTER OR EMPTY STATE */
                <div className="max-w-prose mx-auto whitespace-pre-wrap leading-relaxed text-slate-700 text-[15px]">
                  {activeTab === 'resume' && resumeResult ? resumeResult :
                    activeTab === 'letter' && letterResult ? letterResult : (
                      <div className="text-slate-400 text-center mt-32 italic flex flex-col items-center gap-4">
                        <FileText size={48} className="opacity-20" />
                        Your AI-generated document will appear here...
                      </div>
                    )}
                </div>
              )}

            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

export default App;