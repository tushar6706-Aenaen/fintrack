import React from "react";
import { motion } from "framer-motion";
import { 
    Shield, 
    Eye, 
    Lock, 
    Database, 
    Users, 
    FileText,
    Mail,
    Phone,
    MapPin,
    Clock
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

export default function Privacy() {
    const sections = [
        {
            icon: Database,
            title: "Information We Collect",
            content: [
                "Account information (email address, display name)",
                "Financial data you input (expenses, budgets, savings goals)",
                "Usage analytics to improve our service",
                "Device and browser information for security purposes"
            ]
        },
        {
            icon: Eye,
            title: "How We Use Your Information",
            content: [
                "Provide and maintain our expense tracking services",
                "Analyze spending patterns and generate insights",
                "Send important account and security notifications",
                "Improve our application based on usage patterns"
            ]
        },
        {
            icon: Lock,
            title: "Data Security",
            content: [
                "All data is encrypted both in transit and at rest",
                "We use industry-standard security protocols",
                "Regular security audits and monitoring",
                "Secure authentication through Supabase"
            ]
        },
        {
            icon: Users,
            title: "Data Sharing",
            content: [
                "We never sell your personal information",
                "No sharing with third-party advertisers",
                "Limited sharing only when required by law",
                "Anonymous, aggregated data may be used for research"
            ]
        }
    ];

    return (
        <motion.div
            className="min-h-screen bg-zinc-950 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Background Elements */}
           
            <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/25">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-300 bg-clip-text text-transparent mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                        Your privacy is our priority. Learn how we collect, use, and protect your information.
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        <span className="text-zinc-500 text-sm">Last updated: August 26, 2025</span>
                    </div>
                </motion.div>

                {/* Introduction */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12"
                >
                    <Card>
                        <CardContent className="prose prose-invert max-w-none">
                            <p className="text-zinc-300 text-lg leading-relaxed">
                                At Fintrack, we are committed to protecting your privacy and ensuring the security of your personal 
                                and financial information. This Privacy Policy explains how we collect, use, store, and protect your 
                                information when you use our expense tracking application.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Main Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {sections.map((section, index) => {
                        const Icon = section.icon;
                        return (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                            >
                                <Card className="h-full">
                                    <CardHeader>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <CardTitle className="text-xl">{section.title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {section.content.map((item, itemIndex) => (
                                                <li key={itemIndex} className="flex items-start gap-3 text-zinc-300">
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Additional Sections */}
                <div className="space-y-8 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">Your Rights</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-zinc-200 mb-3">Access & Control</h4>
                                        <ul className="space-y-2 text-zinc-300">
                                            <li>• View and download your data</li>
                                            <li>• Update your account information</li>
                                            <li>• Delete your account and data</li>
                                            <li>• Export your financial records</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-zinc-200 mb-3">Data Protection</h4>
                                        <ul className="space-y-2 text-zinc-300">
                                            <li>• Request data correction</li>
                                            <li>• Opt-out of communications</li>
                                            <li>• Report security concerns</li>
                                            <li>• Contact our support team</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">Cookies and Tracking</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-zinc-300 mb-4">
                                    We use minimal tracking technologies to provide our services:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-zinc-800/50 rounded-lg">
                                        <h5 className="font-semibold text-zinc-200 mb-2">Essential Cookies</h5>
                                        <p className="text-zinc-400 text-sm">Required for authentication and core functionality</p>
                                    </div>
                                    <div className="p-4 bg-zinc-800/50 rounded-lg">
                                        <h5 className="font-semibold text-zinc-200 mb-2">Analytics</h5>
                                        <p className="text-zinc-400 text-sm">Anonymous usage data to improve our service</p>
                                    </div>
                                    <div className="p-4 bg-zinc-800/50 rounded-lg">
                                        <h5 className="font-semibold text-zinc-200 mb-2">Preferences</h5>
                                        <p className="text-zinc-400 text-sm">Remember your settings and preferences</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">Third-Party Services</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-zinc-300 mb-4">
                                    Fintrack integrates with trusted third-party services to provide our functionality:
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mt-1">
                                            <Database className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-zinc-200">Supabase</h5>
                                            <p className="text-zinc-400 text-sm">Database and authentication services with enterprise-grade security</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="text-center"
                >
                    <Card className="bg-gradient-to-br from-blue-950/50 to-purple-950/50 border-blue-500/30">
                        <CardContent className="py-12">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                                Questions About Privacy?
                            </h2>
                            <p className="text-zinc-300 text-lg mb-6 max-w-2xl mx-auto">
                                If you have any questions about this Privacy Policy or how we handle your data, 
                                please don't hesitate to contact us.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a 
                                    href="/contact" 
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl shadow-blue-600/25"
                                >
                                    Contact Us
                                </a>
                                <a 
                                    href="mailto:chauhantushar6700@gmail.com" 
                                    className="px-8 py-3 border-2 border-zinc-700 hover:border-zinc-600 rounded-xl text-zinc-300 hover:text-zinc-100 font-semibold transition-all duration-300 hover:scale-105 hover:bg-zinc-800/50"
                                >
                                    Email Support
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
