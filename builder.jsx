import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import jsPDF from 'jspdf';

export default function ResumeBuilder() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [summary, setSummary] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [template, setTemplate] = useState('Modern');
  const [resume, setResume] = useState('');
  const [savedResumes, setSavedResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTag, setSearchTag] = useState('');
  const [atsScore, setAtsScore] = useState(null);
  const [atsSuggestions, setAtsSuggestions] = useState([]);
  const [viewingResume, setViewingResume] = useState('');

  // GPT Resume Generation
  async function generateResume() {
    setLoading(true);
    const prompt = `Create a ${template} style resume for a ${jobTitle} (${jobType} field).
Contact Information: ${contactInfo}
Professional Summary: ${summary}
Skills: ${skills}
Experience: ${experience}
Target Job Description: ${jobDescription}
Make the resume ATS-optimized, clean format, keyword-rich, professional.`;

    const response = await fetch('/api/chatgpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    setResume(data.result);
    setLoading(false);
  }
  // Download Resume as Text
  function downloadResumeAsText() {
    const element = document.createElement('a');
    const file = new Blob([resume], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'resume.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  // Download Resume as PDF
  function downloadResumeAsPDF() {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(resume, 180);
    doc.text(lines, 10, 10);
    doc.save('resume.pdf');
  }

  // Save Resume
  function saveResume() {
    const timestamp = new Date().toLocaleString();
    const score = calculateATSScore(resume);
    const newSaved = { title: `${jobTitle} Resume (${timestamp})`, tag: jobType, content: resume, timestamp, atsScore: score };
    setSavedResumes([...savedResumes, newSaved]);
  }

  // Load Resume into Editor
  function loadResume(content) {
    setResume(content);
  }

  // Delete Resume from Library
  function deleteResume(index) {
    const updated = [...savedResumes];
    updated.splice(index, 1);
    setSavedResumes(updated);
  }

  // View Resume Content in Modal
  function openView(content) {
    setViewingResume(content);
  }

  // Calculate ATS Score (simple 100% system)
  function calculateATSScore(text) {
    let score = 0;
    if (text.includes(contactInfo)) score += 20;
    if (text.includes(summary)) score += 20;
    if (text.includes(skills)) score += 20;
    if (text.includes(experience)) score += 20;
    if (text.includes(jobTitle)) score += 20;
    return score;
  }

  // Run ATS Check + Give Smart Suggestions
  function checkATS() {
    const score = calculateATSScore(resume);
    const suggestions = [];
    if (!contactInfo) suggestions.push('⚡ Add contact information.');
    if (!summary) suggestions.push('⚡ Add a professional summary.');
    if (!skills) suggestions.push('⚡ Include a skills section with relevant keywords.');
    if (!experience) suggestions.push('⚡ List work experience in bullet format.');
    if (!resume.includes(jobTitle)) suggestions.push(`⚡ Mention your job title (${jobTitle}) inside the resume text.`);

    setAtsScore(score);
    setAtsSuggestions(suggestions);
  }
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      {/* FORM SECTION */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <h1 className="text-2xl font-bold">Sisu Chance - Build Your Resume</h1>

          <Input placeholder="Contact Information (phone, email, LinkedIn)" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} />
          <Input placeholder="Job Title (e.g., Logistics Manager)" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          <Select value={jobType} onValueChange={setJobType}>
            <SelectItem value="Logistics">Logistics</SelectItem>
            <SelectItem value="Operations">Operations</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="Customer Service">Customer Service</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Healthcare">Healthcare</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Management">Management</SelectItem>
          </Select>

          <Textarea placeholder="Paste job description here to tailor resume" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
          <Textarea placeholder="Professional Summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
          <Textarea placeholder="Key Skills (comma-separated)" value={skills} onChange={(e) => setSkills(e.target.value)} />
          <Textarea placeholder="Experience (companies, achievements)" value={experience} onChange={(e) => setExperience(e.target.value)} />

          <Select value={template} onValueChange={setTemplate}>
            <SelectItem value="Modern">Modern</SelectItem>
            <SelectItem value="Corporate">Corporate</SelectItem>
            <SelectItem value="Creative">Creative</SelectItem>
          </Select>

          <div className="flex gap-4">
            <Button onClick={generateResume} disabled={loading}>
              {loading ? <Loader className="animate-spin" /> : 'Generate Resume'}
            </Button>
            <Button onClick={checkATS}>Run ATS Check</Button>
          </div>

          {atsScore !== null && (
            <div className="space-y-2">
              <h3 className="text-lg font-bold">ATS Optimization Score: {atsScore}%</h3>
              <Progress value={atsScore} />
              {atsSuggestions.length > 0 && (
                <ul className="list-disc list-inside text-red-600 mt-2">
                  {atsSuggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* RESUME EDITOR */}
      {resume && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-bold">Generated Resume</h2>
            <Textarea className="w-full h-96 p-4 border rounded-md" value={resume} onChange={(e) => setResume(e.target.value)} />
            <div className="flex gap-4">
              <Button onClick={saveResume}>Save to Library</Button>
              <Button onClick={downloadResumeAsText}>Download as Text</Button>
              <Button onClick={downloadResumeAsPDF}>Download as PDF</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SAVED DASHBOARD */}
      {savedResumes.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Resume Library</h2>
          <Input placeholder="Search by job tag (e.g., Logistics)" value={searchTag} onChange={(e) => setSearchTag(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedResumes
              .filter(saved => searchTag ? saved.tag.toLowerCase().includes(searchTag.toLowerCase()) : true)
              .map((saved, idx) => (
                <Card key={idx} className="p-4">
                  <CardContent className="space-y-2">
                    <h3 className="text-lg font-bold">{saved.title}</h3>
                    <p className="text-sm text-gray-500">Field: {saved.tag}</p>
                    <p className="text-sm text-gray-400">Saved: {saved.timestamp}</p>
                    <p className="text-sm text-green-600">ATS Score: {saved.atsScore}%</p>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={() => loadResume(saved.content)}>Load</Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">View</Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[80vh] overflow-y-scroll">
                          <pre className="text-sm whitespace-pre-wrap">{saved.content}</pre>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="destructive" onClick={() => deleteResume(idx)}>Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
// Full builder.jsx code goes here (paste your full resume builder code)
