import { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export type MonthPoint = { month: string; registrations: number };
export type CategoryPoint = { name: string; value: number };
export type RevenuePoint = { name: string; revenue: number };

const PIE_COLORS = ["#7C3AED", "#22D3EE", "#C026D3", "#6366F1", "#FFD700", "#F472B6"];
const cardClass = "rounded-2xl bg-white p-5 shadow-lg";

// Measures a container's width so charts get an explicit numeric width
// (more reliable than ResponsiveContainer, which can measure 0 before layout).
function useMeasuredWidth(fallback = 560) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const measure = () => {
      if (ref.current && ref.current.clientWidth > 0) {
        setWidth(ref.current.clientWidth);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 100);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, []);
  return { ref, width };
}

export default function AnalyticsCharts({
  monthly,
  categories,
  revenue,
}: {
  monthly: MonthPoint[];
  categories: CategoryPoint[];
  revenue: RevenuePoint[];
}) {
  const top1 = useMeasuredWidth();
  const top2 = useMeasuredWidth();
  const wide = useMeasuredWidth(1100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className={cardClass}>
        <h3 className="mb-4 font-semibold text-gray-800">
          Registrations over time
        </h3>
        <div ref={top1.ref} className="w-full overflow-hidden">
          <BarChart width={top1.width} height={260} data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} />
            <Tooltip />
            <Bar
              dataKey="registrations"
              fill="#7C3AED"
              radius={[6, 6, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className="mb-4 font-semibold text-gray-800">
          Popular categories (by registrations)
        </h3>
        <div ref={top2.ref} className="w-full overflow-hidden">
          <PieChart width={top2.width} height={260}>
            <Pie
              data={categories}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={85}
              label
              isAnimationActive={false}
            >
              {categories.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      <div className={`${cardClass} lg:col-span-2`}>
        <h3 className="mb-4 font-semibold text-gray-800">
          Revenue by event (RM)
        </h3>
        <div ref={wide.ref} className="w-full overflow-hidden">
          <BarChart
            width={wide.width}
            height={280}
            data={revenue}
            layout="vertical"
            margin={{ left: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis type="number" fontSize={12} />
            <YAxis type="category" dataKey="name" width={150} fontSize={12} />
            <Tooltip />
            <Bar
              dataKey="revenue"
              fill="#22D3EE"
              radius={[0, 6, 6, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
