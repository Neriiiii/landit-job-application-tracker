const TIPS: string[] = [
  "Tailor your resume to each role. Mention the company and role by name.",
  "Use the STAR method (Situation, Task, Action, Result) to structure your cover letter examples.",
  "Keep your resume to one or two pages. Focus on recent and relevant experience.",
  "Research the company's values and recent news before writing your cover letter.",
  "Include keywords from the job description in your resume to get past ATS systems.",
  "Quantify achievements where possible (e.g. 'Increased sales by 20%').",
  "Address the hiring manager by name in your cover letter when you can find it.",
  "Save your resume as PDF to preserve formatting across devices.",
  "Ask someone to proofread your resume and cover letter before sending.",
  "Update your LinkedIn profile to match the experience on your resume.",
  "Keep a master resume with everything; create tailored versions for each application.",
  "In your cover letter, explain why you want this role at this company specifically.",
];

export function getRandomTip(): string {
  const index = Math.floor(Math.random() * TIPS.length);
  return TIPS[index] ?? TIPS[0];
}
