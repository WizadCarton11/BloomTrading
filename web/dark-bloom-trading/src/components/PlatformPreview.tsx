
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const PlatformPreview = () => {
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
            Professional Trading <span className="gradient-text">Interface</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience our intuitive trading platform with real-time data and advanced tools.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Card className="trading-card p-8">
              {/* Mock trading interface */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Watchlist */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h3 className="text-lg font-semibold text-electric-400 mb-4">Watchlist</h3>
                  {[
                    { symbol: "AAPL", price: "$182.52", change: "+2.4%", trend: "up" },
                    { symbol: "TSLA", price: "$248.50", change: "-1.2%", trend: "down" },
                    { symbol: "NVDA", price: "$455.98", change: "+5.8%", trend: "up" },
                    { symbol: "MSFT", price: "$384.30", change: "+1.1%", trend: "up" }
                  ].map((stock, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-white/5"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                    >
                      <div>
                        <div className="font-semibold">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">{stock.price}</div>
                      </div>
                      <div className={`flex items-center gap-1 ${stock.trend === 'up' ? 'text-neon-400' : 'text-red-400'}`}>
                        {stock.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="text-sm font-medium">{stock.change}</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Chart Area */}
                <motion.div 
                  className="lg:col-span-2"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">AAPL - Apple Inc.</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-electric-500/30 text-electric-400">1D</Button>
                      <Button variant="outline" size="sm" className="border-electric-500/30 text-electric-400 bg-electric-500/10">1W</Button>
                      <Button variant="outline" size="sm" className="border-electric-500/30 text-electric-400">1M</Button>
                      <Button variant="outline" size="sm" className="border-electric-500/30 text-electric-400">1Y</Button>
                    </div>
                  </div>
                  
                  {/* Mock chart */}
                  <motion.div 
                    className="h-64 rounded-lg gradient-bg border border-white/10 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ 
                          rotateY: [0, 360],
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <TrendingUp className="h-16 w-16 text-electric-400 mx-auto mb-4 opacity-50" />
                      </motion.div>
                      <p className="text-muted-foreground">Interactive Chart</p>
                      <p className="text-sm text-muted-foreground">Real-time market data visualization</p>
                    </div>
                  </motion.div>

                  {/* Trading actions */}
                  <motion.div 
                    className="flex gap-4 mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <motion.div
                      className="flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="w-full bg-neon-600 hover:bg-neon-700 text-white">
                        Buy AAPL
                      </Button>
                    </motion.div>
                    <motion.div
                      className="flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button variant="outline" className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10">
                        Sell AAPL
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PlatformPreview;
