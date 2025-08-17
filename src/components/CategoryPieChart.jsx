import React, { useEffect, useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast"; // Import useToast for error feedback

// Define a consistent color palette for the chart
const COLORS = [
  '#60a5fa', // Blue
  '#f87171', // Red
  '#34d399', // Green
  '#fbbf24', // Yellow
  '#a78bfa', // Purple
  '#f472b6', // Pink
  '#38bdf8', // Sky Blue
  '#c084fc', // Violet
  '#2dd4bf', // Teal
  '#fca5a5', // Light Red
  '#a8a29e', // Stone
  '#fcd34d', // Amber
];

export default function CategoryPieChart({ user }) { // Accept user as a prop
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast(); // Initialize toast for notifications

  // Function to fetch and process expense data for the chart
  const fetchData = useCallback(async () => {
    if (!user?.id) {
      // If no user is logged in, clear data and stop loading
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true); // Set loading true when starting fetch
    try {
      // Fetch expenses and join with categories to get category names
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('amount, categories(name)') // Select amount and category name via join
        .eq('user_id', user.id); // Filter expenses by current user

      if (error) {
        console.error('Error fetching expenses for pie chart:', error);
        toast({
          title: "Error loading chart data",
          description: `Failed to fetch expenses: ${error.message}`,
          variant: "destructive",
        });
        setData([]); // Clear data on error
        return;
      }

      // Group expenses by category name and sum their amounts
      const categoryMap = {};
      expenses.forEach((exp) => {
        // Use the category name from the joined table, default to 'Uncategorized' if null
        const categoryName = exp.categories?.name || 'Uncategorized';
        categoryMap[categoryName] = (categoryMap[categoryName] || 0) + Number(exp.amount);
      });

      // Transform the grouped data into the format expected by Recharts
      const chartData = Object.keys(categoryMap).map((catName) => ({
        name: catName,
        value: categoryMap[catName],
      }));

      setData(chartData); // Set the processed data
    } catch (err) {
      console.error('Unexpected error in CategoryPieChart fetchData:', err);
      toast({
        title: "Unexpected error",
        description: `An unexpected error occurred while preparing chart data: ${err.message}`,
        variant: "destructive",
      });
      setData([]); // Clear data on unexpected error
    } finally {
      setLoading(false); // Always set loading to false after operation
    }
  }, [user?.id, toast]); // Re-run fetchData if user ID or toast object changes

  // Effect to load data and set up real-time subscriptions
  useEffect(() => {
    fetchData(); // Initial data load

    // Set up real-time subscription for expense changes
    // This ensures the chart updates automatically when new expenses are added or changed
    const expensesChannel = supabase
      .channel('category-pie-chart-expenses-changes')
      .on("postgres_changes", {
        event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
        schema: "public",
        table: "expenses",
        filter: `user_id=eq.${user?.id}` // Filter changes relevant to the current user
      }, () => {
        console.log("Real-time update detected for expenses (CategoryPieChart).");
        fetchData(); // Re-fetch data on change
      })
      .subscribe();

    // Set up real-time subscription for category changes
    // This ensures the chart updates if category names change or categories are added/removed
    const categoriesChannel = supabase
      .channel('category-pie-chart-categories-changes')
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "categories",
        filter: `user_id=eq.${user?.id}` // Filter changes relevant to the current user
      }, () => {
        console.log("Real-time update detected for categories (CategoryPieChart).");
        fetchData(); // Re-fetch data on change
      })
      .subscribe();

    // Cleanup function: Unsubscribe from channels when the component unmounts
    return () => {
      if (expensesChannel) supabase.removeChannel(expensesChannel);
      if (categoriesChannel) supabase.removeChannel(categoriesChannel);
    };
  }, [user?.id, fetchData]); // Re-run effect if user ID or fetchData function changes

  // Custom tooltip content for the pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      return (
        <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg text-zinc-100 text-sm">
          <p className="font-semibold">{name}</p>
          <p className="text-zinc-300">Amount: {formatCurrency(value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-lg h-full"> {/* Ensure card takes full height if needed */}
      <CardHeader>
        <CardTitle className="text-white text-lg">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-60px)] flex flex-col justify-center items-center"> {/* Adjusted height for content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-50 mb-4"></div>
            <p className="text-zinc-400">Loading chart...</p>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius="80%"
                innerRadius="50%" // Creates a donut chart
                paddingAngle={3} // Adds spacing between slices
                cornerRadius={5} // Adds rounded corners to slices
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip />} // Use the custom tooltip component
                // Removed redundant inline contentStyle as it's now handled by CustomTooltip
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-zinc-400 text-center text-sm py-4">No expense data available for the chart.</p>
        )}
      </CardContent>
    </Card>
  );
}
