import { motion } from "framer-motion";
import { LogoDecoration } from "./LogoDecoration";

type Testimonial = {
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
};

export function TestimonialsSection() {
  const testimonials: Testimonial[] = [
    {
      name: "Sarah Chen",
      role: "Merchant",
      company: "TechStore",
      content: "TigerPayX has revolutionized how we accept payments. The low fees and instant settlement have saved us thousands in transaction costs.",
      avatar: "👩‍💼",
    },
    {
      name: "Marcus Johnson",
      role: "Individual User",
      company: "Freelancer",
      content: "As someone who sends money internationally, TigerPayX's low fees are a game-changer. Plus, the RoaR Score helped me get better lending rates!",
      avatar: "👨‍💻",
    },
    {
      name: "Emily Rodriguez",
      role: "Business Owner",
      company: "E-commerce",
      content: "The speed and reliability of TigerPayX is unmatched. Our customers love the instant payment confirmation, and we love the cost savings.",
      avatar: "👩‍💼",
    },
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-orange-50/30 via-white to-amber-50/20 py-24 lg:py-32 border-t border-orange-100 relative overflow-hidden">
      {/* Logo decorations */}
      <LogoDecoration size={140} opacity={0.06} className="top-20 left-10" />
      <LogoDecoration size={100} opacity={0.05} className="bottom-20 right-16" />
      
      <div className="max-width relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-gray-700 font-medium mb-4">
            Testimonials
          </p>
          <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl text-gray-900 mb-4">
            Loved by merchants and individuals
          </h2>
          <p className="max-w-2xl mx-auto text-base text-gray-700">
            See what our early users are saying about TigerPayX.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass-panel p-6 lg:p-8 space-y-4"
            >
              <div className="flex items-center gap-1 text-orange-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + i * 0.1 }}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>
              
              <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-orange-100">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-200 to-orange-100 flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">
                    {testimonial.role} • {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

