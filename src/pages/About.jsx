import React from "react";
import { motion } from "framer-motion";
import { 
    Users, 
    Target, 
    Heart, 
    Code, 
    Github, 
    Linkedin,
    Mail,
    Award,
    Lightbulb,
    Shield,
    Zap
} from "lucide-react";

// Enhanced UI Components
const Card = ({ children, className = "", ...props }) => (
    <div className={`relative group rounded-xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/90 via-zinc-900/95 to-zinc-950/90 backdrop-blur-sm p-6 shadow-2xl hover:shadow-zinc-900/20 transition-all duration-300 hover:border-zinc-700/60 ${className}`} {...props}>
        {children}
    </div>
);

const CardHeader = ({ children, className = "", ...props }) => (
    <div className={`flex flex-col space-y-1.5 mb-4 ${className}`} {...props}>{children}</div>
);

const CardTitle = ({ children, className = "", ...props }) => (
    <h3 className={`text-xl font-bold leading-none tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent ${className}`} {...props}>{children}</h3>
);

const CardContent = ({ children, className = "", ...props }) => (
    <div className={`${className}`} {...props}>{children}</div>
);

const Badge = ({ children, variant = "default", className = "" }) => {
    const variants = {
        default: "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-600/25",
        secondary: "bg-gradient-to-r from-zinc-700 to-zinc-800 text-zinc-100 shadow-zinc-700/25",
        success: "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-green-600/25"
    };
    return (
        <div className={`inline-flex items-center rounded-full border-0 px-3 py-1.5 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-lg hover:scale-105 ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
};

export default function About() {
    const features = [
        {
            icon: Target,
            title: "Smart Tracking",
            description: "Intelligent expense categorization and real-time financial insights to help you make better decisions."
        },
        {
            icon: Shield,
            title: "Secure & Private",
            description: "Your financial data is encrypted and protected with enterprise-grade security measures."
        },
        {
            icon: Zap,
            title: "Lightning Fast",
            description: "Modern React architecture ensures smooth performance and instant data synchronization."
        },
        {
            icon: Lightbulb,
            title: "AI Insights",
            description: "Get personalized spending recommendations and budgeting tips powered by smart analytics."
        }
    ];

    const technologies = [
        "React", "Supabase", "Tailwind CSS", "Framer Motion", "Lucide Icons", "Vite"
    ];

    return (
        <motion.div
            className="min-h-screen bg-zinc-950 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
           
            <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-300 bg-clip-text text-transparent mb-6">
                        About Fintrack
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                        Empowering individuals to take control of their financial future through 
                        intelligent expense tracking and smart budgeting tools.
                    </p>
                </motion.div>

                {/* Mission Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-16"
                >
                    <Card className="text-center">
                        <CardHeader>
                            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-600/25">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <CardTitle className="text-3xl">Our Mission</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-zinc-300 text-lg leading-relaxed max-w-4xl mx-auto">
                                At Fintrack, we believe that everyone deserves to have a clear understanding of their finances. 
                                Our mission is to simplify expense tracking and budgeting, making financial wellness accessible 
                                to everyone through intuitive design and powerful features.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-16"
                >
                    <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent mb-12">
                        What Makes Us Different
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                >
                                    <Card className="h-full text-center hover:scale-105 transition-transform duration-300">
                                        <CardContent>
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-zinc-100 mb-3">{feature.title}</h3>
                                            <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Developer Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-16"
                >
                    <Card>
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-600/25">
                                <Code className="w-8 h-8 text-white" />
                            </div>
                            <CardTitle className="text-3xl">Meet the Developer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="max-w-4xl mx-auto text-center">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-zinc-100 mb-2">Tushar Chauhankar</h3>
                                    <p className="text-zinc-300 text-lg mb-4">Full Stack Developer & Financial Technology Enthusiast</p>
                                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                                        <Badge variant="default">React Developer</Badge>
                                        <Badge variant="secondary">UI/UX Designer</Badge>
                                        <Badge variant="success">Fintech Enthusiast</Badge>
                                    </div>
                                </div>
                                
                                <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                                    Passionate about creating user-friendly financial tools that help people make better 
                                    financial decisions. With a background in full-stack development and a keen interest 
                                    in financial technology, I built Fintrack to bridge the gap between complex financial 
                                    management and everyday usability.
                                </p>
                                
                                <div className="flex justify-center gap-6 mb-8">
                                    <a 
                                        href="https://github.com/tushar6706-Aenaen" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 rounded-xl text-zinc-100 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-zinc-700 hover:border-zinc-600"
                                    >
                                        <Github className="w-5 h-5" />
                                        <span className="font-medium">GitHub</span>
                                    </a>
                                    <a 
                                        href="https://linkedin.com/in/tushar-chauhankar" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl shadow-blue-600/25"
                                    >
                                        <Linkedin className="w-5 h-5" />
                                        <span className="font-medium">LinkedIn</span>
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Technology Stack */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-16"
                >
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Built With Modern Technology</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap justify-center gap-3">
                                {technologies.map((tech) => (
                                    <Badge key={tech} variant="secondary" className="text-sm px-4 py-2">
                                        {tech}
                                    </Badge>
                                ))}
                            </div>
                            <p className="text-zinc-400 text-center mt-6 leading-relaxed">
                                Fintrack is built using cutting-edge web technologies to ensure optimal performance, 
                                security, and user experience across all devices.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <Card className="bg-gradient-to-br from-blue-950/50 to-purple-950/50 border-blue-500/30">
                        <CardContent className="py-12">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                                Ready to Take Control?
                            </h2>
                            <p className="text-zinc-300 text-lg mb-6 max-w-2xl mx-auto">
                                Join thousands of users who have already transformed their financial habits with Fintrack.
                            </p>
                            <div className="flex justify-center gap-4">
                                <a 
                                    href="/dashboard" 
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl shadow-blue-600/25"
                                >
                                    Get Started
                                </a>
                                <a 
                                    href="/contact" 
                                    className="px-8 py-3 border-2 border-zinc-700 hover:border-zinc-600 rounded-xl text-zinc-300 hover:text-zinc-100 font-semibold transition-all duration-300 hover:scale-105 hover:bg-zinc-800/50"
                                >
                                    Contact Us
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
