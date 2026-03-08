export const INTERVIEW_QUESTION_CATEGORIES = [
  {
    id: "about-you",
    title: "About you",
    description: "Tell me about yourself, motivation, strengths, and fit — often asked first",
    questions: [
      { id: "a1", question: "Tell me about yourself." },
      { id: "a2", question: "Why do you want to work here?" },
      { id: "a3", question: "What are your greatest strengths?" },
      { id: "a4", question: "What is your biggest weakness? How are you working on it?" },
      { id: "a5", question: "Where do you see yourself in 5 years?" },
      { id: "a6", question: "Why are you leaving your current role?" },
      { id: "a7", question: "What do you like to do outside of work?" },
      { id: "a8", question: "What kind of work environment do you prefer?" },
    ],
  },
  {
    id: "behavioral",
    title: "Behavioral",
    description: "STAR method: Situation, Task, Action, Result",
    questions: [
      { id: "b1", question: "Tell me about a time you had a conflict with a teammate. How did you resolve it?" },
      { id: "b2", question: "Describe a situation where you failed. What did you learn?" },
      { id: "b3", question: "Give an example of when you had to meet a tight deadline. How did you handle it?" },
      { id: "b4", question: "Tell me about a time you took initiative on a project." },
      { id: "b5", question: "Describe a situation where you had to persuade someone to see things your way." },
      { id: "b6", question: "Tell me about a time you received critical feedback. How did you respond?" },
      { id: "b7", question: "Give an example of when you had to work with a difficult stakeholder." },
      { id: "b8", question: "Describe a time you had to learn something new quickly." },
    ],
  },
  {
    id: "technical",
    title: "Technical",
    description: "Role-specific and problem-solving",
    questions: [
      { id: "t1", question: "Walk me through a technical project you're proud of." },
      { id: "t2", question: "Describe a challenging bug or technical problem you solved." },
      { id: "t3", question: "How do you stay updated with new technologies or best practices?" },
      { id: "t4", question: "Explain [a key concept for your role] to a non-technical person." },
      { id: "t5", question: "Tell me about a time you had to make a trade-off between speed and quality." },
      { id: "t6", question: "How do you approach debugging when you're stuck?" },
      { id: "t7", question: "Describe your experience with code review or giving feedback." },
    ],
  },
  {
    id: "company-role",
    title: "Company & role",
    description: "Show you've done your research",
    questions: [
      { id: "c1", question: "What do you know about our company and our products?" },
      { id: "c2", question: "What interests you most about this role?" },
      { id: "c3", question: "What questions do you have for us?" },
      { id: "c4", question: "What would your first 90 days look like in this role?" },
      { id: "c5", question: "How does this role fit into your career goals?" },
      { id: "c6", question: "What would you need to be successful in this position?" },
    ],
  },
] as const;

export type QuestionId = string;
