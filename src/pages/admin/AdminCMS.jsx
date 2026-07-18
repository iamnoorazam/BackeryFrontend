import { useState } from "react";
import { Image, FileText, HelpCircle, Megaphone, Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import {
  useBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
  usePages,
  useUpsertPage,
  useDeletePage,
  useFaqs,
  useCreateFaq,
  useDeleteFaq,
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from "@/hooks/useCms";
import { useToast } from "../../store/Toast";
import { formatDate } from "@/lib/utils";

const TABS = [
  { key: "Banners", icon: Image },
  { key: "Pages", icon: FileText },
  { key: "FAQs", icon: HelpCircle },
  { key: "Announcements", icon: Megaphone },
];

const toastErr = (toast) => (e) =>
  toast({ title: e?.response?.data?.message || "Action failed", variant: "destructive" });

const BannersTab = () => {
  const { data, isLoading } = useBanners();
  const create = useCreateBanner();
  const update = useUpdateBanner();
  const del = useDeleteBanner();
  const { toast } = useToast();
  const [form, setForm] = useState({ title: "", image: "", link: "", placement: "home" });

  if (isLoading) return <Spinner />;
  const add = (e) => {
    e.preventDefault();
    if (!form.title) return toast({ title: "Title required", variant: "destructive" });
    create.mutate(form, {
      onSuccess: () => {
        toast({ title: "Banner added" });
        setForm({ title: "", image: "", link: "", placement: "home" });
      },
      onError: toastErr(toast),
    });
  };
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={add} className="grid gap-2 sm:grid-cols-5 sm:items-end">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              placeholder="Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
            <Input
              placeholder="Link"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
            <Select
              value={form.placement}
              onValueChange={(v) => setForm({ ...form, placement: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="promo">Promo</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </form>
        </CardContent>
      </Card>
      {!data?.length ? (
        <EmptyState icon="🖼️" title="No banners" />
      ) : (
        data.map((b) => (
          <Card key={b._id}>
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{b.title}</p>
                  <Badge variant="outline">{b.placement}</Badge>
                  {!b.isActive && <Badge variant="secondary">hidden</Badge>}
                </div>
                <p className="text-xs text-stone-400 truncate">{b.link || b.image || "—"}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => update.mutate({ id: b._id, data: { isActive: !b.isActive } })}
                >
                  {b.isActive ? "Hide" : "Show"}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="text-destructive h-8 w-8"
                  onClick={() => del.mutate(b._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

const PagesTab = () => {
  const { data, isLoading } = usePages();
  const upsert = useUpsertPage();
  const del = useDeletePage();
  const { toast } = useToast();
  const [form, setForm] = useState({ slug: "", title: "", content: "" });
  if (isLoading) return <Spinner />;
  const save = (e) => {
    e.preventDefault();
    if (!form.slug || !form.title)
      return toast({ title: "Slug and title required", variant: "destructive" });
    upsert.mutate(form, {
      onSuccess: () => {
        toast({ title: "Page saved" });
        setForm({ slug: "", title: "", content: "" });
      },
      onError: toastErr(toast),
    });
  };
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={save} className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Slug</Label>
                <Input
                  placeholder="privacy-policy"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
            </div>
            <Label className="text-xs">Content (markdown)</Label>
            <textarea
              className="w-full min-h-[120px] rounded-md border border-input bg-background p-2 text-sm"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <Button type="submit">Save page (upsert by slug)</Button>
          </form>
        </CardContent>
      </Card>
      {!data?.length ? (
        <EmptyState icon="📄" title="No pages" />
      ) : (
        data.map((p) => (
          <Card key={p._id}>
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{p.title}</p>
                  <Badge variant="outline">/{p.slug}</Badge>
                  {!p.isPublished && <Badge variant="secondary">draft</Badge>}
                </div>
                <p className="text-xs text-stone-400">Updated {formatDate(p.updatedAt)}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setForm({ slug: p.slug, title: p.title, content: p.content })}
                >
                  Edit
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="text-destructive h-8 w-8"
                  onClick={() => del.mutate(p._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

const FaqsTab = () => {
  const { data, isLoading } = useFaqs();
  const create = useCreateFaq();
  const del = useDeleteFaq();
  const { toast } = useToast();
  const [form, setForm] = useState({ question: "", answer: "", category: "General" });
  if (isLoading) return <Spinner />;
  const add = (e) => {
    e.preventDefault();
    if (!form.question || !form.answer)
      return toast({ title: "Question and answer required", variant: "destructive" });
    create.mutate(form, {
      onSuccess: () => {
        toast({ title: "FAQ added" });
        setForm({ question: "", answer: "", category: "General" });
      },
      onError: toastErr(toast),
    });
  };
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={add} className="space-y-2">
            <Input
              placeholder="Question"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
            />
            <Input
              placeholder="Answer"
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <Button type="submit">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {!data?.length ? (
        <EmptyState icon="❓" title="No FAQs" />
      ) : (
        data.map((f) => (
          <Card key={f._id}>
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{f.question}</p>
                <p className="text-sm text-muted-foreground">{f.answer}</p>
                <Badge variant="outline" className="mt-1">
                  {f.category}
                </Badge>
              </div>
              <Button
                size="icon"
                variant="outline"
                className="text-destructive h-8 w-8 shrink-0"
                onClick={() => del.mutate(f._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

const AnnouncementsTab = () => {
  const { data, isLoading } = useAnnouncements();
  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();
  const del = useDeleteAnnouncement();
  const { toast } = useToast();
  const [form, setForm] = useState({ message: "", type: "info" });
  if (isLoading) return <Spinner />;
  const add = (e) => {
    e.preventDefault();
    if (!form.message) return toast({ title: "Message required", variant: "destructive" });
    create.mutate(
      { ...form, isActive: true },
      {
        onSuccess: () => {
          toast({ title: "Announcement added" });
          setForm({ message: "", type: "info" });
        },
        onError: toastErr(toast),
      },
    );
  };
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={add} className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Input
              placeholder="Announcement message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="promo">Promo</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </form>
        </CardContent>
      </Card>
      {!data?.length ? (
        <EmptyState icon="📣" title="No announcements" />
      ) : (
        data.map((a) => (
          <Card key={a._id}>
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{a.message}</p>
                  <Badge variant="outline">{a.type}</Badge>
                  {!a.isActive && <Badge variant="secondary">off</Badge>}
                </div>
                <p className="text-xs text-stone-400">{formatDate(a.createdAt)}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => update.mutate({ id: a._id, data: { isActive: !a.isActive } })}
                >
                  {a.isActive ? "Disable" : "Enable"}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="text-destructive h-8 w-8"
                  onClick={() => del.mutate(a._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

const AdminCMS = () => {
  const [tab, setTab] = useState("Banners");
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-teal-600" />
        <h1 className="text-2xl font-bold">Content (CMS)</h1>
      </div>
      <div className="flex gap-1 border-b border-stone-200 dark:border-stone-800 overflow-x-auto">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px flex items-center gap-1.5 transition-colors ${
              tab === key
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            <Icon className="h-4 w-4" />
            {key}
          </button>
        ))}
      </div>
      {tab === "Banners" && <BannersTab />}
      {tab === "Pages" && <PagesTab />}
      {tab === "FAQs" && <FaqsTab />}
      {tab === "Announcements" && <AnnouncementsTab />}
    </div>
  );
};

export default AdminCMS;
