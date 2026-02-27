import React, { useState } from 'react';
import { generateResumeContent } from './aiConfig';
import jsPDF from 'jspdf';
import { FileText, Mail, Globe, Download, Sparkles, User, Briefcase } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('resume'); // 'resume', 'letter', or 'portfolio'
  const [loading, setLoading] = useState(false);

  // --- 1. SHARED DATA (Typed once, used everywhere) ---
  const [sharedData, setSharedData] = useState({
    name: "",
    email: "",
    skills: "",
    rawExperience: "" // The messy text user types
  });

  // --- 2. SPECIFIC INPUTS ---
  const [resumeJobTitle, setResumeJobTitle] = useState("");
  const [letterCompany, setLetterCompany] = useState("");
  const [letterJobDesc, setLetterJobDesc] = useState("");

  // --- 3. AI RESULTS ---
  const [resumeResult, setResumeResult] = useState("");
  const [letterResult, setLetterResult] = useState("");
  const [portfolioResult, setPortfolioResult] = useState("");

  // Handle Shared Input Changes
  const handleSharedChange = (e) => {
    setSharedData({...sharedData, [e.target.name]: e.target.value});
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

  // --- AI FUNCTION: PORTFOLIO BIO (NEW!) ---
  const generatePortfolio = async () => {
    if (!sharedData.name) return alert("Please enter your Name in Step 1!");
    setLoading(true);
    const prompt = `
      Write a creative "About Me" bio and a "Project Showcase" section for a personal portfolio website.
      
      Name: ${sharedData.name}
      Skills: ${sharedData.skills}
      Experience: ${sharedData.rawExperience}
      
      Tone: Exciting, innovative, and tech-savvy. 
      Format: Use Markdown-style headers (###) for sections.
    `;
    const result = await generateResumeContent(prompt);
    setPortfolioResult(result);
    setLoading(false);
  };

  // --- DOWNLOAD PDF HELPER ---
  const downloadPDF = (filename, content) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(filename.replace(/_/g, " "), 20, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    // Split long text to fit page width
    const splitText = doc.splitTextToSize(content || "", 180);
    doc.text(splitText, 20, 30);
    
    doc.save(`${filename}.pdf`);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px', fontFamily: 'Segoe UI, sans-serif', color: '#333' }}>
      
      {/* HEADER */}
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2563eb', margin: 0, fontSize: '2.5rem' }}>🚀 AI Career Builder</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>Resume • Cover Letter • Portfolio Generator</p>
      </header>

      {/* --- SECTION 1: SHARED PROFILE (Step 1) --- */}
      <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, color: '#1f2937' }}>
          <User size={24} color="#2563eb"/> Step 1: Your Core Profile
        </h3>
        <p style={{marginBottom: '15px', color: '#6b7280'}}>Enter your details once, and use them for all 3 tools.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input name="name" placeholder="Full Name" onChange={handleSharedChange} style={inputStyle} />
          <input name="email" placeholder="Email Address" onChange={handleSharedChange} style={inputStyle} />
          <input name="skills" placeholder="Skills (React, Python, Java...)" onChange={handleSharedChange} style={{...inputStyle, gridColumn: 'span 2'}} />
          <textarea name="rawExperience" placeholder="Paste your messy experience here (e.g. I built a crop prediction app using python...)" onChange={handleSharedChange} style={{...inputStyle, gridColumn: 'span 2', height: '80px'}} />
        </div>
      </div>

      {/* --- TABS NAVIGATION --- */}
      <div style={{ display: 'flex', gap: '5px', paddingLeft: '10px' }}>
        <button onClick={() => setActiveTab('resume')} style={activeTab === 'resume' ? activeTabStyle : inactiveTabStyle}>
          <FileText size={18}/> Resume
        </button>
        <button onClick={() => setActiveTab('letter')} style={activeTab === 'letter' ? activeTabStyle : inactiveTabStyle}>
          <Mail size={18}/> Cover Letter
        </button>
        <button onClick={() => setActiveTab('portfolio')} style={activeTab === 'portfolio' ? activeTabStyle : inactiveTabStyle}>
          <Globe size={18}/> Portfolio
        </button>
      </div>

      {/* --- WORKSPACE AREA (Step 2) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', background: '#f8f9fa', padding: '25px', borderRadius: '0 12px 12px 12px', border: '1px solid #e5e7eb' }}>
        
        {/* LEFT COLUMN: SPECIFIC INPUTS */}
        <div>
          {activeTab === 'resume' && (
            <div className="fade-in">
              <h3 style={{marginTop: 0}}>Resume Builder</h3>
              <p style={subTextStyle}>AI will turn your raw experience into professional bullet points.</p>
              <label style={labelStyle}>Target Job Title</label>
              <input 
                placeholder="e.g. Frontend Developer" 
                value={resumeJobTitle} 
                onChange={(e) => setResumeJobTitle(e.target.value)} 
                style={inputStyle} 
              />
              <button onClick={generateResume} disabled={loading} style={buttonStyle}>
                {loading ? "Generating..." : "✨ Generate Resume Points"}
              </button>
            </div>
          )}

          {activeTab === 'letter' && (
            <div className="fade-in">
              <h3 style={{marginTop: 0}}>Cover Letter Writer</h3>
              <p style={subTextStyle}>AI will write a letter connecting your profile to this company.</p>
              <label style={labelStyle}>Company Name</label>
              <input 
                placeholder="e.g. Google" 
                value={letterCompany} 
                onChange={(e) => setLetterCompany(e.target.value)} 
                style={inputStyle} 
              />
              <label style={labelStyle}>Job Description (Optional)</label>
              <textarea 
                placeholder="Paste the job requirements here..." 
                value={letterJobDesc} 
                onChange={(e) => setLetterJobDesc(e.target.value)} 
                style={{...inputStyle, height: '100px'}} 
              />
              <button onClick={generateLetter} disabled={loading} style={{...buttonStyle, background: '#7c3aed'}}>
                {loading ? "Writing..." : "✨ Write Cover Letter"}
              </button>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="fade-in">
              <h3 style={{marginTop: 0}}>Portfolio Generator</h3>
              <p style={subTextStyle}>Generates a catchy "About Me" and "Project Showcase" for your website.</p>
              <div style={{background: '#fff7ed', padding: '15px', borderRadius: '8px', border: '1px solid #ffedd5', marginBottom: '15px'}}>
                <p style={{margin: 0, fontSize: '0.9rem', color: '#9a3412'}}>
                  <strong>Tip:</strong> Ensure you filled out "Skills" and "Experience" in Step 1 for the best result!
                </p>
              </div>
              <button onClick={generatePortfolio} disabled={loading} style={{...buttonStyle, background: '#ea580c'}}>
                {loading ? "Creating..." : "✨ Generate Portfolio Bio"}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PREVIEW & DOWNLOAD */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', border: '1px solid #e5e7eb', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
            <h3 style={{margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}>
              <Sparkles size={18} color="#fbbf24" fill="#fbbf24"/> 
              {activeTab === 'resume' ? "Resume Preview" : activeTab === 'letter' ? "Letter Preview" : "Portfolio Preview"}
            </h3>
            
            {(resumeResult || letterResult || portfolioResult) && (
              <button 
                onClick={() => downloadPDF(
                  activeTab === 'resume' ? "My_Resume" : activeTab === 'letter' ? "My_Cover_Letter" : "My_Portfolio_Bio", 
                  activeTab === 'resume' ? resumeResult : activeTab === 'letter' ? letterResult : portfolioResult
                )} 
                style={downloadBtnStyle}
              >
                <Download size={16}/> Save PDF
              </button>
            )}
          </div>
          
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#374151', flex: 1, fontSize: '0.95rem' }}>
            {activeTab === 'resume' ? resumeResult : activeTab === 'letter' ? letterResult : portfolioResult || (
              <div style={{color: '#9ca3af', textAlign: 'center', marginTop: '40px', fontStyle: 'italic'}}>
                Results will appear here...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// --- STYLES ---
const inputStyle = { width: '100%', padding: '12px', margin: '8px 0', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px', transition: 'border-color 0.2s' };
const labelStyle = { fontSize: '0.9rem', fontWeight: '600', color: '#4b5563', marginTop: '10px', display: 'block' };
const subTextStyle = { fontSize: '0.9rem', color: '#6b7280', marginBottom: '15px' };

const buttonStyle = { width: '100%', padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' };

const downloadBtnStyle = { ...buttonStyle, width: 'auto', padding: '8px 16px', marginTop: 0, background: '#059669', fontSize: '13px', boxShadow: 'none' };

const activeTabStyle = { padding: '12px 25px', background: '#f8f9fa', border: '1px solid #e5e7eb', borderBottom: 'none', borderRadius: '10px 10px 0 0', cursor: 'pointer', fontWeight: 'bold', color: '#2563eb', display: 'flex', gap: '8px', alignItems: 'center' };

const inactiveTabStyle = { padding: '12px 25px', background: '#e5e7eb', border: 'none', borderRadius: '10px 10px 0 0', cursor: 'pointer', color: '#6b7280', display: 'flex', gap: '8px', alignItems: 'center' };

export default App;