"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type BarItem = { label: string; value: number };

function MiniBarChart({ data, color }: { data: BarItem[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,.1)" }} />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} name="Qtd" />
      </BarChart>
    </ResponsiveContainer>
  );
}

type Props = {
  alunosPorPolo: BarItem[];
  concluentesPorMes: BarItem[];
};

export function ChartsSection({ alunosPorPolo, concluentesPorMes }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-100">
        <p className="mb-4 text-sm font-bold text-gray-700">Alunos por Polo</p>
        <MiniBarChart data={alunosPorPolo} color="#1565c0" />
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-100">
        <p className="mb-4 text-sm font-bold text-gray-700">Concluintes por Mês (2026)</p>
        <MiniBarChart data={concluentesPorMes} color="#16a34a" />
      </div>
    </div>
  );
}
