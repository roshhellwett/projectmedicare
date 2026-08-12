import { getMedicines, PAGE_SIZE } from "@/lib/data";
import { getTranslations } from "next-intl/server";
import DataTable, { type SortConfig } from "@/components/DataTable";
import SearchBox from "@/components/SearchBox";
import PageHeader from "@/components/PageHeader";
import AddToCartButton from "@/components/AddToCartButton";
import { Pill, ShieldCheck, Tag, Phone } from "lucide-react";

export default async function MedicinesPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    page?: string;
    sortKey?: string;
    dir?: string;
  }>;
}) {
  const t = await getTranslations("MedicinesPage");
  const params = await searchParams;
  const query = params.query ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const allowedSort = ["medicine_name", "selling_price", "mrp"];
  const sortKey = allowedSort.includes(params.sortKey ?? "")
    ? (params.sortKey as string)
    : "medicine_name";
  const dir: "asc" | "desc" = params.dir === "desc" ? "desc" : "asc";
  const sort: SortConfig = { key: sortKey, dir };

  const { items, total } = await getMedicines(query, page, sort);

  const buildHref = ({
    page: p,
    sortKey: sk,
    dir: d,
  }: {
    page?: number;
    sortKey?: string;
    dir?: "asc" | "desc";
  }) => {
    const sp = new URLSearchParams();
    if (query) sp.set("query", query);
    if (sk) sp.set("sortKey", sk);
    if (d) sp.set("dir", d);
    if (p && p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/medicines${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow={t("eyebrow")}
        eyebrowIcon={<Pill className="h-4 w-4" />}
        title={t("title")}
        sub={t("sub")}
        actions={
          <a href="tel:+919007013572" className="btn btn-primary btn-sm">
            <Phone className="h-4 w-4" /> {t("contactPharmacy")}
          </a>
        }
      />

      {/* Trust indicator */}
      <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-secondary-dark animate-fade-up">
        <ShieldCheck className="h-4 w-4" />
        {t("trustIndicator")}
      </div>

      <div className="mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <SearchBox placeholder={t("searchPlaceholder")} defaultValue={query} />
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <DataTable
          columns={[
            {
              key: "s_no",
              label: t("colNo"),
              render: (m, i) => (
                <span className="text-muted text-sm">
                  {(page - 1) * PAGE_SIZE + i + 1}
                </span>
              ),
            },
            {
              key: "medicine_name",
              label: t("colName"),
              sortable: true,
              sortKey: "medicine_name",
              render: (m) => (
                <span className="font-semibold text-foreground">
                  {m.medicine_name}
                </span>
              ),
            },
            {
              key: "pack_size",
              label: t("colPack"),
              render: (m) => (
                <span className="text-muted text-sm">{m.pack_size || "-"}</span>
              ),
            },
            {
              key: "mrp",
              label: t("colMrp"),
              sortable: true,
              sortKey: "mrp",
              align: "right",
              render: (m) => (
                <span className="text-muted line-through text-sm">
                  ₹{m.mrp}
                </span>
              ),
            },
            {
              key: "selling_price",
              label: t("colPrice") + " (Patient Rate)",
              sortable: true,
              sortKey: "selling_price",
              align: "right",
              render: (m) => {
                const sp = Number(m.selling_price) || 0;
                const gst = Number(m.gst) || 0;
                const patientRate = sp + (sp * gst) / 100;
                return (
                  <span className="inline-flex items-center gap-2">
                    <span className="font-bold text-secondary-dark text-base">
                      ₹{patientRate.toFixed(2)}
                    </span>
                  </span>
                );
              },
            },
            {
              key: "actions",
              label: "",
              align: "right",
              render: (m) => {
                const sp = Number(m.selling_price) || 0;
                const gst = Number(m.gst) || 0;
                const patientRate = Number((sp + (sp * gst) / 100).toFixed(2));
                return (
                  <AddToCartButton 
                    medicine={{
                      id: m.id,
                      medicine_name: m.medicine_name,
                      pack_size: m.pack_size || "",
                      price: patientRate,
                      is_rx: m.is_rx ?? true // Default to true if missing
                    }} 
                  />
                );
              }
            }
          ]}
          rows={items}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          sort={sort}
          buildHref={buildHref}
          emptyMessage={t("empty")}
          showingLabel={(from, to) => t("showing", { from, to, total })}
        />
      </div>
    </div>
  );
}
