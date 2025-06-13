
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const stats = [
  {
    value: "$2.5T+",
    label: "Daily Trading Volume",
    description: "Massive liquidity across all markets",
    color: "text-electric-400"
  },
  {
    value: "500K+",
    label: "Active Traders",
    description: "Growing community of investors",
    color: "text-neon-400"
  },
  {
    value: "50+",
    label: "Global Markets",
    description: "Access to worldwide opportunities",
    color: "text-purple-400"
  },
  {
    value: "99.9%",
    label: "Platform Uptime",
    description: "Reliable and secure trading",
    color: "text-electric-400"
  },
  {
    value: "24/7",
    label: "Customer Support",
    description: "Always here when you need us",
    color: "text-neon-400"
  },
  {
    value: "0.01s",
    label: "Average Execution",
    description: "Lightning-fast order processing",
    color: "text-purple-400"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const StatsSection = () => {
  return (
    <section className="py-20 px-4 relative" id="stats">
      <div className="absolute inset-0 bg-gradient-to-r from-electric-900/10 via-purple-900/10 to-neon-900/10"></div>
      
      <div className="container mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Trusted by <span className="gradient-text">Millions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the fastest-growing trading platform with industry-leading performance and reliability.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 300 }
              }}
            >
              <Card className="trading-card text-center group">
                <div className="p-6">
                  <motion.div 
                    className={`text-4xl md:text-5xl font-bold mb-2 ${stat.color}`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 10
                    }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-lg font-semibold mb-2">{stat.label}</div>
                  <div className="text-muted-foreground text-sm">{stat.description}</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
