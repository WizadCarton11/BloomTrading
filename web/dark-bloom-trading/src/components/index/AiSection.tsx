

import { Brain, MessageSquareText, Lightbulb, TrendingUp, BarChart3, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const AiSection = () => {
    const features = [
        {
            icon: <MessageSquareText className="h-6 w-6 text-electric-400" />,
            title: "AI Chat Assistant",
            description: "Get instant answers to your trading questions, market analysis, and stock insights 24/7."
        },
        {
            icon: <TrendingUp className="h-6 w-6 text-neon-400" />,
            title: "Predictive Analysis",
            description: "Our AI analyzes patterns and predicts market movements with remarkable accuracy."
        },
        {
            icon: <Lightbulb className="h-6 w-6 text-purple-400" />,
            title: "Smart Recommendations",
            description: "Receive personalized stock recommendations based on your risk profile and goals."
        },
        {
            icon: <BarChart3 className="h-6 w-6 text-electric-400" />,
            title: "Sentiment Analysis",
            description: "Our AI scans news, social media, and forums to gauge market sentiment in real-time."
        }
    ];

    const fadeInUpVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.1 * i,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    return (
        <section className="py-24 px-4 relative overflow-hidden" id="ai-section">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-tr from-electric-900/20 via-background to-purple-900/10 z-0" />
            <motion.div 
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1)_0%,transparent_70%)]"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            
            <div className="container mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Left Column - AI Virtual Assistant Visualization */}
                    <motion.div 
                        className="lg:w-1/2"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <Card className="p-6 md:p-8 relative overflow-hidden border-electric-500/20">
                            {/* Glowing effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-electric-500/10 to-purple-500/10 blur-lg"></div>
                            
                            <div className="relative z-10">
                                {/* AI Chat Interface Mockup */}
                                <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-electric-500/20">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="relative">
                                            <Bot className="h-10 w-10 text-electric-500" />
                                            <motion.div 
                                                className="absolute -inset-1 rounded-full bg-electric-500/20 z-0"
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                    opacity: [0.5, 0.8, 0.5],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">TradingBot AI</h3>
                                            <p className="text-sm text-muted-foreground">Always online</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 mb-6">
                                        <div className="bg-muted/50 p-3 rounded-lg rounded-tl-none max-w-[80%]">
                                            <p className="text-sm">What stocks should I consider for a long-term tech portfolio?</p>
                                        </div>
                                        
                                        <motion.div 
                                            className="bg-electric-500/10 border border-electric-500/20 p-3 rounded-lg rounded-tr-none ml-auto max-w-[80%]"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.2, duration: 0.5 }}
                                        >
                                            <p className="text-sm">Based on your risk profile and market trends, I recommend considering:</p>
                                            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                                                <motion.li
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.4, duration: 0.3 }}
                                                >MSFT: Strong cloud growth, 1.8% dividend yield</motion.li>
                                                <motion.li
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.6, duration: 0.3 }}
                                                >NVDA: Leading AI chip technology</motion.li>
                                                <motion.li
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.8, duration: 0.3 }}
                                                >ASML: Semiconductor equipment monopoly</motion.li>
                                            </ul>
                                            <p className="text-sm mt-2">Would you like a detailed analysis of each?</p>
                                        </motion.div>
                                    </div>
                                    
                                    <div className="relative">
                                        <input
                                            disabled
                                            type="text"
                                            className="w-full bg-background/50 border border-electric-500/20 rounded-lg px-4 py-2 pr-10 text-sm"
                                            placeholder="Ask about any stock or trading strategy..."
                                        />
                                        <motion.div 
                                            className="absolute right-3 top-1/3 -translate-y-1/2 text-electric-500"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <Brain className="h-5 w-5" />
                                        </motion.div>
                                    </div>
                                </div>
                                
                                {/* AI Processing Visualization */}
                                <div className="mt-8 flex justify-center">
                                    <div className="flex items-center gap-1">
                                        {[0, 1, 2, 3, 4, 5].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="h-1.5 w-8 bg-electric-500/70 rounded-full"
                                                animate={{
                                                    height: ["0.375rem", "1.5rem", "0.375rem"],
                                                    opacity: [0.3, 1, 0.3]
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    delay: i * 0.1,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="mt-4 text-center text-sm text-muted-foreground">
                                    Processing financial data from 120+ global sources
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                    
                    {/* Right Column - Text Content */}
                    <div className="lg:w-1/2">
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <motion.h2 
                                className="text-3xl md:text-4xl font-bold"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                Trade Smarter with <span className="gradient-text">AI-Powered</span> Assistance
                            </motion.h2>
                            
                            <motion.p 
                                className="text-lg text-muted-foreground"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                Our cutting-edge AI trading assistant analyzes vast amounts of market data, news, and trends to give you actionable insights and real-time recommendations tailored to your investment strategy.
                            </motion.p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        className="p-4 rounded-lg border border-muted-foreground/20 bg-card/30 backdrop-blur-sm"
                                        custom={index}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, margin: "-50px" }}
                                        variants={fadeInUpVariants}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">{feature.icon}</div>
                                            <div>
                                                <h3 className="font-medium mb-1">{feature.title}</h3>
                                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            
                            <motion.div 
                                className="mt-8"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <Button className="bg-electric-600 hover:bg-electric-700 text-white glow-effect">
                                    Try AI Assistant
                                    <Brain className="ml-2 h-4 w-4" />
                                </Button>
                            </motion.div>
                            
                            <motion.div 
                                className="mt-6 text-sm text-muted-foreground"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                            >
                                <p>Powered by advanced machine learning models trained on over 30 years of market data</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AiSection;