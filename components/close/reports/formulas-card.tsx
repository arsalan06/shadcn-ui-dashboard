import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REPORT_FORMULAS } from "@/lib/reports-data";

export function FormulasCard() {
  return (
    <Card size="sm" className="min-w-0">
      <CardHeader className="border-b">
        <CardTitle>Formulas for calculations</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-2">
        {REPORT_FORMULAS.map((f) => (
          <div
            key={f.term}
            className="flex gap-2.5 border-b py-1.5 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0"
          >
            <span className="w-28 shrink-0 text-xs font-semibold">
              {f.term}
            </span>
            <span className="text-xs text-muted-foreground">{f.meaning}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
