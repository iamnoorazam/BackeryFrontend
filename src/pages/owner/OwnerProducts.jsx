import { useState, useMemo } from "react";
import { Plus, Trash2, Pencil, Save, X, ChevronDown, ChevronRight } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/atoms/EmptyState";
import Spinner from "@/components/atoms/Spinner";
import { useOwnerProducts } from "@/hooks/useOwner";
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "../../store/Toast";
import { formatPrice } from "@/lib/utils";

const emptyForm = {
  name: "", description: "", price: "", category: "", stock: "",
};

const InlinePriceEdit = ({ product, onSave, loading }) => {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(product.price));
  const [originalPrice, setOriginalPrice] = useState(String(product.originalPrice || ""));

  if (!editing) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-primary font-bold text-base sm:text-lg">{formatPrice(product.price)}</p>
        {product.originalPrice > product.price && (
          <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
        )}
        <button
          onClick={() => setEditing(true)}
          className="text-muted-foreground hover:text-primary transition-colors"
          title="Quick edit price"
        >
          <Pencil className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">₹</span>
        <input
          type="number" min="1" value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-20 text-sm border rounded px-1 py-0.5"
          autoFocus
        />
      </div>
      {product.originalPrice > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Was ₹</span>
          <input
            type="number" min="1" value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className="w-16 text-xs border rounded px-1 py-0.5 text-muted-foreground"
          />
        </div>
      )}
      <div className="flex gap-1">
        <button
          onClick={async () => {
            if (!price || Number(price) <= 0) return;
            await onSave(product._id, {
              price: Number(price),
              ...(originalPrice ? { originalPrice: Number(originalPrice) } : {}),
            });
            setEditing(false);
          }}
          disabled={loading}
          className="text-green-600 hover:text-green-700 transition-colors"
          title="Save"
        >
          <Save className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => {
            setPrice(String(product.price));
            setOriginalPrice(String(product.originalPrice || ""));
            setEditing(false);
          }}
          className="text-destructive hover:text-destructive/80 transition-colors"
          title="Cancel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onEdit, onDelete, onToggleAvailability, onQuickPrice, loading }) => (
  <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
    <div className="h-32 sm:h-36 overflow-hidden bg-muted relative">
      <img
        src={product.images?.[0] || "https://placehold.co/300x200?text=No+Image"}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      {product.originalPrice > product.price && (
        <Badge className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5">
          {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
        </Badge>
      )}
      {!product.isAvailable && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="text-white font-semibold text-xs sm:text-sm bg-destructive px-2 py-1 rounded">Unavailable</span>
        </div>
      )}
    </div>
    <CardContent className="p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm sm:text-base truncate flex-1">{product.name}</p>
        <Button
          variant="ghost" size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => onEdit(product)}
          title="Edit product details"
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>

      <InlinePriceEdit product={product} onSave={onQuickPrice} loading={loading} />

      <p className="text-xs text-muted-foreground">
        Stock: {product.stock} | {product.category?.name}
      </p>

      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <Button
          variant="outline" size="sm"
          className="flex-1 text-[11px] h-7 min-w-0"
          onClick={() => onToggleAvailability(product._id, !product.isAvailable)}
        >
          {product.isAvailable ? "Hide" : "Show"}
        </Button>
        <Button
          variant="destructive" size="sm"
          className="flex-1 text-[11px] h-7 min-w-0"
          disabled={loading}
          onClick={() => onDelete(product._id)}
        >
          <Trash2 className="h-3 w-3 mr-0.5" /> Delete
        </Button>
      </div>
    </CardContent>
  </Card>
);

const CategorySection = ({ categoryName, products, ...handlers }) => {
  const [open, setOpen] = useState(true);
  if (!products?.length) return null;

  return (
    <div className="mb-6 sm:mb-8">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left mb-3 group"
      >
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        <h2 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-primary transition-colors">
          {categoryName}
        </h2>
        <Badge variant="secondary" className="text-[10px] sm:text-xs">{products.length}</Badge>
      </button>
      {open && (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} {...handlers} />
          ))}
        </div>
      )}
    </div>
  );
};

const OwnerProducts = () => {
  const { data: products, isLoading, refetch: refetchOwnerProducts } = useOwnerProducts();
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
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    if (!products) return {};
    const filtered = search
      ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      : products;
    return filtered.reduce((acc, p) => {
      const cat = p.category?.name || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    }, {});
  }, [products, search]);

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
    if (createProduct.isLoading || !validate(form)) return;
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("price", form.price);
    fd.append("category", form.category);
    fd.append("stock", form.stock);
    images.forEach((img) => fd.append("images", img));
    createProduct.mutate(fd, {
      onSuccess: () => { refetchOwnerProducts(); toast({ title: "Product created!" }); setCreateOpen(false); setForm(emptyForm); setImages([]); setErrors({}); },
      onError: (err) => toast({ title: err.response?.data?.message || "Failed", variant: "destructive" }),
    });
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setEditForm({
      name: product.name, description: product.description, price: String(product.price),
      originalPrice: String(product.originalPrice || ""), category: product.category?._id || product.category,
      stock: String(product.stock), discount: String(product.discount || 0),
    });
    setErrors({});
    setEditOpen(true);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (updateProduct.isLoading || !editProduct || !validate(editForm)) return;
    updateProduct.mutate(
      { id: editProduct._id, data: { name: editForm.name, description: editForm.description, price: Number(editForm.price), originalPrice: Number(editForm.originalPrice) || undefined, category: editForm.category, stock: Number(editForm.stock), discount: Number(editForm.discount) || 0 } },
      { onSuccess: () => { refetchOwnerProducts(); toast({ title: "Product updated!" }); setEditOpen(false); setEditProduct(null); setErrors({}); }, onError: (err) => toast({ title: err.response?.data?.message || "Failed", variant: "destructive" }) },
    );
  };

  const handleQuickPrice = (id, data) => new Promise((resolve, reject) => {
    updateProduct.mutate(
      { id, data },
      { onSuccess: () => { refetchOwnerProducts(); toast({ title: "Price updated!" }); resolve(); }, onError: (err) => { toast({ title: "Failed to update price", variant: "destructive" }); reject(err); } },
    );
  });

  const handleDelete = (id) => {
    deleteProduct.mutate(id, {
      onSuccess: () => { refetchOwnerProducts(); toast({ title: "Product deleted" }); },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    });
  };

  const handleToggle = (id, isAvailable) => {
    updateProduct.mutate(
      { id, data: { isAvailable } },
      { onSuccess: () => { refetchOwnerProducts(); toast({ title: isAvailable ? "Product is now visible" : "Product hidden" }); } },
    );
  };

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  const handlers = { onEdit: openEdit, onDelete: handleDelete, onToggleAvailability: handleToggle, onQuickPrice: handleQuickPrice, loading: updateProduct.isLoading || deleteProduct.isLoading };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Manage Products ({products?.length ?? 0})</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search products..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 text-sm flex-1 sm:w-48"
          />
          <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) { setForm(emptyForm); setErrors({}); setImages([]); } }}>
            <DialogTrigger asChild>
              <Button size="sm" className="shrink-0"><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3 mt-2">
                <ProductFormFields form={form} onChange={setter} categories={categories} errors={errors} images={images} setImages={setImages} />
                <Button type="submit" className="w-full" disabled={createProduct.isLoading}>
                  {createProduct.isLoading ? "Creating..." : "Create Product"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!products?.length ? (
        <EmptyState icon="🍰" title="No products yet" description="Add your first product!" />
      ) : Object.keys(grouped).length === 0 ? (
        <EmptyState icon="🔍" title="No matching products" description="Try a different search term." />
      ) : (
        Object.entries(grouped).map(([cat, prods]) => (
          <CategorySection key={cat} categoryName={cat} products={prods} {...handlers} />
        ))
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={editForm.name} onChange={setEdit("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input value={editForm.description} onChange={setEdit("description")} />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Selling Price (₹)</Label>
                <Input type="number" min="1" value={editForm.price} onChange={setEdit("price")} />
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>
              <div className="space-y-1">
                <Label>Original Price (₹)</Label>
                <Input type="number" min="1" value={editForm.originalPrice} onChange={(e) => setEditForm((p) => ({ ...p, originalPrice: e.target.value }))} placeholder="For discount" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Stock</Label>
                <Input type="number" min="0" value={editForm.stock} onChange={setEdit("stock")} />
                {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
              </div>
              <div className="space-y-1">
                <Label>Discount (%)</Label>
                <Input type="number" min="0" max="100" value={editForm.discount} onChange={(e) => setEditForm((p) => ({ ...p, discount: e.target.value }))} placeholder="0" />
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
              ) : <p className="text-sm text-muted-foreground border rounded-md px-3 py-2">No categories</p>}
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={updateProduct.isLoading}>
              {updateProduct.isLoading ? "Updating..." : "Update Product"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ProductFormFields = ({ form, onChange, categories, errors, images, setImages }) => (
  <>
    <div className="space-y-1">
      <Label>Name</Label>
      <Input value={form.name} onChange={onChange("name")} placeholder="e.g. Chocolate Cake" />
      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
    </div>
    <div className="space-y-1">
      <Label>Description</Label>
      <Input value={form.description} onChange={onChange("description")} placeholder="Short description" />
      {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label>Price (₹)</Label>
        <Input type="number" min="1" value={form.price} onChange={onChange("price")} placeholder="500" />
        {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
      </div>
      <div className="space-y-1">
        <Label>Stock</Label>
        <Input type="number" min="0" value={form.stock} onChange={onChange("stock")} placeholder="10" />
        {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
      </div>
    </div>
    <div className="space-y-1">
      <Label>Category</Label>
      {categories?.length > 0 ? (
        <Select value={form.category} onValueChange={(v) => { onChange("category")({ target: { value: v } }); setErrors((p) => ({ ...p, category: "" })); }}>
          <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => (<SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>))}
          </SelectContent>
        </Select>
      ) : <p className="text-sm text-muted-foreground border rounded-md px-3 py-2">No categories</p>}
      {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
    </div>
    <div className="space-y-1">
      <Label>Images (optional)</Label>
      <Input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files))} className="cursor-pointer" />
      {images.length > 0 && <p className="text-xs text-muted-foreground">{images.length} file(s) selected</p>}
    </div>
  </>
);

export default OwnerProducts;