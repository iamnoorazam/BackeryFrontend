import { useState } from "react";
import { FileBarChart, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import { useReportList, useReport } from "@/hooks/useReports";
import { reportsApi } from "@/api/reports.api";
import { useToast } from "../../store/Toast";

const AdminReports = () => {
  const { data: reports, isLoading: listLoading } = useReportList();
  const [type, setType] = useState("orders");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { toast } = useToast();

  const params = { ...(from ? { from } : {}), ...(to ? { to } : {}) };
  const { data: report, isFetching } = useReport(type, params);
  const [downloading, setDownloading] = useState(false);

  const active = reports?.find((r) => r.type === type);

  const download = async () => {
    setDownloading(true);
    try {
      const res = await reportsApi.exportCsv(type, params);
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-report.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "CSV downloaded" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <FileBarChart className="h-6 w-6 text-teal-600" />
        <h1 className="text-2xl font-bold">Reports &amp; Export</h1>
      </div>

      {/* Report picker */}
      {listLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {reports?.map((r) => (
            <button
              key={r.type}
              onClick={() => setType(r.type)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                type === r.type
                  ? "border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-950"
                  : "border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {active && <p className="text-sm text-stone-400">{active.description}</p>}

      {/* Controls */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-stone-400">{report ? `${report.count} rows` : ""}</span>
            <Button onClick={download} disabled={downloading || !report?.rows?.length}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview table */}
      {isFetching && !report ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : !report?.rows?.length ? (
        <EmptyState icon="📊" title="No rows for this range" />
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-left">
                  {report.columns.map((c) => (
                    <th key={c.key} className="p-3 font-medium text-stone-500 whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.rows.slice(0, 100).map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-stone-100 dark:border-stone-900 hover:bg-stone-50 dark:hover:bg-stone-900"
                  >
                    {report.columns.map((c) => (
                      <td key={c.key} className="p-3 whitespace-nowrap">
                        {String(row[c.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {report.rows.length > 100 && (
              <p className="p-3 text-xs text-stone-400">
                Showing first 100 of {report.count} rows — export CSV for the full dataset.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminReports;
