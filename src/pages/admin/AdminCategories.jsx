import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/atoms/EmptyState";
import Spinner from "@/components/atoms/Spinner";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { useToast } from "../../store/Toast";

const AdminCategories = () => {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleCreate = (e) => {
    e.preventDefault();
    createCategory.mutate(form, {
      onSuccess: () => {
        toast({ title: "Category created!" });
        setCreateOpen(false);
        setForm({ name: "", description: "" });
      },
      onError: (err) =>
        toast({
          title: err.response?.data?.message || "Failed",
          variant: "destructive",
        }),
    });
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setForm({ name: cat.name, description: cat.description || "" });
    setEditOpen(true);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    updateCategory.mutate(
      { id: editTarget._id, data: form },
      {
        onSuccess: () => {
          toast({ title: "Category updated!" });
          setEditOpen(false);
          setEditTarget(null);
          setForm({ name: "", description: "" });
        },
        onError: (err) =>
          toast({
            title: err.response?.data?.message || "Failed",
            variant: "destructive",
          }),
      },
    );
  };

  const handleDelete = (id) => {
    deleteCategory.mutate(id, {
      onSuccess: () => toast({ title: "Deleted" }),
      onError: (err) =>
        toast({
          title: err.response?.data?.message || "Failed",
          variant: "destructive",
        }),
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Categories ({categories?.length ?? 0})
        </h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3 mt-2">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={form.name} onChange={set("name")} required />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Input value={form.description} onChange={set("description")} />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createCategory.isLoading}
              >
                {createCategory.isLoading ? "Creating..." : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={form.name} onChange={set("name")} required />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input value={form.description} onChange={set("description")} />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={updateCategory.isLoading}
            >
              {updateCategory.isLoading ? "Updating..." : "Update"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {!categories?.length ? (
        <EmptyState icon="🏷️" title="No categories yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Card key={cat._id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{cat.name}</p>
                  {cat.description && (
                    <p className="text-sm text-muted-foreground">
                      {cat.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => openEdit(cat)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive h-8 w-8"
                    onClick={() => handleDelete(cat._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
