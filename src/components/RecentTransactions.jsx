// src/components/RecentTransactionsCard.jsx
import React, { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useUser } from "@supabase/auth-helpers-react"
import { Card } from "@/components/ui/card"
import { ArrowDownCircle, Calendar } from "lucide-react"
import { format } from "date-fns"

export default function RecentTransactionsCard() {
  const user = useUser()
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    if (!user) return

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(5)

      if (!error) setTransactions(data)
    }

    fetchTransactions()

    // Real-time subscription
    const channel = supabase
      .channel("expenses-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses", filter: `user_id=eq.${user.id}` },
        (payload) => {
          fetchTransactions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-800 rounded-2xl shadow-lg p-5">
      <h2 className="text-lg font-semibold text-white mb-4">Recent Transactions</h2>

      {transactions.length === 0 ? (
        <p className="text-zinc-400 text-sm">No transactions yet</p>
      ) : (
        <ul className="space-y-4">
          {transactions.map((tx) => (
            <li
              key={tx.id}
              className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-none"
            >
              <div>
                <p className="text-white font-medium">{tx.title}</p>
                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                  <Calendar size={14} />
                  {format(new Date(tx.date), "dd MMM yyyy")}
                  <span className="ml-2">• {tx.category || "Uncategorized"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="text-red-400" size={18} />
                <span className="text-red-400 font-semibold">
                  ₹{Number(tx.amount).toLocaleString("en-IN")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
