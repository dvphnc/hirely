
import { useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface DataVisualizationsProps {
  employeeStatusData: { name: string; value: number }[];
  departmentCounts: { name: string; count: number }[];
  employeesLoading: boolean;
  departmentsLoading: boolean;
  employeeChartRef: React.RefObject<HTMLDivElement>;
  departmentChartRef: React.RefObject<HTMLDivElement>;
}

export const DataVisualizations = ({
  employeeStatusData,
  departmentCounts,
  employeesLoading,
  departmentsLoading,
  employeeChartRef,
  departmentChartRef,
}: DataVisualizationsProps) => {
  // Colors for pie chart
  const COLORS = ['#0088FE', '#FF8042'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Visualization</CardTitle>
        <CardDescription>
          Charts and data for export
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Employee Status</h3>
            <div className="h-[300px]" ref={employeeChartRef}>
              {employeesLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={employeeStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {employeeStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Department Distribution</h3>
            <div className="h-[300px]" ref={departmentChartRef}>
              {departmentsLoading || employeesLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentCounts}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 40,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8a3ab9" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataVisualizations;
