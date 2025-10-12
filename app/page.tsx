"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle,
  Clock,
  DollarSign,
  Globe,
  HeadphonesIcon,
  Package,
  Rocket,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  Target,
  Users
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

// Animated counter component
function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }, [end, duration])

  return <span>{count.toLocaleString()}</span>
}

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: ShoppingCart,
      title: "Purchase Order Management",
      description: "Streamline procurement with automated workflow and approval systems",
      color: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-400/20 via-teal-400/10 to-cyan-400/20",
      borderColor: "border-emerald-300/30"
    },
    {
      icon: Package,
      title: "Inventory Control",
      description: "Real-time stock tracking with automated reorder points and alerts",
      color: "from-teal-500 to-cyan-600",
      bgGradient: "from-teal-400/20 via-emerald-400/10 to-green-400/20",
      borderColor: "border-teal-300/30"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Comprehensive insights with customizable dashboards and reports",
      color: "from-cyan-500 to-blue-600",
      bgGradient: "from-cyan-400/20 via-blue-400/10 to-indigo-400/20",
      borderColor: "border-cyan-300/30"
    },
    {
      icon: DollarSign,
      title: "Financial Management",
      description: "Complete cash flow tracking with integrated POS and accounting",
      color: "from-emerald-600 to-green-600",
      bgGradient: "from-emerald-400/20 via-green-400/10 to-teal-400/20",
      borderColor: "border-emerald-300/30"
    },
    {
      icon: Users,
      title: "Multi-Location Support",
      description: "Centralized management across multiple store locations",
      color: "from-indigo-500 to-purple-600",
      bgGradient: "from-indigo-400/20 via-purple-400/10 to-violet-400/20",
      borderColor: "border-indigo-300/30"
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security with role-based access control",
      color: "from-red-500 to-rose-600",
      bgGradient: "from-red-400/20 via-rose-400/10 to-pink-400/20",
      borderColor: "border-red-300/30"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Operations Manager",
      company: "TechMart Electronics",
      content: "StockFlow transformed our inventory management. We reduced stockouts by 85% and improved efficiency across all locations.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Store Owner",
      company: "Urban Fashion Hub",
      content: "The purchase order workflow is incredibly intuitive. Our procurement process is now 70% faster with full transparency.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Financial Controller",
      company: "Green Valley Grocers",
      content: "Real-time analytics give us insights we never had before. Our profit margins improved by 15% in just 6 months.",
      rating: 5
    }
  ]

  const stats = [
    { label: "Retail Partners", value: 2500, suffix: "+" },
    { label: "Transactions Processed", value: 10, suffix: "M+" },
    { label: "Inventory Items Managed", value: 500, suffix: "K+" },
    { label: "Customer Satisfaction", value: 99, suffix: "%" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-emerald-200/50 shadow-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                StockFlow
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-700 hover:text-emerald-600 transition-colors font-medium">Features</a>
              <a href="#pricing" className="text-slate-700 hover:text-emerald-600 transition-colors font-medium">Pricing</a>
              <a href="#testimonials" className="text-slate-700 hover:text-emerald-600 transition-colors font-medium">Reviews</a>
              <Link href="/login">
                <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge
              variant="secondary"
              className="mb-6 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-300/50 px-4 py-2"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              #1 Retail Management Platform
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Streamline Your
              </span>
              <br />
              <span className="text-slate-800">Retail Operations</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Comprehensive retail management system with intelligent inventory control, seamless purchase order workflows, and real-time analytics to boost your business efficiency.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-6 text-lg shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-8 py-6 text-lg backdrop-blur-sm hover:scale-105 transition-all duration-300"
                >
                  View Demo
                  <Rocket className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">
                    <AnimatedCounter end={stat.value} />
                    {stat.suffix}
                  </div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 border-teal-300/50"
            >
              <Target className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
              Everything You Need to
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Scale Your Business</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Built for modern retailers who demand efficiency, accuracy, and growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`
                  relative overflow-hidden border-2 ${feature.borderColor}
                  bg-gradient-to-br ${feature.bgGradient}
                  backdrop-blur-xl shadow-2xl ring-1 ring-white/20
                  hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-2
                  transition-all duration-500 ease-out group cursor-pointer
                `}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />

                <CardHeader className="relative z-10 pb-3">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>

                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-300/50"
            >
              <HeadphonesIcon className="w-4 h-4 mr-2" />
              Customer Success
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
              Trusted by
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Thousands</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See how retailers are transforming their operations with StockFlow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-white/95 backdrop-blur-xl border-emerald-200/50 shadow-2xl ring-2 ring-teal-300/40 hover:shadow-3xl hover:scale-105 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-slate-700 text-base leading-relaxed mb-4">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{testimonial.name}</div>
                      <div className="text-sm text-slate-600">{testimonial.role}</div>
                      <div className="text-sm text-emerald-600 font-medium">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 bg-gradient-to-r from-cyan-100 to-emerald-100 text-cyan-700 border-cyan-300/50"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Simple Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
              Choose Your
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Perfect Plan</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Flexible pricing that grows with your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "49",
                description: "Perfect for small businesses",
                features: ["Up to 1,000 products", "Basic inventory tracking", "Purchase order management", "Email support", "1 location"],
                popular: false
              },
              {
                name: "Professional",
                price: "149",
                description: "Ideal for growing retailers",
                features: ["Up to 10,000 products", "Advanced analytics", "Multi-location support", "Priority support", "API access", "Custom reports"],
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large retail operations",
                features: ["Unlimited products", "Custom integrations", "Dedicated account manager", "24/7 phone support", "Advanced security", "Custom training"],
                popular: false
              }
            ].map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular
                  ? 'border-2 border-emerald-300 ring-4 ring-emerald-100 scale-105 bg-gradient-to-br from-emerald-50 to-teal-50'
                  : 'border border-slate-200'
                  } hover:shadow-2xl transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-slate-800">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-600 mb-4">{plan.description}</CardDescription>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-emerald-600">${plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-slate-600">/month</span>}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">

                    <Button
                      className={`w-full ${plan.popular
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
                        : 'border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Join thousands of retailers who have streamlined their operations with StockFlow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-lg shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm hover:scale-105 transition-all duration-300"
            >
              Schedule Demo
              <Clock className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">StockFlow</span>
              </div>
              <p className="text-slate-400 mb-4">
                Empowering retailers with intelligent management solutions
              </p>
              <div className="flex space-x-4">
                <Globe className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
                <Building2 className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 StockFlow. All rights reserved. Built for modern retail excellence.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}