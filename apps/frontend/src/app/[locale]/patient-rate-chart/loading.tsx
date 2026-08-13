import { FlaskConical, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function Loading() {
  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow="Diagnostics"
        eyebrowIcon={<FlaskConical className="h-4 w-4" />}
        title="Patient Rate Chart"
        sub="Search for diagnostic tests to see our discounted patient rates."
      />

      <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-secondary-dark animate-fade-up">
        <ShieldCheck className="h-4 w-4" />
        Transparent pricing with no hidden charges
      </div>

      <div className="mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="h-11 w-full animate-pulse rounded-md bg-surface-muted" />
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <div className="table-shell hidden max-h-[70vh] overflow-auto md:block">
          <table>
            <thead>
              <tr>
                <th className="w-16">Sl.No</th>
                <th>Test Name</th>
                <th className="text-right">Rate</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={3} className="py-4">
                    <div className="h-6 w-full animate-pulse rounded bg-surface-muted" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile skeleton */}
        <div className="md:hidden space-y-2.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card !p-4">
              <div className="mb-2.5 h-5 w-3/4 animate-pulse rounded bg-surface-muted" />
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                <div className="h-8 animate-pulse rounded bg-surface-muted" />
                <div className="h-8 animate-pulse rounded bg-surface-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
