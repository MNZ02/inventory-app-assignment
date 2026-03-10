export type TransactionType = 'IN' | 'OUT'

export interface Transaction {
  id: string
  productId: string
  productName: string
  quantityChange: number
  type: TransactionType
  date: string
  performedBy: string
}

export type CreateTransactionInput = Omit<Transaction, 'id' | 'date' | 'productName'>
