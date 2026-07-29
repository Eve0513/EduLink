"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface ComboboxOption {
  value: string;
  label: string;
  subtitle?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  creatable?: boolean;
  className?: string;
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Caută...",
  creatable = true,
  className,
  disabled,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(value);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setQuery(value);
  }, [value]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  const showCreate =
    creatable &&
    query.trim().length > 0 &&
    !options.some(
      (opt) => opt.label.toLowerCase() === query.trim().toLowerCase()
    );

  function selectOption(label: string) {
    onChange(label);
    setQuery(label);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (creatable) onChange(e.target.value);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {open && (filtered.length > 0 || showCreate) && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
          {filtered.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-secondary",
                value === opt.label && "bg-secondary"
              )}
              onClick={() => selectOption(opt.label)}
            >
              <Check
                className={cn(
                  "h-4 w-4 shrink-0 text-primary",
                  value === opt.label ? "opacity-100" : "opacity-0"
                )}
              />
              <div className="min-w-0">
                <div className="truncate font-medium">{opt.label}</div>
                {opt.subtitle && (
                  <div className="truncate text-xs text-muted-foreground">
                    {opt.subtitle}
                  </div>
                )}
              </div>
            </button>
          ))}
          {showCreate && (
            <button
              type="button"
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-left text-sm text-primary hover:bg-secondary"
              onClick={() => selectOption(query.trim())}
            >
              <ChevronsUpDown className="h-4 w-4" />
              Adaugă „{query.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: ComboboxOption[];
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({
  tags,
  onChange,
  suggestions = [],
  placeholder = "Scrie și apasă Enter",
  maxTags = 10,
}: TagInputProps) {
  const [input, setInput] = React.useState("");
  const [open, setOpen] = React.useState(false);

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= maxTags) return;
    onChange([...tags, trimmed]);
    setInput("");
    setOpen(false);
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  const filtered = suggestions.filter(
    (s) =>
      s.label.toLowerCase().includes(input.toLowerCase()) &&
      !tags.includes(s.label)
  );

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(input);
            }
          }}
          placeholder={placeholder}
          disabled={tags.length >= maxTags}
        />
        {open && input && filtered.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
            {filtered.slice(0, 8).map((s) => (
              <button
                key={s.value}
                type="button"
                className="flex w-full px-3 py-2 text-left text-sm hover:bg-secondary"
                onClick={() => addTag(s.label)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
