"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { ExternalLink, Plus, Trash2, Link2 } from "lucide-react";
import { DEFAULT_ENTRY, DEFAULT_LINK_COLOR } from "../services/jobLinksService";
import { useJobLinks, type DisplayJobLink } from "../hooks/useJobLinks";
import type { JobLinkRow } from "../types";

const VISIBLE_LINKS_COUNT = 3;

type Props = { userId: string; initialJobLinks: JobLinkRow[] };

const PALETTE_PRESETS = [
  { name: "Dark teal", value: "#006778" },
  { name: "Light teal", value: "#82c9b2" },
  { name: "Terracotta", value: "#cb8163" },
  { name: "Peach", value: "#fcd7c7" },
  { name: "LinkedIn", value: "#0A66C2" },
] as const;

export function DashboardQuickLinks({ userId, initialJobLinks }: Props) {
  const { links, addLink: addLinkAction, removeLink: removeLinkAction, isLoading } = useJobLinks(
    userId,
    initialJobLinks,
  );
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [color, setColor] = useState(DEFAULT_LINK_COLOR);

  const openAddModal = () => {
    setLabel("");
    setUrl("");
    setColor(DEFAULT_LINK_COLOR);
    setAddModalOpen(true);
  };

  const openViewAll = () => setViewAllOpen(true);
  const allLinksForDisplay: DisplayJobLink[] = [DEFAULT_ENTRY, ...links];
  const visibleLinks = allLinksForDisplay.slice(0, VISIBLE_LINKS_COUNT);
  const hasMoreLinks = allLinksForDisplay.length > VISIBLE_LINKS_COUNT;

  const addLink = async () => {
    const trimmedLabel = label.trim();
    const trimmedUrl = url.trim();
    if (!trimmedLabel || !trimmedUrl) return;
    const hexColor = /^#[0-9A-Fa-f]{3,6}$/.test(color) ? color : DEFAULT_LINK_COLOR;
    await addLinkAction(trimmedLabel, trimmedUrl, hexColor);
    setLabel("");
    setUrl("");
    setColor(DEFAULT_LINK_COLOR);
    setAddModalOpen(false);
  };

  const removeLink = (item: DisplayJobLink) => {
    if (item.id) void removeLinkAction(item.id);
  };

  return (
    <>
      <Card className="flex min-h-0 flex-1 flex-col rounded-xl border-border/80 bg-card shadow-sm lg:gap-2">
        <CardHeader className="flex min-h-16 flex-row items-start justify-between gap-2 ">
          <div className="min-w-0 space-y-2">
            <CardTitle className="flex items-center gap-1.5 font-semibold">
              <Link2 className="h-5 w-5 shrink-0 text-muted-foreground" />
              Job links
            </CardTitle>
            <CardDescription>Quick access to job boards and career pages</CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={openViewAll}
            className="shrink-0 gap-2 border-dashed"
          >
            View all
          </Button>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-3 max-sm:gap-2 overflow-hidden pt-0">
          <ul className="flex flex-col  gap-3">
            {visibleLinks.map((item, index) => {
              const isDefault = !item.id && item.url === DEFAULT_ENTRY.url;
              return (
                <li key={isDefault ? "default-linkedin" : item.id ?? `link-${index}`}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-black/10 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:opacity-95 hover:shadow-md"
                    style={{ backgroundColor: item.color || DEFAULT_LINK_COLOR }}
                  >
                    <ExternalLink className="h-4 w-4 shrink-0 opacity-90" />
                    <span className="truncate">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          {hasMoreLinks && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={openViewAll}
              className="w-full gap-2 border-dashed"
            >
              View all ({allLinksForDisplay.length})
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <DialogContent className="flex  max-h-[90vh] flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Job links</DialogTitle>
            <DialogDescription>
              All your job boards and career pages. Add or remove links below.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 max-sm:px-2">
            <ul className="max-md:flex-col max-md:gap-2 inline-flex gap-2 py-2 max-sm:w-full">
              {allLinksForDisplay.map((item) => {
                const isDefault = !item.id && item.url === DEFAULT_ENTRY.url;
                if (isDefault) {
                  return (
                    <li key="default-linkedin" className="w-full">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-[2.75rem] w-full items-center gap-3 rounded-lg border border-black/10 px-3 py-2 text-sm font-medium text-white shadow-sm"
                        style={{ backgroundColor: item.color || DEFAULT_LINK_COLOR }}
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-90" />
                        <span className="truncate">{item.label}</span>
                      </a>
                    </li>
                  );
                }
                return (
                  <li key={item.id!} className="w-full">
                    <div
                      className="group flex min-h-[2.75rem] w-full items-center overflow-hidden rounded-lg border border-black/10 shadow-sm"
                      style={{ backgroundColor: item.color || DEFAULT_LINK_COLOR }}
                    >
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-sm font-medium text-white"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-90" />
                        <span className="truncate">{item.label}</span>
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-none text-white/80 opacity-0 transition-opacity group-hover:opacity-100 dark:hover:bg-transparent"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeLink(item);
                        }}
                        aria-label={`Remove ${item.label}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="shrink-0 border-t border-border bg-background p-4 max-sm:p-2">
            <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
              <Button
                type="button"
                onClick={() => {
                  setViewAllOpen(false);
                  openAddModal();
                }}
                className="gap-2 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Add link
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent size="lg">
          <DialogHeader className="shrink-0 bg-background">
            <DialogTitle>Add job website</DialogTitle>
            <DialogDescription>
              Name it, paste the URL, and choose a button color so you can spot it at a glance.
            </DialogDescription>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="quick-link-label">Label</Label>
                <Input
                  id="quick-link-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. LinkedIn Jobs"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quick-link-url">URL</Label>
                <Input
                  id="quick-link-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quick-link-color">Button color</Label>
                <div className="flex flex-wrap gap-2">
                  {PALETTE_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setColor(preset.value)}
                      className="h-8 w-8 shrink-0 rounded-lg border-2 border-border shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      style={{ backgroundColor: preset.value }}
                      title={preset.name}
                      aria-label={`Use ${preset.name}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    id="quick-link-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-transparent p-1"
                    aria-label="Pick background color"
                  />
                  <Input
                    value={color}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v) || v === "")
                        setColor(v || DEFAULT_LINK_COLOR);
                    }}
                    placeholder="#006778"
                    className="font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Background color for this link's button. Darker colors keep text readable.
                </p>
              </div>
            </div>
            <div className="shrink-0 border-t border-border bg-background p-4">
              <DialogFooter>
                <Button
                  type="button"
                  variant="default"
                  onClick={() => void addLink()}
                  disabled={!label.trim() || !url.trim() || isLoading}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add link
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
