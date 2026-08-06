import { getFeaturedPackages } from "@/lib/db/packages";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function FeaturedPackages({ locale }: { locale: string }) {
  const packages = await getFeaturedPackages();
  
  if (!packages || packages.length === 0) return null;
  
  const t = await getTranslations("HomePage");

  return (
    <section className="section bg-surface border-y border-line">
      <div className="container">
        <div className="mb-8 max-w-2xl">
          <span className="eyebrow">Health Packages</span>
          <h2 className="section-title mt-2">Comprehensive Preventive Care</h2>
          <p className="section-sub mt-2">
            Get complete peace of mind with our curated health checkup packages at honest Janta prices.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="card flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
              <div>
                <h3 className="text-lg font-bold text-primary-deep">{pkg.name}</h3>
                {pkg.description && (
                  <p className="mt-2 text-sm text-muted line-clamp-2">{pkg.description}</p>
                )}
                
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-2xl font-bold text-foreground">₹{pkg.janta_price}</span>
                  <span className="text-sm text-muted line-through mb-1">₹{pkg.market_price}</span>
                </div>
                
                <div className="mt-4 space-y-2 border-t border-line pt-4">
                  {pkg.tests.slice(0, 4).map((test, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{test}</span>
                    </div>
                  ))}
                  {pkg.tests.length > 4 && (
                    <div className="text-xs font-medium text-primary mt-1">
                      + {pkg.tests.length - 4} more tests
                    </div>
                  )}
                </div>
              </div>
              
              <Link href={`/${locale}/packages`} className="btn btn-outline w-full mt-6">
                View Details <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
