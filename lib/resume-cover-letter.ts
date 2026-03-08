export const STORAGE_KEY_RESUME = "trackr_resume";
export const STORAGE_KEY_COVER = "trackr_cover_letter";

export function getResumeStorageKey(userId: string): string {
  return `${STORAGE_KEY_RESUME}_${userId}`;
}

export function getCoverLetterStorageKey(userId: string): string {
  return `${STORAGE_KEY_COVER}_${userId}`;
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  experience: Array<{
    company: string;
    role: string;
    start: string;
    end: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
    achievement: string;
  }>;
  skills: string;
  references: Array<{
    name: string;
    titleOrRelationship: string;
    email: string;
    phone: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

export interface CoverLetterData {
  companyName: string;
  roleTitle: string;
  hiringManager: string;
  opening: string;
  bodyParagraph1: string;
  bodyParagraph2: string;
  bodyParagraph3: string;
  closing: string;
}

export const defaultResume: ResumeData = {
  name: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  summary: "",
  experience: [{ company: "", role: "", start: "", end: "", description: "" }],
  education: [{ degree: "", school: "", year: "", achievement: "" }],
  skills: "",
  references: [
    { name: "", titleOrRelationship: "", email: "", phone: "" },
    { name: "", titleOrRelationship: "", email: "", phone: "" },
  ],
  certifications: [{ name: "", issuer: "", date: "" }],
};

export const defaultCoverLetter: CoverLetterData = {
  companyName: "",
  roleTitle: "",
  hiringManager: "",
  opening: "",
  bodyParagraph1: "",
  bodyParagraph2: "",
  bodyParagraph3: "",
  closing: "",
};

export function parseResumeFromStorage(raw: string): ResumeData | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ResumeData>;
    if (!parsed?.experience?.length) return null;
    const education = (parsed.education ?? defaultResume.education).map((e) => ({
      degree: e.degree ?? "",
      school: e.school ?? "",
      year: e.year ?? "",
      achievement: e.achievement ?? "",
    }));
    return {
      ...defaultResume,
      ...parsed,
      education: education.length ? education : defaultResume.education,
      references:
        parsed.references?.length === 2 ? parsed.references : defaultResume.references,
      certifications: parsed.certifications?.length
        ? parsed.certifications
        : defaultResume.certifications,
    };
  } catch {
    return null;
  }
}

export function parseCoverLetterFromStorage(raw: string): CoverLetterData | null {
  try {
    const parsed = JSON.parse(raw) as CoverLetterData;
    if (!parsed || typeof parsed !== "object") return null;
    return { ...defaultCoverLetter, ...parsed };
  } catch {
    return null;
  }
}
