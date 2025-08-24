import React, { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { format, parseISO, startOfWeek, endOfWeek, isToday, isWithinInterval } from "date-fns";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  AlertCircle,
  Download,
  SortAsc,
  SortDesc,
  Loader2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"; // Ensure you have this component
import { Label } from "@/components/ui/label"; // Ensure you have this component
import { Textarea } from "@/components/ui/textarea"; // Ensure you have this component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Ensure you have this component
import FloatingParticles from "@/components/FloatingParticles";


function formatCurrency(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(n));
}

// === Framer Motion Variants ===

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

// ==============================

export default function Expenses() {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    category_id: "",
    description: "",
    payment_method: "cash",
    location: "",
    tags: []
  });

  const userId = user?.id;

  const loadExpenses = useCallback(async () => {
    if (!userId) {
      setExpenses([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(`
          id, title, description, amount, date, payment_method, location, tags,
          categories (id, name, color, icon)
        `)
        .eq("user_id", userId)
        .order(sortBy, { ascending: sortOrder === "asc" });
      if (error) {
        toast({
          title: "Error loading expenses",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      setExpenses(data || []);
    } catch (err) {
      toast({
        title: "Unexpected error",
        description: `An unexpected error occurred: ${err.message}`,
        variant: "destructive",
      });
    }
  }, [userId, sortBy, sortOrder, toast]);

  const loadCategories = useCallback(async () => {
    if (!userId) {
      setCategories([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, description, color, icon")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) {
        toast({
          title: "Error loading categories",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      setCategories(data || []);
    } catch (err) {
      toast({
        title: "Unexpected error",
        description: `An unexpected error occurred: ${err.message}`,
        variant: "destructive",
      });
    }
  }, [userId, toast]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadExpenses(), loadCategories()]);
    setLoading(false);
  }, [loadExpenses, loadCategories]);

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) console.error("Auth error:", error);
        if (mounted) {
          setUser(session?.user || null);
          setAuthLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setUser(null);
          setAuthLoading(false);
        }
      }
    };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setUser(session?.user || null);
          setAuthLoading(false);
        }
      }
    );
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    loadAll();
    const channel = supabase
      .channel(`expenses_${user.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "expenses",
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log("Real-time update received for expenses:", payload);
        loadExpenses();
      })
      .subscribe((status) => {
        console.log("Expenses subscription status:", status);
      });
    return () => {
      console.log("Cleaning up expenses subscription");
      supabase.removeChannel(channel);
    };
  }, [user, authLoading, sortBy, sortOrder, loadAll, loadExpenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.categories?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || expense.categories?.id === selectedCategory;
      const matchesPayment = !paymentMethodFilter || expense.payment_method === paymentMethodFilter;
      let matchesDate = true;
      if (dateRange) {
        const expenseDate = parseISO(expense.date);
        const today = new Date();
        switch (dateRange) {
          case "today":
            matchesDate = isToday(expenseDate);
            break;
          case "week":
            matchesDate = isWithinInterval(expenseDate, { start: startOfWeek(today), end: endOfWeek(today) });
            break;
          case "month":
            matchesDate = format(expenseDate, 'yyyy-MM') === format(today, 'yyyy-MM');
            break;
          case "quarter":
            const quarter = Math.floor(today.getMonth() / 3);
            const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
            const quarterEnd = new Date(today.getFullYear(), quarter * 3 + 3, 0);
            matchesDate = isWithinInterval(expenseDate, { start: quarterStart, end: quarterEnd });
            break;
        }
      }
      return matchesSearch && matchesCategory && matchesPayment && matchesDate;
    });
  }, [expenses, searchTerm, selectedCategory, dateRange, paymentMethodFilter]);

  const totalPages = useMemo(() => Math.ceil(filteredExpenses.length / itemsPerPage), [filteredExpenses, itemsPerPage]);
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExpenses, currentPage, itemsPerPage]);

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      amount: "",
      date: format(new Date(), "yyyy-MM-dd"),
      category_id: "",
      description: "",
      payment_method: "cash",
      location: "",
      tags: []
    });
  }, []);

  const handleAddExpense = useCallback(async (e) => {
    e.preventDefault();
    if (!userId || !formData.title.trim() || !formData.amount || !formData.category_id) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields (Title, Amount, Date, Category).",
        variant: "destructive",
      });
      return;
    }
    const parsed = parseFloat(formData.amount);
    if (Number.isNaN(parsed) || parsed <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be a positive number.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        user_id: userId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        amount: parsed,
        date: formData.date,
        category_id: formData.category_id,
        payment_method: formData.payment_method,
        location: formData.location.trim() || null,
        tags: formData.tags.length > 0 ? formData.tags : null
      };
      const { error } = await supabase.from("expenses").insert([payload]);
      if (error) {
        toast({
          title: "Failed to Add Expense",
          description: error.message,
          variant: "destructive",
        });
      } else {
        resetForm();
        setShowAddModal(false);
        toast({
          title: "Expense Added! 🎉",
          description: `"${payload.title}" for ${formatCurrency(payload.amount)} was successfully added.`,
          variant: "success",
        });
        await loadExpenses();
      }
    } catch (err) {
      toast({
        title: "Unexpected Error",
        description: `An unexpected error occurred: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }, [formData, userId, resetForm, toast, loadExpenses]);

  const handleEditExpense = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedExpense || !formData.title.trim() || !formData.amount || !formData.category_id) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields (Title, Amount, Date, Category).",
        variant: "destructive",
      });
      return;
    }
    const parsed = parseFloat(formData.amount);
    if (Number.isNaN(parsed) || parsed <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be a positive number.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        amount: parsed,
        date: formData.date,
        category_id: formData.category_id,
        payment_method: formData.payment_method,
        location: formData.location.trim() || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase
        .from("expenses")
        .update(payload)
        .eq("id", selectedExpense.id)
        .eq("user_id", userId);
      if (error) {
        toast({
          title: "Failed to Update Expense",
          description: error.message,
          variant: "destructive",
        });
      } else {
        resetForm();
        setShowEditModal(false);
        setSelectedExpense(null);
        toast({
          title: "Expense Updated! ✨",
          description: `"${payload.title}" was successfully updated.`,
          variant: "success",
        });
        await loadExpenses();
      }
    } catch (err) {
      toast({
        title: "Unexpected Error",
        description: `An unexpected error occurred: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }, [formData, selectedExpense, userId, resetForm, toast, loadExpenses]);

  const handleDeleteExpense = useCallback(async () => {
    // This function is now handled directly in the Delete Modal
    // The actual deletion logic is in the modal's onClick handler
  }, []);

  const openEditModal = useCallback((expense) => {
    setSelectedExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      date: expense.date,
      category_id: expense.categories?.id || "",
      description: expense.description || "",
      payment_method: expense.payment_method || "cash",
      location: expense.location || "",
      tags: expense.tags || []
    });
    setShowEditModal(true);
  }, []);

  const openDeleteModal = useCallback((expense) => {
    setSelectedExpense(expense);
    setShowDeleteModal(true);
  }, []);

  const paymentMethodIcons = useMemo(() => ({
    cash: "💰",
    credit_card: "💳",
    debit_card: "💳",
    bank_transfer: "🏦",
    digital_wallet: "📱"
  }), []);

  const paymentMethodLabels = useMemo(() => ({
    cash: "Cash",
    credit_card: "Credit Card",
    debit_card: "Debit Card",
    bank_transfer: "Bank Transfer",
    digital_wallet: "Digital Wallet"
  }), []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-50 mx-auto mb-4"></div>
          <div className="text-zinc-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader className="text-center">
            <CardTitle className="text-zinc-50">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-zinc-400">
              Please sign in to view your expenses.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
    
      <div className="flex min-h-screen bg-zinc-950">
        <div className="w-full mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header with Animation */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
            variants={headerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-zinc-50">
                Expenses
              </h1>
              <p className="text-zinc-400 mt-1">
                View and manage all your expenses
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => {
                resetForm();
                setShowAddModal(true);
              }} className="bg-zinc-50 hover:bg-zinc-200 text-zinc-900">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </motion.div>

          {/* Filters */}
          <Card className="mb-6 bg-gradient-to-br from-zinc-950 to-zinc-900  border-zinc-800">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                    <Input
                      placeholder="Search expenses, categories, descriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100 w-full"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:ring-2 focus:ring-zinc-50 focus:border-transparent outline-none w-full"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:ring-2 focus:ring-zinc-50 focus:border-transparent outline-none w-full"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:ring-2 focus:ring-zinc-50 focus:border-transparent outline-none w-full"
                >
                  <option value="">All Methods</option>
                  {Object.entries(paymentMethodLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
            variants={cardContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={cardItemVariants}>
              <Card className="bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-400 text-sm">Total Expenses</p>
                      <p className="text-2xl font-bold text-zinc-50">
                        {formatCurrency(filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0))}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardItemVariants}>
              <Card className="bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-400 text-sm">Transactions</p>
                      <p className="text-2xl font-bold text-zinc-50">{filteredExpenses.length}</p>
                    </div>
                    <CreditCard className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardItemVariants}>
              <Card className="bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
              
                    <div>
                      <p className="text-zinc-400 text-sm">Average Amount</p>
                      <p className="text-2xl font-bold text-zinc-50">
                        {formatCurrency(filteredExpenses.length > 0
                          ? filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0) / filteredExpenses.length
                          : 0)}
                      </p>
                    </div>
                    <Tag className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Expenses List */}
          <Card className="bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-3 sm:gap-2">
              <CardTitle className="text-zinc-50">
                {filteredExpenses.length} Expenses
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(1);
                    setSortBy("date");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                  className="text-zinc-400 hover:text-zinc-50"
                >
                  Date
                  {sortBy === "date" && (sortOrder === "asc" ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" />)}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(1);
                    setSortBy("amount");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                  className="text-zinc-400 hover:text-zinc-50"
                >
                  Amount
                  {sortBy === "amount" && (sortOrder === "asc" ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" />)}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-50"></div>
                </div>
              ) : paginatedExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-6 w-6 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-50 mb-2">No expenses found</h3>
                  <p className="text-zinc-400 mb-4">
                    {searchTerm || selectedCategory || dateRange || paymentMethodFilter ?
                      "Try adjusting your filters to see more results." :
                      "Start tracking your expenses by adding your first transaction."
                    }
                  </p>
                  {!searchTerm && !selectedCategory && !dateRange && !paymentMethodFilter && (
                    <Button onClick={() => {
                      resetForm();
                      setShowAddModal(true);
                    }} className="bg-zinc-50 text-zinc-900">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Expense
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <motion.div
                    className="space-y-4"
                    variants={cardContainerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {paginatedExpenses.map((expense) => (
                      <motion.div
                        key={expense.id}
                        variants={cardItemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-br from-zinc-950 to-zinc-900 rounded-lg border border-zinc-700">
                          <FloatingParticles/>
                          <div className="flex items-center gap-4 flex-1 mb-3 sm:mb-0">
                            <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                              {expense.categories?.icon || "💰"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                                <h4 className="font-medium text-zinc-50 truncate">{expense.title}</h4>
                                <Badge variant="secondary" className="bg-zinc-700 text-zinc-300 text-xs flex-shrink-0">
                                  {expense.categories?.name || "Uncategorized"}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(parseISO(expense.date), "MMM dd, yyyy")}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span>{paymentMethodIcons[expense.payment_method] || "💰"}</span>
                                  {paymentMethodLabels[expense.payment_method] || "Cash"}
                                </span>
                                {expense.location && (
                                  <span className="flex items-center gap-1 truncate">
                                    📍 {expense.location}
                                  </span>
                                )}
                              </div>
                              {expense.description && (
                                <p className="text-sm text-zinc-500 mt-1 line-clamp-1">{expense.description}</p>
                              )}
                              {expense.tags && expense.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {expense.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-3 sm:mt-0">
                            <div className="text-right flex-shrink-0">
                              <div className="font-semibold text-red-400 text-lg">
                                -{formatCurrency(expense.amount)}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(expense)}
                                className="text-zinc-400 hover:text-blue-400 p-1"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteModal(expense)}
                                className="text-zinc-400 hover:text-red-400 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3">
                      <div className="text-sm text-zinc-400 text-center sm:text-left">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} expenses
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                          disabled={currentPage === 1}
                          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
                        >
                          Previous
                        </Button>
                        <span className="text-zinc-400 px-2">
                          {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                          disabled={currentPage === totalPages}
                          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-zinc-50 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Fill in the details for your new expense.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-title" className="text-right text-zinc-300">
                Title
              </Label>
              <Input
                id="add-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="col-span-3 bg-zinc-800 text-zinc-50 border-zinc-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-amount" className="text-right text-zinc-300">
                Amount
              </Label>
              <Input
                id="add-amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="col-span-3 bg-zinc-800 text-zinc-50 border-zinc-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-date" className="text-right text-zinc-300">
                Date
              </Label>
              <Input
                id="add-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="col-span-3 bg-zinc-800 text-zinc-50 border-zinc-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-category" className="text-right text-zinc-300">
                Category
              </Label>
              <Select
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                value={formData.category_id}
                required
              >
                <SelectTrigger className="col-span-3 bg-zinc-800 text-zinc-50 border-zinc-700">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 text-zinc-50 border-zinc-800">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-payment_method" className="text-right text-zinc-300">
                Payment
              </Label>
              <Select
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                value={formData.payment_method}
              >
                <SelectTrigger className="col-span-3 bg-zinc-800 text-zinc-50 border-zinc-700">
                  <SelectValue placeholder="Select a payment method" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 text-zinc-50 border-zinc-800">
                  {Object.entries(paymentMethodLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-description" className="text-right text-zinc-300">
                Description
              </Label>
              <Textarea
                id="add-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3 bg-zinc-800 text-zinc-50 border-zinc-700"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddModal(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-zinc-50 text-zinc-900 hover:bg-zinc-200">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Expense"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-zinc-50 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update the details for this expense.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditExpense} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right text-zinc-300">
                Title
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="col-span-3 bg-zinc-800 text-zinc-50 border-zinc-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-amount" className="text-right text-zinc-300">
                Amount
              </Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="col-span-3 bg-zinc-800 text-zinc-50 border-zinc-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-date" className="text-right text-zinc-300">
                Date
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="col-span-3 bg-zinc-800 text-zinc-50 border-zinc-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right text-zinc-300">
                Category
              </Label>
              <Select
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                value={formData.category_id}
                required
              >
                <SelectTrigger className="col-span-3 bg-zinc-800 text-zinc-50 border-zinc-700">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 text-zinc-50 border-zinc-800">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-payment_method" className="text-right text-zinc-300">
                Payment
              </Label>
              <Select
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                value={formData.payment_method}
              >
                <SelectTrigger className="col-span-3 bg-zinc-800 text-zinc-50 border-zinc-700">
                  <SelectValue placeholder="Select a payment method" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 text-zinc-50 border-zinc-800">
                  {Object.entries(paymentMethodLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right text-zinc-300">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3 bg-zinc-800 text-zinc-50 border-zinc-700"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedExpense(null);
                  resetForm();
                }}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-zinc-50 text-zinc-900 hover:bg-zinc-200">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Expense"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-zinc-50 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              Delete Expense
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="py-4">
              <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center">
                    {selectedExpense.categories?.icon || "💰"}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-zinc-50">{selectedExpense.title}</h4>
                    <p className="text-sm text-zinc-400">
                      {selectedExpense.categories?.name} • {formatCurrency(selectedExpense.amount)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {format(parseISO(selectedExpense.date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedExpense(null);
              }}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (!selectedExpense) return;
                setSubmitting(true);
                try {
                  const { error } = await supabase
                    .from("expenses")
                    .delete()
                    .eq("id", selectedExpense.id)
                    .eq("user_id", userId);
                  
                  if (error) {
                    toast({
                      title: "Deletion Failed",
                      description: error.message,
                      variant: "destructive"
                    });
                  } else {
                    setShowDeleteModal(false);
                    setSelectedExpense(null);
                    toast({
                      title: "Expense Deleted!",
                      description: `"${selectedExpense.title}" was successfully removed.`,
                      variant: "success",
                    });
                    await loadExpenses();
                  }
                } catch (err) {
                  toast({
                    title: "Unexpected Error",
                    description: `An unexpected error occurred: ${err.message}`,
                    variant: "destructive"
                  });
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Expense"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}