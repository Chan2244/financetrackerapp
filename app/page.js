"use client";

import { useState, useContext, useMemo } from "react";
import { financeContext } from "@/lib/store/finance-context";
import { authContext } from "@/lib/store/auth-context";

import { currencyFormatter } from "@/lib/utils";

import ExpenseCategoryItem from "@/components/ExpenseCategoryItem";

import AddIncomeModal from "@/components/modals/AddIncomeModal";
import AddExpensesModal from "@/components/modals/AddExpensesModal";
import SignIn from "@/components/SignIn";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  const { expenses, income, loading, error } = useContext(financeContext);
  const { user } = useContext(authContext);

  const balance = useMemo(() => {
    const totalIncome = income.reduce((total, i) => total + (i.amount || 0), 0);
    const totalExpenses = expenses.reduce(
      (total, e) => total + (e.total || 0),
      0
    );
    return totalIncome - totalExpenses;
  }, [expenses, income]);

  if (!user) {
    return <SignIn />;
  }

  if (loading) {
    return (
      <main className="container max-w-2xl px-6 mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-xl">Loading your financial data...</div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container max-w-2xl px-6 mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-xl text-red-400">Error: {error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 btn btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Add Income Modal */}
      <AddIncomeModal
        show={showAddIncomeModal}
        onClose={setShowAddIncomeModal}
      />

      {/* Add Expenses Modal */}
      <AddExpensesModal
        show={showAddExpenseModal}
        onClose={setShowAddExpenseModal}
      />

      <main className="container max-w-2xl px-6 mx-auto">
        <section className="py-3">
          <small className="text-gray-400 text-md">My Balance</small>
          <h2 className="text-4xl font-bold">{currencyFormatter(balance)}</h2>
        </section>

        <section className="flex items-center gap-2 py-3">
          <button
            onClick={() => {
              setShowAddExpenseModal(true);
            }}
            className="btn btn-primary"
          >
            + Expenses
          </button>
          <button
            onClick={() => {
              setShowAddIncomeModal(true);
            }}
            className="btn btn-primary-outline"
          >
            + Income
          </button>
        </section>

        {/* Expenses */}
        <section className="py-6">
          <h3 className="text-2xl">My Expenses</h3>
          <div className="flex flex-col gap-4 mt-6">
            {expenses.map((expense) => {
              return <ExpenseCategoryItem key={expense.id} expense={expense} />;
            })}
          </div>
        </section>

        {/* Chart Section */}
        <section className="py-6">
          <a id="stats" />
          <h3 className="text-2xl">Stats</h3>
          <div className="w-1/2 mx-auto" style={{ maxWidth: '400px', height: '400px' }}>
            <Doughnut
              data={{
                labels: expenses.map((expense) => expense.title),
                datasets: [
                  {
                    label: "Expenses",
                    data: expenses.map((expense) => expense.total),
                    backgroundColor: expenses.map((expense) => expense.color),
                    borderColor: ["#18181b"],
                    borderWidth: 5,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: true,
                responsive: true,
              }}
            />
          </div>
        </section>
      </main>
    </>
  );
}