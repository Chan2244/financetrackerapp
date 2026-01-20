"use client";

import { createContext, useState, useEffect, useContext } from "react";

import { authContext } from "@/lib/store/auth-context";

// Firebase
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

export const financeContext = createContext({
  income: [],
  expenses: [],
  loading: false,
  error: null,
  addIncomeItem: async () => {},
  removeIncomeItem: async () => {},
  addExpenseItem: async () => {},
  addCategory: async () => {},
  deleteExpenseItem: async () => {},
  deleteExpenseCategory: async () => {},
});

export default function FinanceContextProvider({ children }) {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useContext(authContext);

  const addCategory = async (category) => {
    console.log("addCategory called with:", category);
    console.log("User:", user);

    if (!user) {
      console.error("No user found!");
      throw new Error("You must be logged in to add a category");
    }

    try {
      const collectionRef = collection(db, "expenses");
      console.log("Collection ref created");

      // Add timeout to detect hanging operations
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Operation timed out after 10 seconds. This usually means Firestore security rules are blocking the request.")), 10000)
      );

      const docSnap = await Promise.race([
        addDoc(collectionRef, {
          uid: user.uid,
          ...category,
          items: [],
        }),
        timeoutPromise
      ]);

      console.log("Category added to Firestore with ID:", docSnap.id);

      setExpenses((prevExpenses) => {
        const updated = [
          ...prevExpenses,
          {
            id: docSnap.id,
            uid: user.uid,
            items: [],
            ...category,
          },
        ];
        console.log("Expenses state updated:", updated);
        return updated;
      });
    } catch (error) {
      console.error("Error in addCategory:", error);
      throw error;
    }
  };

  const addExpenseItem = async (expenseCategoryId, newExpense) => {
    const docRef = doc(db, "expenses", expenseCategoryId);

    try {
      await updateDoc(docRef, { ...newExpense });

      // Update State
      setExpenses((prevState) => {
        const updatedExpenses = [...prevState];

        const foundIndex = updatedExpenses.findIndex((expense) => {
          return expense.id === expenseCategoryId;
        });

        updatedExpenses[foundIndex] = { id: expenseCategoryId, ...newExpense };

        return updatedExpenses;
      });
    } catch (error) {
      throw error;
    }
  };

  const deleteExpenseItem = async (updatedExpense, expenseCategoryId) => {
    try {
      const docRef = doc(db, "expenses", expenseCategoryId);
      await updateDoc(docRef, {
        ...updatedExpense,
      });
      setExpenses((prevExpenses) => {
        const updatedExpenses = [...prevExpenses];
        const pos = updatedExpenses.findIndex(
          (ex) => ex.id === expenseCategoryId
        );
        updatedExpenses[pos].items = [...updatedExpense.items];
        updatedExpenses[pos].total = updatedExpense.total;
        return updatedExpenses;
      });
    } catch (error) {
      throw error;
    }
  };

  const deleteExpenseCategory = async (expenseCategoryId) => {
    try {
      const docRef = doc(db, "expenses", expenseCategoryId);
      await deleteDoc(docRef);

      setExpenses((prevExpenses) => {
        const updatedExpenses = prevExpenses.filter(
          (expense) => expense.id !== expenseCategoryId
        );

        return [...updatedExpenses];
      });
    } catch (error) {
      throw error;
    }
  };

  const addIncomeItem = async (newIncome) => {
    console.log("addIncomeItem called with:", newIncome);
    console.log("User:", user);

    if (!user) {
      console.error("No user found!");
      throw new Error("You must be logged in to add income");
    }

    const collectionRef = collection(db, "income");
    console.log("Income collection ref created");

    try {
      // Add timeout to detect hanging operations
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Operation timed out after 10 seconds. This usually means Firestore security rules are blocking the request.")), 10000)
      );

      const docSnap = await Promise.race([
        addDoc(collectionRef, newIncome),
        timeoutPromise
      ]);
      console.log("Income added to Firestore with ID:", docSnap.id);

      // Update state
      setIncome((prevState) => {
        const updated = [
          ...prevState,
          {
            id: docSnap.id,
            ...newIncome,
            createdAt: newIncome.createdAt?.toDate ? newIncome.createdAt.toDate() : newIncome.createdAt,
          },
        ];
        console.log("Income state updated:", updated);
        return updated;
      });
    } catch (error) {
      console.error("Error in addIncomeItem:", error);
      throw error;
    }
  };
  const removeIncomeItem = async (incomeId) => {
    const docRef = doc(db, "income", incomeId);
    try {
      await deleteDoc(docRef);
      setIncome((prevState) => {
        return prevState.filter((i) => i.id !== incomeId);
      });
      // Update State
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  };

  const values = {
    income,
    expenses,
    loading,
    error,
    addIncomeItem,
    removeIncomeItem,
    addExpenseItem,
    addCategory,
    deleteExpenseItem,
    deleteExpenseCategory,
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      const startTime = performance.now();
      console.log("🔄 Starting to fetch financial data...");

      try {
        setLoading(true);
        setError(null);

        // Fetch income data
        console.log("📥 Fetching income data...");
        const incomeStart = performance.now();
        const incomeCollectionRef = collection(db, "income");
        const incomeQuery = query(incomeCollectionRef, where("uid", "==", user.uid));
        const incomeDocsSnap = await getDocs(incomeQuery);
        const incomeTime = performance.now() - incomeStart;
        console.log(`✅ Income fetched in ${incomeTime.toFixed(2)}ms (${incomeDocsSnap.docs.length} docs)`);

        const incomeData = incomeDocsSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          };
        });

        // Fetch expenses data
        console.log("📥 Fetching expenses data...");
        const expensesStart = performance.now();
        const expensesCollectionRef = collection(db, "expenses");
        const expensesQuery = query(expensesCollectionRef, where("uid", "==", user.uid));
        const expensesDocsSnap = await getDocs(expensesQuery);
        const expensesTime = performance.now() - expensesStart;
        console.log(`✅ Expenses fetched in ${expensesTime.toFixed(2)}ms (${expensesDocsSnap.docs.length} docs)`);

        const expensesData = expensesDocsSnap.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });

        // Only update state if component is still mounted
        if (isMounted) {
          setIncome(incomeData);
          setExpenses(expensesData);
          setLoading(false);
          const totalTime = performance.now() - startTime;
          console.log(`✅ All data loaded in ${totalTime.toFixed(2)}ms total`);
        }
      } catch (err) {
        if (isMounted) {
          console.error("❌ Error fetching financial data:", err);
          console.error("Error details:", {
            code: err.code,
            message: err.message,
            stack: err.stack
          });
          setError(err.message || "Failed to load financial data");
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <financeContext.Provider value={values}>{children}</financeContext.Provider>
  );
}