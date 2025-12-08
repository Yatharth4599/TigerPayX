import { motion } from "framer-motion";

type ComparisonFeature = {
  feature: string;
  tigerPayX: string | boolean;
  traditionalBanks: string | boolean;
  otherCrypto: string | boolean;
};

export function ComparisonTable() {
  const features: ComparisonFeature[] = [
    {
      feature: "Transaction Fee",
      tigerPayX: "$0.00025",
      traditionalBanks: "$2-5",
      otherCrypto: "$1-10",
    },
    {
      feature: "Transaction Speed",
      tigerPayX: "400ms",
      traditionalBanks: "1-3 days",
      otherCrypto: "10min-1hr",
    },
    {
      feature: "Global Access",
      tigerPayX: true,
      traditionalBanks: false,
      otherCrypto: true,
    },
    {
      feature: "Decentralized Lending",
      tigerPayX: true,
      traditionalBanks: false,
      otherCrypto: "Limited",
    },
    {
      feature: "Credit Score (RoaR)",
      tigerPayX: true,
      traditionalBanks: true,
      otherCrypto: false,
    },
    {
      feature: "Self-Custodial",
      tigerPayX: true,
      traditionalBanks: false,
      otherCrypto: "Varies",
    },
    {
      feature: "24/7 Availability",
      tigerPayX: true,
      traditionalBanks: false,
      otherCrypto: true,
    },
  ];

  const renderValue = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <span className="text-green-600 font-semibold">✓</span>
      ) : (
        <span className="text-gray-400">✗</span>
      );
    }
    return <span className="text-gray-700 font-medium">{value}</span>;
  };

  return (
    <section className="section-padding bg-gradient-to-b from-orange-50/30 via-white to-amber-50/20 py-24 lg:py-32 border-t border-orange-100 relative overflow-hidden">
      <div className="max-width relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-gray-700 font-medium mb-4">
            Comparison
          </p>
          <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl text-gray-900 mb-4">
            TigerPayX vs The Competition
          </h2>
          <p className="max-w-2xl mx-auto text-base text-gray-700">
            See how TigerPayX compares to traditional banks and other crypto solutions.
          </p>
        </motion.div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel overflow-hidden min-w-full"
          >
            <table className="w-full text-sm sm:text-base">
              <thead>
                <tr className="border-b border-orange-100">
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    Feature
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-[#ff6b00] bg-orange-50/50">
                    TigerPayX
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700">
                    Traditional Banks
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700">
                    Other Crypto
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="border-b border-orange-50 hover:bg-orange-50/30 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                      {feature.feature}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm bg-orange-50/30">
                      {renderValue(feature.tigerPayX)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm">
                      {renderValue(feature.traditionalBanks)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm">
                      {renderValue(feature.otherCrypto)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

