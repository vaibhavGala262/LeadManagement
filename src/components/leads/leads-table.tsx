"use client";

import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type HeaderContext,
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Plus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/leads/status-badge";
import { DeleteDialog } from "@/components/leads/delete-dialog";
import { LeadForm } from "@/components/leads/lead-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { LeadFormData } from "@/lib/validations";
import { useLeads, type Lead } from "@/hooks/use-leads";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CONVERTED", label: "Converted" },
  { value: "LOST", label: "Lost" },
];

export function LeadsTable() {
  const {
    leads,
    pagination,
    isLoading,
    fetchLeads,
    createLead,
    updateLead,
    updateLeadStatus,
    deleteLead,
  } = useLeads();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteLeadTarget, setDeleteLeadTarget] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    const sort = sorting[0];
    fetchLeads({
      page,
      limit: 10,
      search: debouncedSearch,
      status: statusFilter === "all" ? undefined : statusFilter,
      sortBy: sort?.id || "createdAt",
      order: sort?.desc ? "desc" : "asc",
    });
  }, [page, debouncedSearch, statusFilter, sorting, fetchLeads]);

  const handleCreate = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      await createLead(data);
      toast.success("Lead created successfully");
      setCreateOpen(false);
      fetchLeads({ page: 1, limit: 10 });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: LeadFormData) => {
    if (!editLead) return;
    setIsSubmitting(true);
    try {
      await updateLead(editLead.id, data);
      toast.success("Lead updated successfully");
      setEditLead(null);
      fetchLeads({ page, limit: 10 });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteLeadTarget) return;
    try {
      await deleteLead(deleteLeadTarget.id);
      toast.success("Lead deleted successfully");
      setDeleteLeadTarget(null);
      fetchLeads({ page: leads.length === 1 && page > 1 ? page - 1 : page, limit: 10 });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete lead");
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      toast.success("Status updated");
      fetchLeads({ page, limit: 10 });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const columnHelper = createColumnHelper<Lead>();

  const columns = [
      columnHelper.accessor("name", {
        header: ({ column }: HeaderContext<Lead, unknown>) => (
          <button
            className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronsUpDown className="h-4 w-4" />
            )}
          </button>
        ),
        cell: (info) => (
          <div>
            <p className="font-medium">{info.getValue() as string}</p>
            <p className="text-xs text-zinc-500">{info.row.original.email}</p>
          </div>
        ),
      }),
      columnHelper.accessor("company", {
        header: "Company",
        cell: (info) => (info.getValue() as string | null) || <span className="text-zinc-400">—</span>,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("createdAt", {
        header: ({ column }: HeaderContext<Lead, unknown>) => (
          <button
            className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronsUpDown className="h-4 w-4" />
            )}
          </button>
        ),
        cell: (info) => (
          <span className="text-sm text-zinc-500">
            {formatDate(info.getValue() as string)}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditLead(row.original)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Lead
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-normal text-zinc-400">
                Change Status
              </DropdownMenuLabel>
              {["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"].map(
                (status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleStatusChange(row.original.id, status)}
                    className={cn(
                      row.original.status === status && "bg-zinc-100 dark:bg-zinc-800"
                    )}
                  >
                    <StatusBadge status={status} />
                  </DropdownMenuItem>
                )
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                onClick={() => setDeleteLeadTarget(row.original)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
  ];

  const table = useReactTable({
    data: leads as Lead[],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
          <p className="text-sm text-zinc-500">
            Manage and track your leads
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Users className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold">No leads found</h3>
            <p className="mt-1 text-sm text-zinc-500">
              {debouncedSearch || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first lead"}
            </p>
            {!debouncedSearch && statusFilter === "all" && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            )}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <p className="text-sm text-zinc-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Lead</DialogTitle>
            <DialogDescription>
              Add a new lead to your pipeline.
            </DialogDescription>
          </DialogHeader>
          <LeadForm
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editLead} onOpenChange={(open) => !open && setEditLead(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update lead information.
            </DialogDescription>
          </DialogHeader>
          <LeadForm
            lead={editLead}
            onSubmit={handleEdit}
            onCancel={() => setEditLead(null)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deleteLeadTarget}
        onOpenChange={(open) => !open && setDeleteLeadTarget(null)}
        leadName={deleteLeadTarget?.name || ""}
        onConfirm={handleDelete}
      />
    </div>
  );
}
