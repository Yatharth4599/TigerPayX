// Enhanced transaction item component

import { motion } from "framer-motion";
import Link from "next/link";
import type { Transaction } from "@/shared/types";

interface TransactionItemProps {
  transaction: Transaction;
  index?: number;
}

export function TransactionItem({ transaction, index = 0 }: TransactionItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "pending":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "failed":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-zinc-400 bg-zinc-500/10 border-zinc-500/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "send":
        return "↗";
      case "swap":
        return "⇄";
      case "pay":
        return "💳";
      default:
        return "•";
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "—";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const explorerUrl = `https://explorer.solana.com/tx/${transaction.txHash}?cluster=devnet`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[#0a0d0f] border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ff6b00]/20 to-orange-600/20 flex items-center justify-center text-xl">
            {getTypeIcon(transaction.type)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold capitalize">{transaction.type}</p>
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                {transaction.status}
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              {transaction.token} {parseFloat(transaction.amount).toLocaleString()}
            </p>
            {transaction.description && (
              <p className="text-xs text-zinc-500 mt-1">{transaction.description}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">
            {new Date(transaction.createdAt).toLocaleDateString()}
          </p>
          {transaction.txHash && (
            <Link
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#ff6b00] hover:text-orange-400 mt-1 inline-block"
            >
              View on Explorer →
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

