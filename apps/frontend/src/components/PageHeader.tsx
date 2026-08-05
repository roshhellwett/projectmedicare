export default function PageHeader({
  eyebrow,
  eyebrowIcon,
  title,
  sub,
  actions,
}: {
  eyebrow: string;
  eyebrowIcon?: React.ReactNode;
  title: string;
  sub?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 border-b border-line pb-6">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <span className="eyebrow">
            {eyebrowIcon}
            {eyebrow}
          </span>
          <h1 className="section-title mt-2">{title}</h1>
          {sub && <p className="section-sub mt-2">{sub}</p>}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
