
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, ChartBar, ChartLine } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: TrendingUp,
    title: "Advanced Analytics",
    description: "Real-time market data with advanced charting tools and technical indicators to make informed decisions.",
    gradient: "from-electric-500 to-electric-600"
  },
  {
    icon: DollarSign,
    title: "Zero Commission",
    description: "Trade stocks, ETFs, and options with zero commission fees. Keep more of your profits.",
    gradient: "from-neon-500 to-neon-600"
  },
  {
    icon: ChartBar,
    title: "Portfolio Management",
    description: "Track your investments with comprehensive portfolio analytics and performance metrics.",
    gradient: "from-purple-500 to-purple-600"
  },
  {
    icon: ChartLine,
    title: "Market Research",
    description: "Access institutional-grade research reports and market insights from industry experts.",
    gradient: "from-electric-400 to-purple-500"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const FeaturesSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Why Choose <span className="gradient-text">DarkBloom</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the next generation of trading with our cutting-edge platform designed for modern investors.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 300 }
              }}
            >
              <Card className="trading-card group">
                <CardHeader className="text-center">
                  <motion.div 
                    className={`inline-flex w-16 h-16 rounded-full bg-gradient-to-br ${feature.gradient} items-center justify-center mb-4 mx-auto`}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 5,
                      transition: { type: "spring", stiffness: 400 }
                    }}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
