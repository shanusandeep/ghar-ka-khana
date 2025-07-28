
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Calendar } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line
} from 'recharts'

interface FinancialAnalyticsProps {
  dailyStats: any[]
  orders: any[]
  customers: any[]
  timePeriod: string
}

interface DayOfWeekStat {
  day: string
  total: number
  count: number
  average: number
}

interface DayOfWeekAccumulator {
  day: string
  total: number
  count: number
}

const FinancialAnalytics = ({ dailyStats, orders, customers, timePeriod }: FinancialAnalyticsProps) => {
  // Get display label for time period
  const getTimePeriodLabel = (period: string) => {
    switch (period) {
      case 'today': return 'Today'
      case '7d': return '7d'
      case '30d': return '30d'
      case 'thisMonth': return 'This Month'
      case 'lastMonth': return 'Last Month'
      case 'thisQuarter': return 'This Quarter'
      case 'thisYear': return 'This Year'
      case 'quarter': return 'Last Quarter'
      case 'year': return 'Last Year'
      case 'custom': return 'Custom Range'
      default: return '7d'
    }
  }

  const timePeriodLabel = getTimePeriodLabel(timePeriod)

  // Calculate advanced metrics
  const totalRevenue = dailyStats.reduce((sum, day) => sum + (day.total || 0), 0)
  const totalOrders = dailyStats.reduce((sum, day) => sum + (day.orderCount || 0), 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Calculate growth trends (comparing last 7 days with previous 7 days)
  const recentDays = dailyStats.slice(-7)
  const previousDays = dailyStats.slice(-14, -7)
  
  const recentRevenue = recentDays.reduce((sum, day) => sum + (day.total || 0), 0)
  const previousRevenue = previousDays.reduce((sum, day) => sum + (day.total || 0), 0)
  const revenueGrowth = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 
                       recentRevenue > 0 ? 100 : 0

  // Top customers by spending - fix the filtering and sorting
  const customersWithOrders = customers.filter(c => (c.total_order_value || 0) > 0)
  const topCustomers = customersWithOrders
    .sort((a, b) => (b.total_order_value || 0) - (a.total_order_value || 0))
    .slice(0, 5)

  // Revenue by day of week
  const dayOfWeekStats = dailyStats.reduce((acc: Record<string, DayOfWeekAccumulator>, day) => {
    const date = new Date(day.date + ' 2024') // Adding year for parsing
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    if (!acc[dayName]) {
      acc[dayName] = { day: dayName, total: 0, count: 0 }
    }
    acc[dayName].total += day.total || 0
    acc[dayName].count += 1
    return acc
  }, {})

  const dayOfWeekData: DayOfWeekStat[] = Object.values(dayOfWeekStats).map((d: DayOfWeekAccumulator) => ({
    day: d.day,
    total: d.total,
    count: d.count,
    average: d.count > 0 ? d.total / d.count : 0
  }))

  // Order status distribution
  const statusDistribution = orders.reduce((acc: Record<string, number>, order) => {
    const status = order.status || 'pending'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const statusData = Object.entries(statusDistribution).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count as number,
    percentage: orders.length > 0 ? (((count as number) / orders.length) * 100).toFixed(1) : '0.0'
  }))

  const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6']

  // Calculate active customers for the same period as revenue growth (last 7 days)
  // Get customer IDs from recent orders (last 7 days)
  const recentOrderCustomerIds = new Set()
  
  // Get the date range for last 7 days from dailyStats
  const last7DaysData = dailyStats.slice(-7)
  const last7DaysDates = last7DaysData.map(day => day.date)
  
  // Filter orders that fall within the last 7 days period
  const recentOrders = orders.filter(order => {
    const orderDate = new Date(order.delivery_date)
    const orderDateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    return last7DaysDates.includes(orderDateStr)
  })
  
  // Get unique customer IDs from recent orders
  recentOrders.forEach(order => {
    if (order.customer_id) {
      recentOrderCustomerIds.add(order.customer_id)
    }
  })
  
  const activeCustomersCount = recentOrderCustomerIds.size

  // Performance metrics
  const metrics = [
    {
      title: `Revenue Growth (${timePeriodLabel})`,
      value: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`,
      icon: revenueGrowth >= 0 ? TrendingUp : TrendingDown,
      color: revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: revenueGrowth >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Active Customers (7d)',
      value: activeCustomersCount.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Avg Order Value',
      value: `$${avgOrderValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <p className="text-xl sm:text-2xl font-bold">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue with trend analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyStats}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Current order status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, `${name} Orders`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Day of Week Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Day of Week Performance</CardTitle>
            <CardDescription>Average revenue by day of week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dayOfWeekData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(value, name) => [`$${value}`, name === 'average' ? 'Avg Revenue' : 'Total Revenue']} />
                  <Bar dataKey="total" fill="#3b82f6" opacity={0.6} />
                  <Line type="monotone" dataKey="average" stroke="#ef4444" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>Highest spending customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCustomers.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No customers with orders found
                </div>
              ) : (
                topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.order_count || 0} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${(customer.total_order_value || 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default FinancialAnalytics
