import { Link } from "@/i18n/routing";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";

export type SortConfig = { key: string; dir: "asc" | "desc" };

export type Column<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  sortKey?: string;
  render: (row: T, index: number) => React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  /** promote to the card title on mobile */
  primary?: boolean;
  /** omit from the mobile card */
  hideOnMobile?: boolean;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  sort: SortConfig;
  buildHref: (params: {
    page?: number;
    sortKey?: string;
    dir?: "asc" | "desc";
  }) => string;
  emptyMessage: string;
  showingLabel: (from: number, to: number) => string;
};

export default function DataTable<T>({
  columns,
  rows,
  total,
  page,
  pageSize,
  sort,
  buildHref,
  emptyMessage,
  showingLabel,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pageNumbers = () => {
    const pages: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const align = (a?: "left" | "right" | "center") =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "";

  const sortable = columns.filter((c) => c.sortable);
  const titleCol =
    columns.find((c) => c.primary) ??
    columns.find((c) => c.sortable) ??
    columns[0];
  const detailCols = columns.filter((c) => c !== titleCol && !c.hideOnMobile);

  return (
    <div>
      {/* Mobile: sort control + stacked cards */}
      <div className="md:hidden">
        {rows.length > 0 && sortable.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Sort
            </span>
            {sortable.map((col) => {
              const key = col.sortKey ?? col.key;
              const isActive = sort.key === key;
              const nextDir: "asc" | "desc" =
                isActive && sort.dir === "asc" ? "desc" : "asc";
              return (
                <Link
                  key={col.key}
                  href={buildHref({ sortKey: key, dir: nextDir })}
                  scroll={false}
                  className={`btn-page ${isActive ? "active" : ""}`}
                >
                  {col.label}
                  {isActive &&
                    (sort.dir === "asc" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    ))}
                </Link>
              );
            })}
          </div>
        )}

        {rows.length === 0 ? (
          <div className="card py-12 text-center text-sm text-muted">
            {emptyMessage}
          </div>
        ) : (
          <ul className="space-y-2.5">
            {rows.map((row, i) => (
              <li key={i} className="card !p-4">
                <div className="mb-2.5 text-[0.9375rem] font-semibold leading-snug text-foreground">
                  {titleCol?.render(row, i)}
                </div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {detailCols.map((col) => (
                    <div key={col.key} className="min-w-0">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-soft">
                        {col.label}
                      </dt>
                      <dd className="tnum text-sm text-foreground">
                        {col.render(row, i)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Desktop: real table */}
      <div className="table-shell hidden max-h-[70vh] overflow-auto md:block">
        <table>
          <thead>
            <tr>
              {columns.map((col) => {
                const isActive = sort.key === (col.sortKey ?? col.key);
                const nextDir: "asc" | "desc" =
                  isActive && sort.dir === "asc" ? "desc" : "asc";
                return (
                  <th
                    key={col.key}
                    className={align(col.align)}
                    aria-sort={
                      isActive
                        ? sort.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    {col.sortable ? (
                      <Link
                        href={buildHref({
                          sortKey: col.sortKey ?? col.key,
                          dir: nextDir,
                        })}
                        scroll={false}
                        className="sortable"
                      >
                        {col.label}
                        {isActive &&
                          (sort.dir === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          ))}
                      </Link>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${col.className ?? ""} ${align(col.align)}`}
                    >
                      {col.render(row, i)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <p className="text-xs text-muted sm:text-sm">
          {showingLabel(from, to)}
        </p>
        {totalPages > 1 && (
          <nav
            className="flex flex-wrap items-center gap-1.5"
            aria-label="Pagination"
          >
            <Link
              href={buildHref({ page: Math.max(1, page - 1) })}
              scroll={false}
              aria-disabled={page <= 1}
              aria-label="Previous page"
              className={`btn-page ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            {pageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`e${i}`} className="px-1 text-muted-soft">
                  …
                </span>
              ) : (
                <Link
                  key={p}
                  href={buildHref({ page: p })}
                  scroll={false}
                  aria-current={p === page ? "page" : undefined}
                  className={`btn-page ${p === page ? "active" : ""}`}
                >
                  {p}
                </Link>
              ),
            )}
            <Link
              href={buildHref({ page: Math.min(totalPages, page + 1) })}
              scroll={false}
              aria-disabled={page >= totalPages}
              aria-label="Next page"
              className={`btn-page ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
}
