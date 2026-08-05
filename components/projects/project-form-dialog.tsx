"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { StatusBadge } from "@/components/projects/status-badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS, STATUS_OPTIONS } from "@/lib/constants";
import { parseDateString, toDateString } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types/project";

const STATUS_ITEMS = STATUS_OPTIONS.map((option) => ({
  label: STATUS_LABELS[option],
  value: option,
}));

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  defaultStartDate?: string;
  onSave: (data: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: ProjectStatus;
  }) => void;
  onDelete?: (id: string) => void;
}

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const date = parseDateString(value);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
              )}
            />
          }
        >
          <CalendarIcon className="mr-2 size-4" />
          {format(date, "yyyy-MM-dd", { locale: ko })}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selected) => {
              if (selected) onChange(toDateString(selected));
            }}
            locale={ko}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  defaultStartDate,
  onSave,
  onDelete,
}: ProjectFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("scheduled");

  useEffect(() => {
    if (!open) return;

    if (project) {
      setName(project.name);
      setDescription(project.description ?? "");
      setStartDate(project.startDate);
      setEndDate(project.endDate);
      setStatus(project.status);
      return;
    }

    const today = defaultStartDate ?? toDateString(new Date());
    setName("");
    setDescription("");
    setStartDate(today);
    setEndDate(today);
    setStatus("scheduled");
  }, [open, project, defaultStartDate]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed || !startDate || !endDate) return;

    const start = parseDateString(startDate);
    const end = parseDateString(endDate);
    const normalizedStart = start <= end ? startDate : endDate;
    const normalizedEnd = start <= end ? endDate : startDate;

    onSave({
      name: trimmed,
      description: description.trim(),
      startDate: normalizedStart,
      endDate: normalizedEnd,
      status,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{project ? "프로젝트 수정" : "프로젝트 추가"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="project-name">프로젝트명</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="프로젝트 이름"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">프로젝트 상세</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="프로젝트 설명을 입력하세요"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DatePickerField
              label="개발 시작일"
              value={startDate}
              onChange={setStartDate}
            />
            <DatePickerField
              label="개발 완료일"
              value={endDate}
              onChange={setEndDate}
            />
          </div>

          <div className="space-y-2">
            <Label>상태</Label>
            <Select
              items={STATUS_ITEMS}
              value={status}
              onValueChange={(value) => setStatus(value as ProjectStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {STATUS_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      <StatusBadge status={item.value as ProjectStatus} />
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {project && onDelete ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onDelete(project.id);
                onOpenChange(false);
              }}
            >
              삭제
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="button" onClick={handleSave} disabled={!name.trim()}>
              저장
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
