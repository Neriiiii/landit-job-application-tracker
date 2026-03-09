"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

export type CarouselSlide = {
  id: string;
  message: string;
  image: string;
  title: string;
  description: string;
  alt: string;
};

const SLIDES: CarouselSlide[] = [
  {
    id: "checklist",
    message: "Requirements checklist",
    image: "/page-images/job-requirements-checklist.png",
    title: "Requirements checklist",
    description:
      "Match your profile to each job and track must-haves. See at a glance how you stack up.",
    alt: "Job requirements checklist",
  },
  {
    id: "cover-letter",
    message: "Cover letter builder",
    image: "/page-images/cover-letter-builder.png",
    title: "Cover letter builder",
    description:
      "Write tailored cover letters and keep them in one place. Edit and download anytime.",
    alt: "Cover letter builder",
  },
  {
    id: "organized",
    message: "Stay organized",
    image: "/page-images/checklist.png",
    title: "Stay organized",
    description:
      "Clear checklists and views so nothing slips through. Keep your job hunt on track.",
    alt: "Checklist view",
  },
  {
    id: "dashboard",
    message: "Dashboard",
    image: "/page-images/dashboard.png",
    title: "Dashboard & pipeline",
    description:
      "See where your applications stand. Upcoming interviews and quick links to job boards.",
    alt: "Dashboard",
  },
  {
    id: "kanban",
    message: "Job applications",
    image: "/page-images/job-applications.png",
    title: "Job applications kanban",
    description:
      "Drag cards through stages: To apply, Applied, Interview, Offer, Rejected, Ghosted.",
    alt: "Kanban board",
  },
  {
    id: "resume",
    message: "Resume builder",
    image: "/page-images/resume-builder.png",
    title: "Resume builder",
    description: "Build and edit your resume in one place. Save and download whenever you need.",
    alt: "Resume builder",
  },
  {
    id: "interview",
    message: "Interview questions",
    image: "/page-images/interview-questions.png",
    title: "Interview questions",
    description: "Prepare answers by category. Add notes and review before your next interview.",
    alt: "Interview questions",
  },
];

export function LandingCarousel() {
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<CarouselSlide | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openSlide = useCallback((slide: CarouselSlide) => {
    setPaused(true);
    setSelected(slide);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelected(null);
    setPaused(false);
  }, []);

  return (
    <>
      <div
        className="relative w-full overflow-hidden py-6"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => !modalOpen && setPaused(false)}
      >
        {/* Left shadow fade */}
        <div
          className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-linear-to-r from-background via-background/80 to-transparent sm:w-32"
          aria-hidden
        />
        {/* Right shadow fade */}
        <div
          className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-linear-to-l from-background via-background/80 to-transparent sm:w-32"
          aria-hidden
        />

        <div
          className={cn(
            "landing-carousel-track flex w-max gap-5",
            paused && "landing-carousel-paused",
          )}
        >
          {[...SLIDES, ...SLIDES, ...SLIDES].map((slide, index) => (
            <button
              key={`${slide.id}-${index}`}
              type="button"
              onClick={() => openSlide(slide)}
              onFocus={() => setPaused(true)}
              onBlur={() => !modalOpen && setPaused(false)}
              className="group relative h-[240px] w-[380px] shrink-0 overflow-hidden  bg-card shadow-md transition-all hover:border-primary/50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:h-[280px] sm:w-[440px]"
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="h-full w-full object-fit object-top transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="absolute bottom-0 left-0 right-0 p-3 text-left text-sm font-medium text-white opacity-0 drop-shadow-md transition-opacity group-hover:opacity-100">
                {slide.message}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent
          size="xl"
          className="flex max-h-[95vh] flex-col gap-0 p-0 border-border border-2"
          showCloseButton
        >
          {selected && (
            <>
              <DialogHeader className="shrink-0 border-b border-border bg-background  ">
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>{selected.description}</DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-auto ">
                <div className="mx-auto w-full overflow-hidden   bg-muted/20 shadow-2xl">
                  <img
                    src={selected.image}
                    alt={selected.alt}
                    className="w-full object-contain object-top"
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
