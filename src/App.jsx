import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { FileText, Mail, Globe, Download, Sparkles, User, Briefcase, Code, GraduationCap } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('resume');
  const [loading, setLoading] = useState({ resume: false, letter: false, portfolio: false });

  // --- 1. SHARED DATA (STRUCTURED INPUTS) ---
  const [sharedData, setSharedData] = useState({ name: "", email: "", skills: "" });
  const [experience, setExperience] = useState([{ title: '', company: '', description: '' }]);
  const [projects, setProjects] = useState([{ name: '', tech: '', description: '' }]);
  const [education, setEducation] = useState([{ degree: '', school: '', year: '' }]);

  // --- 2. SPECIFIC INPUTS ---
  const [resumeJobTitle, setResumeJobTitle] = useState("");
  const [letterCompany, setLetterCompany] = useState("");
  const [letterJobDesc, setLetterJobDesc] = useState("");

  // --- 3. AI RESULTS (STORING HTML) ---
  const [resumeResult, setResumeResult] = useState("");
  const [letterResult, setLetterResult] = useState("");
  const [portfolioResult, setPortfolioResult] = useState("");

  // --- HELPERS ---
  const handleSharedChange = (e) => setSharedData({ ...sharedData, [e.target.name]: e.target.value });

  const handleArrayChange = (setter, index, field, value) => {
    setter(prev => {
      const newArr = [...prev];
      newArr[index][field] = value;
      return newArr;
    });
  };

  // --- SECURE API CALL ---
  const callAiApi = async (promptText) => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      const result = await response.json();
      if (result.success) return result.data;
      throw new Error(result.error || "Failed to generate");
    } catch (error) {
      console.error("API Error:", error);
      alert("Error connecting to the API. Please try again.");
      return null;
    }
  };

  // --- HTML SANITIZER (PREVENTS CSS BLEED) ---
  const sanitizeHtml = (rawHtml) => {
    let clean = rawHtml.replace(/```html/gi, '').replace(/```/g, '').trim();
    // Aggressively strip out <style>, <html>, <head>, and <body> tags so they don't break our React app!
    clean = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    clean = clean.replace(/<\/?(html|head|body)[^>]*>/gi, '');
    return clean;
  };

  // --- AI FUNCTION: RESUME (STRUCTURED HTML REFINER & FRESHER FRIENDLY) ---
  const generateResume = async () => {
    if (!sharedData.name) return alert("Please enter at least your name in Step 1!");
    setLoading(prev => ({ ...prev, resume: true }));

    const prompt = `
      You are an expert executive resume writer. REFINE the user's details into a highly professional resume.
      CRITICAL RULES:
      1. DO NOT invent or hallucinate new jobs, degrees, or projects. Only use what is provided.
      2. Transform the basic descriptions into powerful, action-oriented bullet points.
      3. If the user leaves a section completely empty, simply omit that section and focus heavily on expanding their Projects and Education.
      4. DO NOT include <style>, <html>, or <body> tags. Only return the inner content elements (h1, h2, h3, p, ul, li).
      
      USER DATA:
      Name: ${sharedData.name} | Email: ${sharedData.email} | Target Role: ${resumeJobTitle} | Skills: ${sharedData.skills}
      EXPERIENCE: ${JSON.stringify(experience)}
      PROJECTS: ${JSON.stringify(projects)}
      EDUCATION: ${JSON.stringify(education)}
      
      FORMAT REQUIREMENT: 
      Return ONLY valid, clean HTML code. Do NOT wrap it in markdown block quotes (\`\`\`html).
    `;

    let result = await callAiApi(prompt);
    if (result) setResumeResult(sanitizeHtml(result));
    setLoading(prev => ({ ...prev, resume: false }));
  };

  // --- AI FUNCTION: COVER LETTER ---
  const generateLetter = async () => {
    if (!letterCompany) return alert("Please enter the Company Name!");
    setLoading(prev => ({ ...prev, letter: true }));

    const prompt = `
      Write a professional cover letter for ${sharedData.name}.
      Applying to: ${letterCompany} | Job Description: ${letterJobDesc}
      My Skills: ${sharedData.skills} | Experience: ${JSON.stringify(experience)}
      
      Tone: Confident and professional. Under 250 words.
      CRITICAL: DO NOT include <style>, <html>, or <body> tags. Only return the inner <p> tags.
      FORMAT REQUIREMENT: Return ONLY valid, clean HTML code. Do NOT wrap in markdown block quotes.
    `;

    let result = await callAiApi(prompt);
    if (result) setLetterResult(sanitizeHtml(result));
    setLoading(prev => ({ ...prev, letter: false }));
  };

  // --- AI FUNCTION: PORTFOLIO ---
  const generatePortfolio = async () => {
    if (!sharedData.name) return alert("Please enter your Name in Step 1!");
    setLoading(prev => ({ ...prev, portfolio: true }));

    const prompt = `
      Create a stunning, single-page personal portfolio website for ${sharedData.name}.
      Skills: ${sharedData.skills} | Experience: ${JSON.stringify(experience)} | Projects: ${JSON.stringify(projects)}
      
      Requirements:
      1. Return ONLY pure, raw HTML code. DO NOT wrap it in markdown code blocks.
      2. Include <script src="https://cdn.tailwindcss.com"></script> in the <head>.
      3. Use a modern, dark-theme UI. Ensure it is fully responsive.
    `;

    // We do NOT sanitize the portfolio because it lives in an iframe and NEEDS styles/body tags!
    let result = await callAiApi(prompt);
    if (result) {
      result = result.replace(/```html/gi, '').replace(/```/g, '').trim();
      setPortfolioResult(result);
    }
    setLoading(prev => ({ ...prev, portfolio: false }));
  };

  // --- PDF EXPORTER ---
  const downloadPDF = (filename) => {
    const element = document.querySelector('.rsw-ce') || document.getElementById('document-preview');
    if (!element) return;

    const opt = {
      margin: 0.75,
      filename: `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-[#1e1e24] text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500 selection:text-white">
      <header className="max-w-7xl mx-auto mb-8 text-center lg:text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold text-blue-500 tracking-tight">🚀 AI Career Builder</h1>
        <p className="text-slate-400 mt-2 text-sm md:text-lg">Resume • Cover Letter • Portfolio Generator</p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT SIDE: STRUCTURED INPUTS */}
        <div className="lg:col-span-5 space-y-6 h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-10 custom-scrollbar">

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-6">
            <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-2">
              <User size={24} className="text-blue-500" /> Step 1: Your Details
            </h3>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" placeholder="Full Name" onChange={handleSharedChange} className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 outline-none" />
              <input name="email" placeholder="Email Address" onChange={handleSharedChange} className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 outline-none" />
              <input name="skills" placeholder="Skills (React, Python, Java...)" onChange={handleSharedChange} className="md:col-span-2 w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 outline-none" />
            </div>

            <hr className="border-slate-700" />

            {/* Experience */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-slate-300 flex items-center gap-2"><Briefcase size={16} /> Experience</h4>
                <button onClick={() => setExperience([...experience, { title: '', company: '', description: '' }])} className="text-sm text-blue-400 hover:text-blue-300">+ Add Job</button>
              </div>
              {experience.map((exp, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <input placeholder="Job Title" value={exp.title} onChange={(e) => handleArrayChange(setExperience, index, 'title', e.target.value)} className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600 outline-none" />
                  <input placeholder="Company" value={exp.company} onChange={(e) => handleArrayChange(setExperience, index, 'company', e.target.value)} className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600 outline-none" />
                  <textarea placeholder="What did you do? (Keep it brief, AI will polish it!)" value={exp.description} onChange={(e) => handleArrayChange(setExperience, index, 'description', e.target.value)} className="md:col-span-2 w-full p-2 rounded bg-slate-800 text-white border border-slate-600 outline-none h-16 resize-none" />
                </div>
              ))}
            </div>

            {/* Projects */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-slate-300 flex items-center gap-2"><Code size={16} /> Projects</h4>
                <button onClick={() => setProjects([...projects, { name: '', tech: '', description: '' }])} className="text-sm text-blue-400 hover:text-blue-300">+ Add Project</button>
              </div>
              {projects.map((proj, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <input placeholder="Project Name" value={proj.name} onChange={(e) => handleArrayChange(setProjects, index, 'name', e.target.value)} className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600 outline-none" />
                  <input placeholder="Tech Used" value={proj.tech} onChange={(e) => handleArrayChange(setProjects, index, 'tech', e.target.value)} className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600 outline-none" />
                  <textarea placeholder="What did you build?" value={proj.description} onChange={(e) => handleArrayChange(setProjects, index, 'description', e.target.value)} className="md:col-span-2 w-full p-2 rounded bg-slate-800 text-white border border-slate-600 outline-none h-16 resize-none" />
                </div>
              ))}
            </div>

            {/* Education */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-slate-300 flex items-center gap-2"><GraduationCap size={16} /> Education</h4>
                <button onClick={() => setEducation([...education, { degree: '', school: '', year: '' }])} className="text-sm text-blue-400 hover:text-blue-300">+ Add Education</button>
              </div>
              {education.map((edu, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input placeholder="Degree" value={edu.degree} onChange={(e) => handleArrayChange(setEducation, index, 'degree', e.target.value)} className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600 outline-none" />
                  <input placeholder="School" value={edu.school} onChange={(e) => handleArrayChange(setEducation, index, 'school', e.target.value)} className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600 outline-none" />
                  <input placeholder="Year" value={edu.year} onChange={(e) => handleArrayChange(setEducation, index, 'year', e.target.value)} className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600 outline-none" />
                </div>
              ))}
            </div>
          </div>

          {/* GENERATOR TOOLS */}
          <div>
            <div className="flex gap-2 pl-4">
              <button onClick={() => setActiveTab('resume')} className={`px-6 py-3 rounded-t-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'resume' ? 'bg-slate-800 text-blue-400 border-t border-l border-r border-slate-700' : 'bg-slate-900/50 text-slate-500'}`}><FileText size={18} /> Resume</button>
              <button onClick={() => setActiveTab('letter')} className={`px-6 py-3 rounded-t-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'letter' ? 'bg-slate-800 text-blue-400 border-t border-l border-r border-slate-700' : 'bg-slate-900/50 text-slate-500'}`}><Mail size={18} /> Letter</button>
              <button onClick={() => setActiveTab('portfolio')} className={`px-6 py-3 rounded-t-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'portfolio' ? 'bg-slate-800 text-blue-400 border-t border-l border-r border-slate-700' : 'bg-slate-900/50 text-slate-500'}`}><Globe size={18} /> Portfolio</button>
            </div>

            <div className="bg-slate-800 p-6 rounded-b-2xl rounded-tr-2xl border border-slate-700 shadow-xl min-h-[200px]">
              {activeTab === 'resume' && (
                <div className="animate-in fade-in duration-300">
                  <input placeholder="Target Job Title (e.g. Senior Frontend Engineer)" value={resumeJobTitle} onChange={(e) => setResumeJobTitle(e.target.value)} className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white mb-4 outline-none" />
                  <button onClick={generateResume} disabled={loading.resume} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2">
                    {loading.resume ? "Refining Resume..." : "✨ Generate & Polish Resume"}
                  </button>
                </div>
              )}

              {activeTab === 'letter' && (
                <div className="animate-in fade-in duration-300">
                  <input placeholder="Company Name" value={letterCompany} onChange={(e) => setLetterCompany(e.target.value)} className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white mb-4 outline-none" />
                  <textarea placeholder="Job Description (Optional)" value={letterJobDesc} onChange={(e) => setLetterJobDesc(e.target.value)} className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white mb-4 outline-none h-24 resize-none" />
                  <button onClick={generateLetter} disabled={loading.letter} className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2">
                    {loading.letter ? "Writing..." : "✨ Write Cover Letter"}
                  </button>
                </div>
              )}

              {activeTab === 'portfolio' && (
                <div className="animate-in fade-in duration-300">
                  <p className="text-slate-400 text-sm mb-4">Generates a fully coded portfolio using your structured data.</p>
                  <button onClick={generatePortfolio} disabled={loading.portfolio} className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2">
                    {loading.portfolio ? "Coding..." : "✨ Generate Portfolio Website"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: LIVE PREVIEW & INLINE EDITOR */}
        <div className="lg:col-span-7">
          <div className="sticky top-8 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[calc(100vh-4rem)] min-h-[600px] overflow-hidden">

            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center z-10">
              <h3 className="font-bold flex items-center gap-2 text-lg text-slate-800">
                <Sparkles size={20} className="text-yellow-500" />
                {activeTab === 'portfolio' ? "Live Web Preview" : "Interactive Editor (Click to Edit)"}
              </h3>

              {(activeTab === 'resume' && resumeResult) || (activeTab === 'letter' && letterResult) ? (
                <button onClick={() => downloadPDF(activeTab === 'resume' ? "My_Resume" : "My_Cover_Letter")} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                  <Download size={16} /> Save PDF
                </button>
              ) : null}
            </div>

            <div id="document-preview" className="flex-1 overflow-y-auto bg-white p-8">
              {activeTab === 'portfolio' ? (
                portfolioResult ? (
                  <iframe srcDoc={portfolioResult} className="w-full h-full border-0 bg-white" title="Portfolio" sandbox="allow-scripts" />
                ) : (
                  <EmptyState />
                )
              ) : activeTab === 'resume' ? (
                resumeResult ? (
                  <div
                    className="rsw-ce outline-none min-h-full"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    dangerouslySetInnerHTML={{ __html: resumeResult }}
                    onBlur={(e) => setResumeResult(e.currentTarget.innerHTML)}
                  />
                ) : (
                  <EmptyState />
                )
              ) : (
                letterResult ? (
                  <div
                    className="rsw-ce outline-none min-h-full"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    dangerouslySetInnerHTML={{ __html: letterResult }}
                    onBlur={(e) => setLetterResult(e.currentTarget.innerHTML)}
                  />
                ) : (
                  <EmptyState />
                )
              )}
            </div>

          </div>
        </div>

      </main>

      {/* STYLES FOR THE EDITOR TO LOOK LIKE A PROFESSIONAL RESUME */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .rsw-ce { color: #1e293b; line-height: 1.6; }
        .rsw-ce h1 { font-size: 2.25rem; font-weight: 800; border-bottom: 2px solid #1e293b; padding-bottom: 0.5rem; margin-bottom: 1rem; }
        .rsw-ce h2 { font-size: 1.25rem; font-weight: 700; color: #1d4ed8; margin-top: 1.5rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .rsw-ce h3 { font-size: 1.125rem; font-weight: 700; margin-top: 1rem; color: #0f172a; }
        .rsw-ce p { margin-bottom: 0.75rem; }
        .rsw-ce ul { padding-left: 1.5rem; margin-bottom: 1rem; list-style-type: disc; }
        .rsw-ce li { margin-bottom: 0.25rem; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}} />
    </div>
  );
}

const EmptyState = () => (
  <div className="p-8 h-full flex flex-col justify-center items-center text-slate-400 italic gap-4">
    <FileText size={48} className="opacity-20" />
    <p>Your AI-generated document will appear here...</p>
    <p className="text-sm">You can click directly on the text to edit it!</p>
  </div>
);

export default App;