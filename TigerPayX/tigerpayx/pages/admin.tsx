import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Stats {
  users: {
    total: number;
    verified: number;
    withWallet: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
  };
  transactions: {
    total: number;
    totalVolume: string;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byType: {
      send: number;
      swap: number;
      pay: number;
    };
    byToken: Record<string, number>;
  };
  merchants: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  payLinks: {
    total: number;
    paid: number;
    pending: number;
    expired: number;
    totalVolume: string;
  };
}

interface User {
  id: string;
  email: string;
  name: string | null;
  handle: string | null;
  emailVerified: boolean;
  solanaAddress: string | null;
  createdAt: Date;
  transactionCount: number;
  merchantCount: number;
}

interface Transaction {
  id: string;
  type: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  token: string;
  txHash: string;
  status: string;
  description: string | null;
  createdAt: Date;
  user: {
    email: string;
    name: string | null;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "transactions">("overview");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (activeTab === "overview") {
        const statsRes = await fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (statsRes.status === 403) {
          const errorData = await statsRes.json().catch(() => ({}));
          setError(errorData.error || "You don't have admin access. Please contact an administrator.");
          return;
        }

        if (!statsRes.ok) {
          const errorData = await statsRes.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch stats");
        }

        const statsData = await statsRes.json();
        setStats(statsData);
      } else if (activeTab === "users") {
        const usersRes = await fetch("/api/admin/users?page=1&limit=100", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (usersRes.status === 403) {
          const errorData = await usersRes.json().catch(() => ({}));
          setError(errorData.error || "You don't have admin access. Please contact an administrator.");
          return;
        }

        if (!usersRes.ok) {
          const errorData = await usersRes.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch users");
        }

        const usersData = await usersRes.json();
        setUsers(usersData.users);
      } else if (activeTab === "transactions") {
        const txRes = await fetch("/api/admin/transactions?page=1&limit=100", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (txRes.status === 403) {
          const errorData = await txRes.json().catch(() => ({}));
          setError(errorData.error || "You don't have admin access. Please contact an administrator.");
          return;
        }

        if (!txRes.ok) {
          const errorData = await txRes.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch transactions");
        }

        const txData = await txRes.json();
        setTransactions(txData.transactions);
      }
    } catch (err: any) {
      console.error("Error fetching admin data:", err);
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  const formatAmount = (amount: string, token: string) => {
    const num = parseFloat(amount);
    return `${num.toLocaleString()} ${token}`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Access Denied</h1>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-[#ff6b00] text-black rounded-lg hover:bg-orange-500"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2 px-4 ${
              activeTab === "overview"
                ? "border-b-2 border-[#ff6b00] text-[#ff6b00]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-2 px-4 ${
              activeTab === "users"
                ? "border-b-2 border-[#ff6b00] text-[#ff6b00]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`pb-2 px-4 ${
              activeTab === "transactions"
                ? "border-b-2 border-[#ff6b00] text-[#ff6b00]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Transactions
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {activeTab === "overview" && stats && (
              <div className="space-y-6">
                {/* User Stats */}
                <div className="bg-zinc-900 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Users</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard label="Total Users" value={stats.users.total} />
                    <StatCard label="Verified" value={stats.users.verified} />
                    <StatCard label="With Wallet" value={stats.users.withWallet} />
                    <StatCard label="New Today" value={stats.users.newToday} />
                    <StatCard label="New This Week" value={stats.users.newThisWeek} />
                    <StatCard label="New This Month" value={stats.users.newThisMonth} />
                  </div>
                </div>

                {/* Transaction Stats */}
                <div className="bg-zinc-900 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Transactions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    <StatCard label="Total" value={stats.transactions.total} />
                    <StatCard label="Today" value={stats.transactions.today} />
                    <StatCard label="This Week" value={stats.transactions.thisWeek} />
                    <StatCard label="This Month" value={stats.transactions.thisMonth} />
                  </div>
                  <div className="mt-4">
                    <p className="text-zinc-400 mb-2">Total Volume: <span className="text-white font-semibold">{stats.transactions.totalVolume}</span></p>
                    <div className="flex gap-4 flex-wrap">
                      <div>
                        <span className="text-zinc-400">By Type: </span>
                        <span className="text-white">Send: {stats.transactions.byType.send}, Swap: {stats.transactions.byType.swap}, Pay: {stats.transactions.byType.pay}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Merchant Stats */}
                <div className="bg-zinc-900 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Merchants</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <StatCard label="Total" value={stats.merchants.total} />
                    <StatCard label="Active" value={stats.merchants.active} />
                    <StatCard label="New This Month" value={stats.merchants.newThisMonth} />
                  </div>
                </div>

                {/* PayLink Stats */}
                <div className="bg-zinc-900 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">PayLinks</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <StatCard label="Total" value={stats.payLinks.total} />
                    <StatCard label="Paid" value={stats.payLinks.paid} />
                    <StatCard label="Pending" value={stats.payLinks.pending} />
                    <StatCard label="Expired" value={stats.payLinks.expired} />
                  </div>
                  <p className="text-zinc-400">Total Volume: <span className="text-white font-semibold">{stats.payLinks.totalVolume}</span></p>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="bg-zinc-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">All Users ({users.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-700">
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Handle</th>
                        <th className="text-left p-3">Verified</th>
                        <th className="text-left p-3">Wallet</th>
                        <th className="text-left p-3">Transactions</th>
                        <th className="text-left p-3">Merchants</th>
                        <th className="text-left p-3">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                          <td className="p-3">{user.email}</td>
                          <td className="p-3">{user.name || "-"}</td>
                          <td className="p-3">{user.handle || "-"}</td>
                          <td className="p-3">
                            {user.emailVerified ? (
                              <span className="text-green-400">✓</span>
                            ) : (
                              <span className="text-red-400">✗</span>
                            )}
                          </td>
                          <td className="p-3">
                            {user.solanaAddress ? (
                              <span className="text-green-400">✓</span>
                            ) : (
                              <span className="text-red-400">✗</span>
                            )}
                          </td>
                          <td className="p-3">{user.transactionCount}</td>
                          <td className="p-3">{user.merchantCount}</td>
                          <td className="p-3 text-sm text-zinc-400">{formatDate(user.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="bg-zinc-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">All Transactions ({transactions.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-700">
                        <th className="text-left p-3">User</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Amount</th>
                        <th className="text-left p-3">Token</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">From</th>
                        <th className="text-left p-3">To</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Tx Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                          <td className="p-3">{tx.user.email}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              tx.type === "send" ? "bg-blue-500/20 text-blue-400" :
                              tx.type === "swap" ? "bg-purple-500/20 text-purple-400" :
                              "bg-green-500/20 text-green-400"
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-3">{formatAmount(tx.amount, tx.token)}</td>
                          <td className="p-3">{tx.token}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              tx.status === "confirmed" ? "bg-green-500/20 text-green-400" :
                              tx.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-red-500/20 text-red-400"
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-3 text-xs font-mono text-zinc-400">
                            {tx.fromAddress.slice(0, 8)}...{tx.fromAddress.slice(-6)}
                          </td>
                          <td className="p-3 text-xs font-mono text-zinc-400">
                            {tx.toAddress.slice(0, 8)}...{tx.toAddress.slice(-6)}
                          </td>
                          <td className="p-3 text-sm text-zinc-400">{formatDate(tx.createdAt)}</td>
                          <td className="p-3">
                            <a
                              href={`https://solscan.io/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#ff6b00] hover:underline text-xs"
                            >
                              View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-zinc-800 rounded-lg p-4">
      <p className="text-zinc-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  );
}

