import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
    Mail, 
    Phone, 
    MapPin, 
    Clock, 
    Github, 
    Linkedin,
    MessageCircle,
    Send,
    User,
    AlertCircle,
    CheckCircle2,
    Loader2
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

const Input = ({ className = "", type = "text", ...props }) => (
    <input 
        type={type}
        className={`flex h-11 w-full rounded-xl border-2 border-zinc-700 bg-zinc-900/80 backdrop-blur-sm px-4 py-3 text-sm text-zinc-100 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-zinc-600 ${className}`}
        {...props}
    />
);

const Textarea = ({ className = "", ...props }) => (
    <textarea 
        className={`flex min-h-[120px] w-full rounded-xl border-2 border-zinc-700 bg-zinc-900/80 backdrop-blur-sm px-4 py-3 text-sm text-zinc-100 ring-offset-background placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-zinc-600 resize-none ${className}`}
        {...props}
    />
);

const Label = ({ children, className = "", ...props }) => (
    <label className={`text-sm font-semibold text-zinc-300 ${className}`} {...props}>{children}</label>
);

const Button = ({ children, variant = "default", className = "", disabled = false, onClick, type = "button", ...props }) => {
    const baseClass = "inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl";
    const variants = {
        default: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 shadow-blue-600/25 hover:shadow-blue-500/40 h-11 px-6 py-2",
        outline: "border-2 border-zinc-700 bg-zinc-900/50 backdrop-blur-sm text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100 hover:border-zinc-600 shadow-zinc-900/50 h-11 px-6 py-2"
    };
    
    return (
        <button 
            type={type}
            className={`${baseClass} ${variants[variant]} ${className}`} 
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate form submission
        setTimeout(() => {
            setSubmitStatus("success");
            setIsSubmitting(false);
            setFormData({ name: "", email: "", subject: "", message: "" });
            
            // Reset status after 5 seconds
            setTimeout(() => setSubmitStatus(null), 5000);
        }, 2000);
    };

    const contactMethods = [
        {
            icon: Mail,
            title: "Email",
            value: "chauhantushar6700@gmail.com",
            description: "Send us an email and we'll respond within 24 hours",
            action: "mailto:chauhantushar6700@gmail.com",
            color: "from-blue-600 to-blue-700"
        },
        {
            icon: Github,
            title: "GitHub",
            value: "@tushar6706-Aenaen",
            description: "Check out our code, report issues, or contribute",
            action: "https://github.com/tushar6706-Aenaen",
            color: "from-zinc-700 to-zinc-800"
        },
        {
            icon: Linkedin,
            title: "LinkedIn",
            value: "Tushar Chauhankar",
            description: "Connect with me for professional inquiries",
            action: "https://linkedin.com/in/tushar-chauhankar",
            color: "from-blue-600 to-blue-800"
        }
    ];

    const faqs = [
        {
            question: "How secure is my financial data?",
            answer: "We use enterprise-grade encryption and security measures. Your data is encrypted both in transit and at rest, and we never share your personal information with third parties."
        },
        {
            question: "Can I export my data?",
            answer: "Yes! You can export all your financial data in JSON format from the Settings page. This includes expenses, budgets, and savings goals."
        },
        {
            question: "Is Fintrack free to use?",
            answer: "Yes, Fintrack is completely free to use. We believe everyone should have access to quality financial tracking tools."
        },
        {
            question: "How do I delete my account?",
            answer: "You can delete your account from the Danger Zone section in Settings. This will permanently remove all your data and cannot be undone."
        }
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
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/25">
                            <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-300 bg-clip-text text-transparent mb-6">
                        Contact Us
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                        Have questions, feedback, or need support? We'd love to hear from you.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-3">
                                    <Send className="w-6 h-6 text-blue-400" />
                                    Send us a Message
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Your full name"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="your.email@example.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            placeholder="What is this regarding?"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            placeholder="Tell us more about your inquiry..."
                                            required
                                        />
                                    </div>
                                    
                                    {submitStatus && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`p-4 rounded-xl border ${
                                                submitStatus === "success" 
                                                    ? "bg-green-950/50 border-green-500/50 text-green-100" 
                                                    : "bg-red-950/50 border-red-500/50 text-red-100"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {submitStatus === "success" ? (
                                                    <CheckCircle2 className="w-5 h-5" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5" />
                                                )}
                                                <span className="font-medium">
                                                    {submitStatus === "success" 
                                                        ? "Message sent successfully! We'll get back to you soon." 
                                                        : "Failed to send message. Please try again."
                                                    }
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                    
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Contact Methods */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">Get in Touch</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {contactMethods.map((method, index) => {
                                        const Icon = method.icon;
                                        return (
                                            <motion.a
                                                key={method.title}
                                                href={method.action}
                                                target={method.action.startsWith('http') ? '_blank' : '_self'}
                                                rel={method.action.startsWith('http') ? 'noopener noreferrer' : ''}
                                                className="block p-4 rounded-xl border border-zinc-700/50 hover:border-zinc-600/50 bg-zinc-800/30 hover:bg-zinc-800/50 transition-all duration-300 group"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + index * 0.1 }}
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                        <Icon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-zinc-100 mb-1">{method.title}</h4>
                                                        <p className="text-blue-400 font-medium mb-2">{method.value}</p>
                                                        <p className="text-zinc-400 text-sm">{method.description}</p>
                                                    </div>
                                                </div>
                                            </motion.a>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Response Time */}
                        <Card className="bg-gradient-to-br from-blue-950/30 to-purple-950/30 border-blue-500/30">
                            <CardContent>
                                <div className="flex items-center gap-3 mb-3">
                                    <Clock className="w-6 h-6 text-blue-400" />
                                    <h4 className="font-semibold text-blue-300">Response Time</h4>
                                </div>
                                <p className="text-blue-200 mb-2">We typically respond within:</p>
                                <ul className="text-blue-100 space-y-1">
                                    <li>• Email: 24 hours</li>
                                    <li>• Bug reports: 48 hours</li>
                                    <li>• Feature requests: 3-5 days</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-16"
                >
                    <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent mb-12">
                        Frequently Asked Questions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                            >
                                <Card className="h-full">
                                    <CardContent>
                                        <h4 className="font-semibold text-zinc-100 mb-3">{faq.question}</h4>
                                        <p className="text-zinc-400 leading-relaxed">{faq.answer}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <Card className="bg-gradient-to-br from-purple-950/50 to-pink-950/50 border-purple-500/30">
                        <CardContent className="py-12">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                                Ready to Get Started?
                            </h2>
                            <p className="text-zinc-300 text-lg mb-6 max-w-2xl mx-auto">
                                Join thousands of users who are already taking control of their finances with Fintrack.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a 
                                    href="/dashboard" 
                                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl shadow-purple-600/25"
                                >
                                    Start Tracking
                                </a>
                                <a 
                                    href="/about" 
                                    className="px-8 py-3 border-2 border-zinc-700 hover:border-zinc-600 rounded-xl text-zinc-300 hover:text-zinc-100 font-semibold transition-all duration-300 hover:scale-105 hover:bg-zinc-800/50"
                                >
                                    Learn More
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
