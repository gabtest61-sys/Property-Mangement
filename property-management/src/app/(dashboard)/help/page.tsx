'use client';

import { Header } from '@/components/layout';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  Search,
  Home,
  Building2,
  Users,
  MessageSquare,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Video,
  Mail,
  Phone,
  Lightbulb,
  Shield,
  Bell,
  Crown,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const helpCategories = [
  { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
  { id: 'properties', label: 'Properties', icon: Building2 },
  { id: 'tenants', label: 'Tenants', icon: Users },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'contracts', label: 'Contracts', icon: FileText },
  { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'account', label: 'Account & Settings', icon: Settings },
];

const faqs = [
  {
    category: 'getting-started',
    question: 'What is PropManager?',
    answer: 'PropManager is a comprehensive property management platform designed to help property owners and managers efficiently manage their rental properties, tenants, contracts, and finances. It provides tools for tracking occupancy, collecting rent, communicating with tenants, and analyzing property performance.',
  },
  {
    category: 'getting-started',
    question: 'How do I get started with PropManager?',
    answer: 'After signing up, start by adding your properties in the Properties section. Then add your units and tenants. You can create contracts, set up billing schedules, and start communicating with your tenants through the Messages feature. The Dashboard gives you an overview of your entire portfolio.',
  },
  {
    category: 'getting-started',
    question: 'What are the differences between Free and Premium plans?',
    answer: 'The Free plan allows you to manage up to 3 properties and 10 units. Premium unlocks unlimited properties and units, contract creation with e-signing, automated billing and reminders, advanced analytics and reports, and priority support.',
  },
  {
    category: 'properties',
    question: 'How do I add a new property?',
    answer: 'Navigate to the Properties page and click the "Add Property" button. Fill in the property details including name, address, property type (Apartment, Condo, House, or Boarding House), and the number of units. You can also add photos and additional details.',
  },
  {
    category: 'properties',
    question: 'What property types are supported?',
    answer: 'PropManager supports various property types including Apartments, Condominiums, Houses, and Boarding Houses. Each property can have multiple units that you can manage individually.',
  },
  {
    category: 'properties',
    question: 'How do I track occupancy rates?',
    answer: 'The Dashboard and Analytics pages display your overall occupancy rate. Each property card also shows the number of occupied units vs total units. The Analytics page provides detailed occupancy trends over time.',
  },
  {
    category: 'tenants',
    question: 'How do I add a new tenant?',
    answer: 'Go to the Tenants page and click "Add Tenant". Enter their personal information, contact details, and assign them to a property and unit. You can also set their move-in date and monthly rent amount.',
  },
  {
    category: 'tenants',
    question: 'What is the Risk Score?',
    answer: 'The Risk Score is a 0-100 rating that helps you assess tenant reliability based on payment history and other factors. Green (70-100) indicates low risk, amber (40-69) indicates moderate risk, and red (0-39) indicates high risk tenants who may need attention.',
  },
  {
    category: 'tenants',
    question: 'How can I filter tenants by payment status?',
    answer: 'On the Tenants page, use the status tabs to filter tenants: All Tenants, Active, Late Payment, or Pending. This helps you quickly identify tenants who need follow-up on payments.',
  },
  {
    category: 'messages',
    question: 'How do I communicate with tenants?',
    answer: 'Use the Messages feature to chat directly with your tenants. The interface shows all conversations on the left and the chat area on the right. You can send text messages, attach files, and images. Online status indicators show when tenants are available.',
  },
  {
    category: 'messages',
    question: 'Can I see if my message was read?',
    answer: 'Yes! Messages show delivery status with checkmarks. A single checkmark means the message was sent, and double checkmarks indicate the message was read by the recipient.',
  },
  {
    category: 'messages',
    question: 'Are there notification badges for unread messages?',
    answer: 'Yes, the Messages icon in the sidebar displays a badge showing the number of unread conversations. Each conversation in the list also shows an unread count badge.',
  },
  {
    category: 'contracts',
    question: 'What types of contracts can I create?',
    answer: 'PropManager supports multiple contract types: Month-to-Month Lease (flexible terms), Fixed-Term Lease (6 months or 1 year), Bedspace Agreement (shared accommodation), and Boarding House contracts (multiple tenants).',
  },
  {
    category: 'contracts',
    question: 'How do I track contract expiration dates?',
    answer: 'The Contracts page shows all your lease agreements with their status. Contracts nearing expiration are marked as "Expiring Soon" with a yellow badge. You can also filter by status to see all expiring contracts at once.',
  },
  {
    category: 'contracts',
    question: 'Can tenants sign contracts digitally?',
    answer: 'Yes, with a Premium subscription, you can send contracts for digital signature. Contracts pending signature show a "Pending Signature" status and tenants can sign directly through the platform.',
  },
  {
    category: 'billing',
    question: 'How do I create an invoice?',
    answer: 'Go to the Billing page and click "Create Invoice". Select the tenant, specify the amount and due date, and send. You can also set up recurring invoices for monthly rent collection.',
  },
  {
    category: 'billing',
    question: 'What payment methods are supported?',
    answer: 'PropManager tracks payments made via Bank Transfer, GCash, and other methods. You can record payments manually as they come in, and the system will update the tenant\'s payment status automatically.',
  },
  {
    category: 'billing',
    question: 'How do I send payment reminders?',
    answer: 'The Billing page shows upcoming invoices with a "Send All Reminders" button for batch notifications. You can also send individual reminders. Premium users can set up automated reminders before due dates.',
  },
  {
    category: 'billing',
    question: 'How do I export financial reports?',
    answer: 'Click the "Export" button on the Billing page to download your payment history and financial data. Premium users can also generate detailed monthly reports from the Quick Actions menu.',
  },
  {
    category: 'analytics',
    question: 'What metrics are tracked in Analytics?',
    answer: 'The Analytics page tracks Total Revenue, Occupancy Rate, Active Tenants, Property Views, Average Rent, Vacancy Rate, Average Days to Lease, and Renewal Rate. Premium users get access to AI-powered vacancy predictions.',
  },
  {
    category: 'analytics',
    question: 'How do I view revenue trends?',
    answer: 'The Revenue Overview chart on the Analytics page shows monthly revenue vs expenses for the past 12 months. You can see trends and compare performance across different time periods.',
  },
  {
    category: 'analytics',
    question: 'What is AI Vacancy Prediction?',
    answer: 'AI Vacancy Prediction is a Premium feature that uses machine learning to predict when units will become vacant, helping you optimize occupancy rates and plan for tenant turnover in advance.',
  },
  {
    category: 'account',
    question: 'How do I change my password?',
    answer: 'Go to Settings > Security. Enter your current password, then your new password twice to confirm. Click "Update Password" to save your changes.',
  },
  {
    category: 'account',
    question: 'How do I enable two-factor authentication?',
    answer: 'In Settings > Security, find the Two-Factor Authentication section and click "Enable" next to Authenticator App. Follow the setup instructions to scan the QR code with your authenticator app.',
  },
  {
    category: 'account',
    question: 'How do I change notification preferences?',
    answer: 'Go to Settings > Notifications. Toggle on or off various notification types including payment notifications, new messages, contract updates, payment reminders, and maintenance requests.',
  },
  {
    category: 'account',
    question: 'Can I switch between light and dark mode?',
    answer: 'Yes! Go to Settings > Preferences and choose your preferred theme: Light, Dark, or System (follows your device settings). The change applies immediately across the entire application.',
  },
  {
    category: 'account',
    question: 'How do I upgrade to Premium?',
    answer: 'Go to Settings > Billing & Plans and click "View Plans" or "Upgrade". Choose your preferred subscription period and complete the payment process to unlock all Premium features.',
  },
];

const quickLinks = [
  { label: 'Dashboard Overview', href: '/dashboard', icon: Home },
  { label: 'Add New Property', href: '/properties', icon: Building2 },
  { label: 'Manage Tenants', href: '/tenants', icon: Users },
  { label: 'View Contracts', href: '/contracts', icon: FileText },
  { label: 'Billing & Payments', href: '/billing', icon: CreditCard },
  { label: 'Account Settings', href: '/settings', icon: Settings },
];

const tips = [
  {
    icon: Lightbulb,
    title: 'Keep Contracts Updated',
    description: 'Regularly review expiring contracts to ensure timely renewals and avoid gaps in lease agreements.',
  },
  {
    icon: Bell,
    title: 'Enable Notifications',
    description: 'Turn on payment and message notifications to stay on top of tenant communications and due payments.',
  },
  {
    icon: Shield,
    title: 'Secure Your Account',
    description: 'Enable two-factor authentication for added security, especially if managing multiple properties.',
  },
  {
    icon: Crown,
    title: 'Unlock Premium Features',
    description: 'Upgrade to Premium for unlimited properties, automated billing, advanced analytics, and priority support.',
  },
];

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([0]);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (index: number) => {
    setExpandedFaqs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <>
      <Header
        title="Help & Support"
        subtitle="Find answers and get assistance"
        showSearch={false}
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Search Bar */}
        <Card className="bg-linear-to-r from-blue-500 to-blue-600 border-none">
          <CardContent className="py-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                How can we help you?
              </h2>
              <p className="text-blue-100">
                Search our knowledge base or browse categories below
              </p>
            </div>
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all group"
            >
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <link.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                {link.label}
              </span>
            </a>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Categories Sidebar */}
          <div className="lg:w-64 shrink-0">
            <Card padding="sm" className="sticky top-20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Categories</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                      activeCategory === 'all'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    )}
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span className="font-medium">All Topics</span>
                  </button>
                  {helpCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                        activeCategory === category.id
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                      )}
                    >
                      <category.icon className="h-5 w-5" />
                      <span className="font-medium">{category.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* FAQs */}
          <div className="flex-1">
            <Card padding="none">
              <CardHeader className="p-4 md:p-6 pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <Badge variant="primary">{filteredFaqs.length} articles</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No results found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Try adjusting your search or browse a different category
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredFaqs.map((faq, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFaq(index)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <span className="font-medium text-gray-900 dark:text-gray-100 pr-4">
                            {faq.question}
                          </span>
                          {expandedFaqs.includes(index) ? (
                            <ChevronUp className="h-5 w-5 text-gray-400 shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                          )}
                        </button>
                        {expandedFaqs.includes(index) && (
                          <div className="px-4 pb-4">
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tips Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Tips & Best Practices
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tips.map((tip, index) => (
              <Card key={index} hoverable>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 w-fit mb-3">
                  <tip.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {tip.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tip.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <Card>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Still need help?
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Our support team is here to assist you with any questions or issues.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline">
                  <Mail className="h-4 w-4" />
                  Email Support
                </Button>
                <Button variant="outline">
                  <Phone className="h-4 w-4" />
                  Call Us
                </Button>
                <Button variant="outline">
                  <Video className="h-4 w-4" />
                  Video Tutorials
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
