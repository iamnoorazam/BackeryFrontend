import { useState, useMemo } from "react";
import { Plus, Trash2, Pencil, Save, X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmptyState from "@/components/atoms/EmptyState";
import Spinner from "@/components/atoms/Spinner";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/store/Toast";
import { formatPrice } from "@/lib/utils";

const emptyForm = { name: "", description: "", price: "", category: "", stock: "", image: null };

const CategorySection = ({ name, products, onEdit, onDelete, onQuickPrice, loading }) => {
  const [open, setOpen] = useState(true);
  if (!products?.length) return null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left mb-2 group"
      >
        {open ? <ChevronDown className="h-4 w-4 text-stone-400" /> : <ChevronRight className="h-4 w-4 text-stone-400" />}
        <h2 className="text-base font-bold text-stone-900 group-hover:text-[#D2691E] transition-colors">{name}</h2>
        <Badge variant="secondary" className="text-[10px]">{products.length}</Badge>
      </button>
      {open && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Product</th>
                <th className="text-right px-4 py-3 font-semibold">Price</th>
                <th className="text-right px-4 py-3 font-semibold">Stock</th>
                <th className="text-center px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <ProductRow key={p._id} product={p} onEdit={onEdit} onDelete={onDelete} onQuickPrice={onQuickPrice} loading={loading} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ProductRow = ({ product, onEdit, onDelete, onQuickPrice, loading }) => {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(product.price));

  return (
    <tr className="hover:bg-stone-50 transition-colors">
      <td className="px-4 py-3 flex items-center gap-3">
        <img
          src={product.images?.[0] || "https://placehold.co/40x40?text=N"}
          alt={product.name}
          className="w-10 h-10 rounded-lg object-cover shrink-0"
        />
        <span className="font-medium text-stone-900 truncate max-w-[250px]">{product.name}</span>
        {!product.isAvailable && <Badge variant="secondary" className="text-[9px] shrink-0">Hidden</Badge>}
      </td>
      <td className="px-4 py-3 text-right">
        {editing ? (
          <div className="flex items-center justify-end gap-1">
            <span className="text-xs text-stone-400">₹</span>
            <input
              type="number" min="1" value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-20 text-sm border rounded px-1 py-0.5 text-right"
              autoFocus
            />
            <button onClick={() => { onQuickPrice(product._id, price); setEditing(false); }} disabled={loading} className="text-green-600 hover:text-green-700"><Save className="h-3.5 w-3.5" /></button>
            <button onClick={() => { setPrice(String(product.price)); setEditing(false); }} className="text-red-500 hover:text-red-600"><X className="h-3.5 w-3.5" /></button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <span className="font-semibold">{formatPrice(product.price)}</span>
            <button onClick={() => { setPrice(String(product.price)); setEditing(true); }} className="text-stone-400 hover:text-stone-600 ml-1" title="Quick edit price">
              <Pencil className="h-3 w-3" />
            </button>
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-right">{product.stock}</td>
      <td className="px-4 py-3 text-center">
        <Badge variant={product.isAvailable ? "default" : "secondary"} className="text-[10px]">
          {product.isAvailable ? "Active" : "Hidden"}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(product)} title="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => onDelete(product._id)} disabled={loading} title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

const AdminProducts = () => {
  const { data, isLoading, refetch } = useProducts({ limit: 200 });
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const allProducts = data?.products || data || [];

  const grouped = useMemo(() => {
    const filtered = search
      ? allProducts.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()))
      : allProducts;
    return filtered.reduce((acc, p) => {
      const cat = p.category?.name || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    }, {});
  }, [allProducts, search]);

  const setter = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const setEdit = (key) => (e) => {
    setEditForm((p) => ({ ...p, [key]: e.target.value }));
  };

  const validate = (fd) => {
    const e = {};
    if (!fd.name.trim()) e.name = "Name is required";
    if (!fd.description.trim()) e.description = "Description is required";
    if (!fd.price || Number(fd.price) <= 0) e.price = "Enter a valid price";
    if (!fd.category) e.category = "Select a category";
    if (fd.stock === "" || Number(fd.stock) < 0) e.stock = "Enter valid stock";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (createProduct.isPending || !validate(form)) return;
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("price", form.price);
    fd.append("category", form.category);
    fd.append("stock", form.stock);
    if (form.image) fd.append("images", form.image);
    createProduct.mutate(fd, {
      onSuccess: () => { refetch(); toast({ title: "Product created!" }); setCreateOpen(false); setForm(emptyForm); setErrors({}); setImagePreview(null); },
      onError: (err) => toast({ title: err.response?.data?.message || "Failed", variant: "destructive" }),
    });
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setEditForm({
      name: product.name, description: product.description, price: String(product.price),
      category: product.category?._id || product.category, stock: String(product.stock),
    });
    setErrors({});
    setEditOpen(true);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (updateProduct.isPending || !editProduct || !validate(editForm)) return;
    updateProduct.mutate(
      { id: editProduct._id, data: { name: editForm.name, description: editForm.description, price: Number(editForm.price), category: editForm.category, stock: Number(editForm.stock) } },
      { onSuccess: () => { refetch(); toast({ title: "Product updated!" }); setEditOpen(false); setEditProduct(null); setErrors({}); }, onError: (err) => toast({ title: err.response?.data?.message || "Failed", variant: "destructive" }) },
    );
  };

  const handleQuickPrice = (id, price) => {
    updateProduct.mutate(
      { id, data: { price: Number(price) } },
      { onSuccess: () => { refetch(); toast({ title: "Price updated!" }); }, onError: () => toast({ title: "Failed to update price", variant: "destructive" }) },
    );
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this product?")) return;
    deleteProduct.mutate(id, {
      onSuccess: () => { refetch(); toast({ title: "Product deleted" }); },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    });
  };

  const handlers = { onEdit: openEdit, onDelete: handleDelete, onQuickPrice: handleQuickPrice, loading: updateProduct.isPending || deleteProduct.isPending };

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">All Products ({allProducts.length})</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 text-sm w-48"
          />
          <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) { setForm(emptyForm); setErrors({}); setImagePreview(null); } }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3 mt-2">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={setter("name")} placeholder="e.g. Chocolate Cake" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={setter("description")} placeholder="Short description" />
                  {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Price (₹)</Label>
                    <Input type="number" min="1" value={form.price} onChange={setter("price")} placeholder="500" />
                    {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label>Stock</Label>
                    <Input type="number" min="0" value={form.stock} onChange={setter("stock")} placeholder="10" />
                    {errors.stock && <p className="text-xs text-red-500">{errors.stock}</p>}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Category</Label>
                  {categories?.length > 0 ? (
                    <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (<SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  ) : <p className="text-sm text-stone-500 border rounded-md px-3 py-2">No categories</p>}
                  {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Image</Label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-white border border-dashed border-stone-300 hover:border-[#D2691E] rounded-lg px-4 py-3 transition-colors w-full">
                      <input
                        type="file" accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setForm((p) => ({ ...p, image: file }));
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                      <span className="text-sm text-stone-500">{form.image ? form.image.name : "Upload an image"}</span>
                    </label>
                    {imagePreview && (
                      <div className="relative shrink-0">
                        <img src={imagePreview} alt="Preview" className="w-14 h-14 rounded-lg object-cover border" />
                        <button type="button" onClick={() => { setForm((p) => ({ ...p, image: null })); setImagePreview(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createProduct.isPending}>
                  {createProduct.isPending ? "Creating..." : "Create Product"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!allProducts.length ? (
        <EmptyState icon="🍰" title="No products yet" description="Add your first product!" />
      ) : Object.keys(grouped).length === 0 ? (
        <EmptyState icon="🔍" title="No matching products" description="Try a different search term." />
      ) : (
        Object.entries(grouped).map(([cat, prods]) => (
          <CategorySection key={cat} name={cat} products={prods} {...handlers} />
        ))
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={editForm.name} onChange={setEdit("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input value={editForm.description} onChange={setEdit("description")} />
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Price (₹)</Label>
                <Input type="number" min="1" value={editForm.price} onChange={setEdit("price")} />
                {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
              </div>
              <div className="space-y-1">
                <Label>Stock</Label>
                <Input type="number" min="0" value={editForm.stock} onChange={setEdit("stock")} />
                {errors.stock && <p className="text-xs text-red-500">{errors.stock}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              {categories?.length > 0 ? (
                <Select value={editForm.category} onValueChange={(v) => setEditForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (<SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              ) : <p className="text-sm text-stone-500 border rounded-md px-3 py-2">No categories</p>}
              {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={updateProduct.isPending}>
              {updateProduct.isPending ? "Updating..." : "Update Product"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
