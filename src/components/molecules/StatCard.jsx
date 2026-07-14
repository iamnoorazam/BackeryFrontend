import { Card, CardContent } from "@/components/ui/card";

const StatCard = ({ title, value, icon: Icon, color = "text-orange-600" }) => (
  <Card className="animate-fade-up card-hover">
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        {Icon && (
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-orange-500">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default StatCard;
