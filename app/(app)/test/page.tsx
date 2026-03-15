"use client";

import { useState } from "react";
import { AppPageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CirclePlus, MoreHorizontal, CalendarIcon } from "lucide-react";

export default function TestPage() {
  const [dateValue, setDateValue] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rteValue, setRteValue] = useState("");

  return (
    <div className="flex flex-col gap-10 pb-10 overflow-auto">
      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Buttons</h2>
        <Card className="p-5">
          <CardContent className="space-y-4 pt-0">
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Icon button">
                <CirclePlus className="h-4 w-4" />
              </Button>
              <Button size="lg" className="gap-2">
                <CirclePlus className="h-4 w-4" />
                Add application
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Inputs</h2>
        <Card className="p-5">
          <CardContent className="grid gap-4 pt-0 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="test-input">Label + Input</Label>
              <Input id="test-input" placeholder="Placeholder text" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-input-disabled">Disabled</Label>
              <Input id="test-input-disabled" placeholder="Disabled" disabled />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="test-textarea">Textarea</Label>
              <RichTextEditor
                value={rteValue}
                onChange={setRteValue}
                placeholder="Multi-line placeholder"
                minHeight="5rem"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* DatePicker */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">DatePicker</h2>
        <Card className="p-5">
          <CardContent className="pt-0">
            <div className="max-w-xs space-y-2">
              <Label htmlFor="test-date">Pick a date</Label>
              <DatePicker
                id="test-date"
                value={dateValue}
                onChange={setDateValue}
                placeholder="Pick a date"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Select */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Select</h2>
        <Card className="p-5">
          <CardContent className="pt-0">
            <div className="max-w-xs space-y-2">
              <Label>Choose option</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">Option A</SelectItem>
                  <SelectItem value="b">Option B</SelectItem>
                  <SelectItem value="c">Option C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Form messages */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">FormMessage</h2>
        <Card className="p-5">
          <CardContent className="flex flex-col gap-2 pt-0">
            <FormMessage variant="error">This is an error message.</FormMessage>
            <FormMessage variant="success">This is a success message.</FormMessage>
          </CardContent>
        </Card>
      </section>

      {/* Card (full example) */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Card</h2>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>
              Card description text. Use cards to group related content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Card content goes here. You can put any layout or components inside.
            </p>
          </CardContent>
          <CardFooter className="flex gap-2 border-t pt-5">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
            <Button size="sm">Save</Button>
          </CardFooter>
        </Card>
      </section>

      {/* Dialog */}
      {/* Dialog */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Dialog</h2>

        {/* Size Showcase Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-6 bg-primary rounded-sm" />
                Small Dialog
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Open Small Dialog
                  </Button>
                </DialogTrigger>
                <DialogContent size="sm">
                  <DialogHeader>
                    <DialogTitle>Small Dialog</DialogTitle>
                    <DialogDescription>
                      Perfect for simple forms, confirmations, or quick actions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Compact and focused for mobile-first experience.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline">
                        Cancel
                      </Button>
                      <Button size="sm">Save</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-6 bg-primary rounded-sm" />
                Default Dialog
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Open Default Dialog
                  </Button>
                </DialogTrigger>
                <DialogContent size="md">
                  <DialogHeader>
                    <DialogTitle>Default Dialog</DialogTitle>
                    <DialogDescription>
                      The standard size for most use cases and form interactions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Balanced width that works great across all screen sizes.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button>Confirm</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-4 h-6 bg-primary rounded-sm" />
                Large Dialog
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Open Large Dialog
                  </Button>
                </DialogTrigger>
                <DialogContent size="lg">
                  <DialogHeader>
                    <DialogTitle>Large Dialog</DialogTitle>
                    <DialogDescription>
                      Great for complex forms, image previews, or detailed content.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">More content space:</p>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                        <li>Multiple input fields</li>
                        <li>Rich content areas</li>
                        <li>Preview panels</li>
                      </ul>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" className="flex-1">
                        Cancel
                      </Button>
                      <Button className="flex-1">Save Changes</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="p-6 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-sm" />
                Extra Large / Fullscreen
              </CardTitle>
              <CardDescription>Spans full width on mobile, expansive on desktop</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      XL Dialog
                    </Button>
                  </DialogTrigger>
                  <DialogContent size="xl">
                    <DialogHeader>
                      <DialogTitle>Extra Large Dialog</DialogTitle>
                      <DialogDescription>
                        Maximum content area for complex workflows
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-accent/50">
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
                            Preview Area
                          </label>
                          <div className="w-full h-24 bg-muted rounded-md flex items-center justify-center">
                            Content preview
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
                            Settings
                          </label>
                          <div className="space-y-2 text-sm">
                            <div>Multiple sections</div>
                            <div>Rich interactions</div>
                            <div>Complex layouts</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button variant="outline" className="flex-1 h-12 text-sm">
                          Discard Changes
                        </Button>
                        <Button className="flex-1 h-12 text-sm">Publish</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Fullscreen Dialog
                    </Button>
                  </DialogTrigger>
                  <DialogContent size="fullscreen">
                    <DialogHeader>
                      <DialogTitle>Fullscreen Experience</DialogTitle>
                      <DialogDescription>Full immersion for complex applications</DialogDescription>
                    </DialogHeader>
                    <div className="p-8 flex flex-col h-full">
                      <div className="flex-1 space-y-6 overflow-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Primary Content</h3>
                            <p className="text-muted-foreground leading-relaxed">
                              This fullscreen dialog provides maximum space for complex workflows,
                              multi-step processes, or immersive experiences that need full
                              attention.
                            </p>
                          </div>
                          <div className="bg-muted/50 rounded-xl p-6 h-64 flex items-center justify-center">
                            Large preview/content area
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" className="h-12 px-8">
                          Close
                        </Button>
                        <Button className="h-12 px-8">Complete Workflow</Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Dropdown menu */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Dropdown menu</h2>
        <Card className="p-5">
          <CardContent className="pt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      </section>

      {/* Confirm dialog */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">ConfirmDialog</h2>
        <Card className="p-5">
          <CardContent className="pt-0">
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              Delete something
            </Button>
            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Are you sure?"
              description="This action cannot be undone. This is for testing the confirm dialog UI."
              confirmLabel="Delete"
              cancelLabel="Cancel"
              variant="destructive"
              onConfirm={() => setConfirmOpen(false)}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
