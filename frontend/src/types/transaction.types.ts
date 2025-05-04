export interface Category {
    id: number;
    name: string;
    description: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
  }
  
  export interface Transaction {
    id?: number;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    created_at?: string;
    user_id?: number;
    category_id: number;
    category?: Category;
  }
  
  export interface FinancialSummary {
    period: string;
    income: number;
    expenses: number;
    balance: number;
    income_by_category: Record<string, number>;
    expense_by_category: Record<string, number>;
  }