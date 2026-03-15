"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUserInAction } from "@/lib/supabase/auth";
import { deleteAllFakeJobApplications } from "@/app/actions/job-applications";
import { deleteAllFakeChecklistItems } from "@/app/actions/checklist";
import { toSafeMessage } from "@/lib/safe-errors";
import type { JobStatus } from "@/lib/types/job-application";
import type { ChecklistStatus } from "@/lib/types/checklist";

const DEMO_ACCOUNT_EMAIL_KEY = "DEMO_ACCOUNT_EMAIL";

function getDemoAccountEmail(): string | undefined {
  const raw = process.env[DEMO_ACCOUNT_EMAIL_KEY]?.trim();
  return raw ? raw.toLowerCase() : undefined;
}

async function assertDemoAccount(): Promise<{ userId: string }> {
  const user = await requireUserInAction();
  const demoEmail = getDemoAccountEmail();
  if (!demoEmail)
    throw new Error("Demo data is only available for the configured demo account.");
  const userEmail = user.email?.toLowerCase();
  if (userEmail !== demoEmail)
    throw new Error("Demo data is only available for the configured demo account.");
  return { userId: user.id };
}

export async function seedFakeData(userId: string): Promise<void> {
  const { userId: uid } = await assertDemoAccount();
  const supabase = await createClient();

  const jobRows = [
    {
      company: "Acme Corp",
      role: "Frontend Developer",
      status: "Applied",
      description:
        "Build responsive web interfaces using React and TypeScript. Collaborate with designers and backend engineers to deliver performant and accessible user experiences.",
    },
    {
      company: "TechStart Inc",
      role: "Full Stack Engineer",
      status: "Interview",
      description:
        "Develop scalable web applications using Next.js and Node.js. Work with PostgreSQL, REST APIs, and modern frontend tooling to ship new features quickly.",
    },
    {
      company: "DataFlow",
      role: "Backend Developer",
      status: "Offer",
      description:
        "Design and maintain backend services using Node.js and PostgreSQL. Implement APIs, optimize database queries, and ensure system reliability.",
    },
    {
      company: "CloudNine",
      role: "DevOps Engineer",
      status: "Rejected",
      description:
        "Manage CI/CD pipelines and cloud infrastructure on AWS. Automate deployments and maintain monitoring and logging systems for production services.",
    },
    {
      company: "Design Co",
      role: "UI Designer",
      status: "Ghosted",
      description:
        "Create modern UI designs for web applications using Figma. Collaborate with developers to translate design systems into production-ready interfaces.",
    },
    {
      company: "FinanceApp",
      role: "Senior React Developer",
      status: "Applied",
      description:
        "Lead frontend development for financial dashboards. Build complex React components, optimize performance, and mentor junior developers.",
    },
    {
      company: "HealthTech",
      role: "Software Engineer",
      status: "Wishlist",
      description:
        "Develop healthcare applications focused on data visualization and patient dashboards. Work with React, Node.js, and cloud infrastructure.",
    },
    {
      company: "NextWave",
      role: "Frontend Engineer",
      status: "Interview",
      description:
        "Build scalable UI systems using React, Tailwind CSS, and modern component architecture. Focus on performance and reusable design systems.",
    },
    {
      company: "CodeBridge",
      role: "Junior Full Stack Developer",
      status: "Applied",
      description:
        "Assist in building web applications using JavaScript, React, and Express. Collaborate with senior engineers to implement new features and fix bugs.",
    },
    {
      company: "BrightAI",
      role: "React Developer",
      status: "Wishlist",
      description:
        "Develop AI-powered dashboards and analytics tools using React and modern frontend frameworks. Work closely with data teams.",
    },
    {
      company: "PixelLabs",
      role: "UI Engineer",
      status: "Rejected",
      description:
        "Translate high-fidelity designs into accessible and responsive UI components using HTML, CSS, and React.",
    },
    {
      company: "DevSphere",
      role: "Software Engineer",
      status: "Ghosted",
      description:
        "Work on full stack features across the platform using TypeScript, Node.js, and PostgreSQL. Participate in agile development cycles.",
    },
  ].map(({ company, role, status, description }) => ({
    user_id: uid,
    company_name: company,
    role_title: role,
    job_link: `https://example.com/job-${Math.random().toString(36).slice(2, 10)}`,
    job_description: description,
    current_status: status as JobStatus,
    notes: "Applied through LinkedIn. Waiting for recruiter response.",
    archived: false,
    is_fake: true,
  }));

  const { data: insertedJobs, error: jobsError } = await supabase
    .from("job_applications")
    .insert(jobRows)
    .select("id, current_status, company_name");
  if (jobsError) throw new Error(toSafeMessage(jobsError, "demo-data seed jobs"));
  const jobs = insertedJobs ?? [];

  const resumePath1 = `${uid}/resume-files/demo-resume-1.pdf`;
  const resumePath2 = `${uid}/resume-files/demo-resume-2.pdf`;
  const coverPath1 = `${uid}/cover-letter-files/demo-cover-1.pdf`;
  const coverPath2 = `${uid}/cover-letter-files/demo-cover-2.pdf`;

  const { data: insertedResumes, error: resumeError } = await supabase
    .from("resume_files")
    .insert([
      {
        user_id: uid,
        name: "Demo Resume (Frontend)",
        file_path: resumePath1,
        role: "Frontend roles",
        is_fake: true,
      },
      {
        user_id: uid,
        name: "Demo Resume (Full Stack)",
        file_path: resumePath2,
        role: "Full Stack roles",
        is_fake: true,
      },
    ])
    .select("id");
  if (resumeError) throw new Error(toSafeMessage(resumeError, "demo-data seed resumes"));
  const resumeIds = (insertedResumes ?? []).map((r) => r.id);

  const { data: insertedCovers, error: coverError } = await supabase
    .from("cover_letter_files")
    .insert([
      {
        user_id: uid,
        name: "Demo Cover Letter (Tech)",
        file_path: coverPath1,
        is_fake: true,
      },
      {
        user_id: uid,
        name: "Demo Cover Letter (Product)",
        file_path: coverPath2,
        is_fake: true,
      },
    ])
    .select("id");
  if (coverError) throw new Error(toSafeMessage(coverError, "demo-data seed covers"));
  const coverIds = (insertedCovers ?? []).map((c) => c.id);

  if (jobs.length >= 2 && resumeIds.length >= 2 && coverIds.length >= 2) {
    await supabase
      .from("job_applications")
      .update({
        resume_file_id: resumeIds[0],
        cover_letter_file_id: coverIds[0],
      })
      .eq("id", jobs[0].id);
    await supabase
      .from("job_applications")
      .update({
        resume_file_id: resumeIds[1],
        cover_letter_file_id: coverIds[1],
      })
      .eq("id", jobs[1].id);
  }

  const offerJob = jobs.find((j) => j.current_status === "Offer");
  if (offerJob) {
    const { error: offerError } = await supabase.from("job_offers").insert({
      application_id: offerJob.id,
      expected_salary: "$120,000 – $140,000",
      salary_offer: "$130,000",
      benefits: "Health, dental, vision; 401(k) match; remote flexibility; 20 PTO days",
      start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      work_days: "Mon–Fri",
      work_time_start: "09:00",
      work_time_end: "17:00",
      accepted_at: new Date().toISOString(),
    });
    if (offerError) throw new Error(toSafeMessage(offerError, "demo-data seed offers"));
  }

  const interviewJobs = jobs.filter((j) => j.current_status === "Interview");
  const interviewType = ["Video", "Onsite"] as const;
  const interviewStatus = ["Scheduled", "Completed"] as const;
  for (let i = 0; i < interviewJobs.length; i++) {
    const app = interviewJobs[i];
    const rounds = i === 0 ? 2 : 1;
    for (let r = 0; r < rounds; r++) {
      const date = new Date(Date.now() + (r + 1) * 7 * 24 * 60 * 60 * 1000);
      const { error: intError } = await supabase.from("interviews").insert({
        application_id: app.id,
        user_id: uid,
        round_number: r + 1,
        date: date.toISOString().slice(0, 10),
        time: r === 0 ? "14:00" : "10:00",
        interview_type: interviewType[r % 2],
        meeting_link: r === 0 ? "https://meet.example.com/demo-interview" : null,
        status: interviewStatus[r],
        notes:
          r === 0
            ? "Technical screen with engineering manager. Focus on system design and past projects."
            : "Final round with team lead. Discussed team fit and start date.",
      });
      if (intError) throw new Error(toSafeMessage(intError, "demo-data seed interviews"));
    }
  }

  const checklistStatuses: ChecklistStatus[] = [
    "Not started",
    "In progress",
    "Done",
    "Not started",
    "In progress",
    "Done",
    "Not started",
    "In progress",
  ];
  const checklistRows = [
    {
      name: "Update resume",
      description: "Tailor your resume for developer roles.",
    },
    {
      name: "Optimize LinkedIn profile",
      description: "Add portfolio projects and enable recruiter visibility.",
    },
    {
      name: "Prepare cover letter template",
      description: "Create a reusable but customizable cover letter.",
    },
    {
      name: "Set up job alerts",
      description: "Configure alerts on LinkedIn, Indeed, and company sites.",
    },
    {
      name: "Practice interview questions",
      description: "Review common frontend and behavioral questions.",
    },
    {
      name: "Build portfolio projects",
      description: "Add 2–3 strong projects demonstrating your stack.",
    },
    {
      name: "Research target companies",
      description: "List companies you want to apply to.",
    },
    {
      name: "Follow up on applications",
      description: "Send follow-ups after 7–10 days.",
    },
  ].map((item, i) => ({
    user_id: uid,
    name: item.name,
    description: item.description,
    link: null,
    status: checklistStatuses[i],
    sort_order: i,
    is_fake: true,
  }));


  const { error: checklistError } = await supabase.from("checklist_items").insert(checklistRows);
  if (checklistError) throw new Error(toSafeMessage(checklistError, "demo-data seed checklist"));
}

export async function removeAllFakeData(userId: string): Promise<{
  removedJobs: number;
  removedChecklist: number;
  removedResumes: number;
  removedCoverLetters: number;
}> {
  const { userId: uid } = await assertDemoAccount();
  const supabase = await createClient();

  const [removedJobs, removedChecklist, removedResumesResult, removedCoversResult] =
    await Promise.all([
      deleteAllFakeJobApplications(uid),
      deleteAllFakeChecklistItems(uid),
      supabase.from("resume_files").delete().eq("user_id", uid).eq("is_fake", true).select("id"),
      supabase
        .from("cover_letter_files")
        .delete()
        .eq("user_id", uid)
        .eq("is_fake", true)
        .select("id"),
    ]);

  const removedResumes = removedResumesResult.data?.length ?? 0;
  const removedCoverLetters = removedCoversResult.data?.length ?? 0;
  if (removedResumesResult.error) throw new Error(toSafeMessage(removedResumesResult.error, "demo-data remove resumes"));
  if (removedCoversResult.error) throw new Error(toSafeMessage(removedCoversResult.error, "demo-data remove covers"));

  return {
    removedJobs,
    removedChecklist,
    removedResumes,
    removedCoverLetters,
  };
}
