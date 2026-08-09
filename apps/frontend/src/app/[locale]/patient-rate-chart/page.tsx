import { getRates, PAGE_SIZE } from "@/lib/data";
import { getTranslations } from "next-intl/server";
import DataTable, { type SortConfig } from "@/components/DataTable";
import SearchBox from "@/components/SearchBox";
import PageHeader from "@/components/PageHeader";
import { FlaskConical, ShieldCheck, TestTube } from "lucide-react";

export default async function PatientRateChartPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    page?: string;
    sortKey?: string;
    dir?: string;
  }>;
}) {
  const t = await getTranslations("RateChartPage");
  const params = await searchParams;
  const query = params.query ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const allowedSort = ["test_name", "jm_rate"];
  const sortKey = allowedSort.includes(params.sortKey ?? "")
    ? (params.sortKey as string)
    : "test_name";
  const dir: "asc" | "desc" = params.dir === "desc" ? "desc" : "asc";
  const sort: SortConfig = { key: sortKey, dir };

  const { items, total } = await getRates(query, page, sort);

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
    return `/patient-rate-chart${qs ? `?${qs}` : ""}`;
  };

  const getRateCategory = (rate: number | string) => {
    const num = Number(rate);
    if (isNaN(num) || num === 0) return null;
    if (num <= 200) return { label: t("catBudget"), cls: "badge-green" };
    if (num <= 800) return { label: t("catStandard"), cls: "badge-blue" };
    return { label: t("catPremium"), cls: "badge-magenta" };
  };

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow={t("eyebrow")}
        eyebrowIcon={<FlaskConical className="h-4 w-4" />}
        title={t("title")}
        sub={t("sub")}
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
              key: "sl_no",
              label: t("colNo"),
              render: (r, i) => (
                <span className="text-muted text-sm">
                  {(page - 1) * PAGE_SIZE + i + 1}
                </span>
              ),
            },
            {
              key: "test_name",
              label: t("colTest"),
              sortable: true,
              sortKey: "test_name",
              render: (r) => (
                <span className="font-semibold text-foreground">
                  {r.test_name}
                </span>
              ),
            },
            {
              key: "jm_rate",
              label: t("colRate"),
              sortable: true,
              sortKey: "jm_rate",
              align: "right",
              render: (r) => {
                const cat = getRateCategory(r.jm_rate);
                return (
                  <span className="inline-flex items-center gap-2">
                    <span className="font-bold text-secondary-dark text-base">
                      {typeof r.jm_rate === "number" && !Number.isNaN(r.jm_rate)
                        ? `₹${r.jm_rate}`
                        : r.jm_rate}
                    </span>
                    {cat && (
                      <span className={`badge ${cat.cls} !text-[10px]`}>
                        {cat.label}
                      </span>
                    )}
                  </span>
                );
              },
            },
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
