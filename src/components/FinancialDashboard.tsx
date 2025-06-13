import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ordersApi, customersApi } from '@/services/api'
import { Order, OrderItem, Customer } from '@/config/supabase'
import { format, subDays, startOfDay, endOfDay, parseISO, subMonths, subQuarters, subYears } from 'date-fns'
import { DollarSign, TrendingUp, Package, Calendar, Filter } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DailyStats {
  date: string
  total: number
  orderCount: number
  averageOrderValue: number
}

interface FilterState {
  timePeriod: string
  customerId?: string
  itemId?: string
}

// Extended Order type that includes order_items
interface OrderWithItems extends Order {
  order_items?: OrderItem[]
}

// Add moving average calculation
function calculateMovingAverage(data: DailyStats[], windowSize = 7) {
  return data.map((d, i, arr) => {
    const start = Math.max(0, i - windowSize + 1)
    const window = arr.slice(start, i + 1)
    const avg = window.reduce((sum, v) => sum + v.total, 0) / window.length
    return { ...d, movingAvg: avg }
  })
}

const FinancialDashboard = () => {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [filterState, setFilterState] = useState<FilterState>({
    timePeriod: '7d'
  })
  const [customers, setCustomers] = useState<Customer[]>([])
  const [items, setItems] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    loadOrders()
    loadCustomers()
  }, [])

  useEffect(() => {
    if (orders.length > 0) {
      // Extract unique items from orders
      const uniqueItems = new Set<string>()
      orders.forEach(order => {
        order.order_items?.forEach(item => {
          if (item.menu_item_id) {
            uniqueItems.add(item.menu_item_id)
          }
        })
      })
      const itemsList = Array.from(uniqueItems).map(id => {
        const order = orders.find(o => o.order_items?.some(item => item.menu_item_id === id))
        const item = order?.order_items?.find(item => item.menu_item_id === id)
        return {
          id,
          name: item?.item_name || 'Unknown'
        }
      })
      setItems(itemsList)
    }
  }, [orders])

  // Recalculate stats whenever orders or filterState changes
  useEffect(() => {
    if (!loading) {
      calculateDailyStats(orders)
    }
  }, [orders, filterState, loading])

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll()
      setCustomers(data)
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const loadOrders = async () => {
    try {
      const data = await ordersApi.getAll()
      setOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateDailyStats = (orders: OrderWithItems[]) => {
    const today = new Date()
    let stats: DailyStats[] = []
    let filteredOrders = [...orders]

    // Apply customer filter
    if (filterState.customerId) {
      filteredOrders = filteredOrders.filter(order => order.customer_id === filterState.customerId)
    }

    // Apply item filter
    if (filterState.itemId) {
      filteredOrders = filteredOrders.filter(order => 
        order.order_items?.some(item => item.menu_item_id === filterState.itemId)
      )
    }

    // Calculate date range based on time period
    let startDate: Date
    let endDate: Date = today

    switch (filterState.timePeriod) {
      case 'today':
        startDate = startOfDay(today)
        break
      case '7d':
        startDate = subDays(today, 6)
        break
      case '30d':
        startDate = subDays(today, 29)
        break
      case 'quarter':
        startDate = subQuarters(today, 1)
        break
      case 'year':
        startDate = subYears(today, 1)
        break
      default:
        startDate = subDays(today, 6) // Default to 7 days
    }

    // For 7-day view, ensure we show all 7 days even if no orders
    if (filterState.timePeriod === '7d') {
      // Create array of last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i)
        const dateStr = format(date, 'MMM dd')
        
        // Find orders for this specific date
        const dayOrders = filteredOrders.filter(order => {
          const orderDate = parseISO(order.delivery_date) // Use delivery_date instead of created_at
          return format(orderDate, 'MMM dd') === dateStr
        })

        const dayTotal = dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        const orderCount = dayOrders.length
        const averageOrderValue = orderCount > 0 ? dayTotal / orderCount : 0

        stats.push({
          date: dateStr,
          total: dayTotal,
          orderCount,
          averageOrderValue
        })
      }
    } else {
      // Filter orders by date range for other time periods
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = parseISO(order.delivery_date) // Use delivery_date instead of created_at
        return orderDate >= startDate && orderDate <= endDate
      })

      // Group orders by date
      const ordersByDate = new Map<string, OrderWithItems[]>()
      filteredOrders.forEach(order => {
        const date = format(parseISO(order.delivery_date), 'MMM dd') // Use delivery_date
        if (!ordersByDate.has(date)) {
          ordersByDate.set(date, [])
        }
        ordersByDate.get(date)?.push(order)
      })

      // Calculate stats for each date
      ordersByDate.forEach((dateOrders, date) => {
        const dayTotal = dateOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        const orderCount = dateOrders.length
        const averageOrderValue = orderCount > 0 ? dayTotal / orderCount : 0

        stats.push({
          date,
          total: dayTotal,
          orderCount,
          averageOrderValue
        })
      })

      // Sort stats by date
      stats.sort((a, b) => {
        const dateA = parseISO(a.date)
        const dateB = parseISO(b.date)
        return dateA.getTime() - dateB.getTime()
      })
    }

    setDailyStats(stats)
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilterState = { ...filterState, [key]: value }
    setFilterState(newFilterState)
  }

  const clearFilters = () => {
    setFilterState({ timePeriod: '7d' })
  }

  const getTotalRevenue = () => {
    return dailyStats.reduce((sum, day) => sum + day.total, 0)
  }

  const getTotalOrders = () => {
    return dailyStats.reduce((sum, day) => sum + day.orderCount, 0)
  }

  const getAverageOrderValue = () => {
    const totalOrders = getTotalOrders()
    return totalOrders > 0 ? getTotalRevenue() / totalOrders : 0
  }

  // Calculate moving average and find min/max in render scope
  const enhancedStats = calculateMovingAverage(dailyStats)
  const maxRevenue = enhancedStats.length > 0 ? Math.max(...enhancedStats.map(d => d.total)) : 0
  const minRevenue = enhancedStats.length > 0 ? Math.min(...enhancedStats.map(d => d.total)) : 0

  // Custom dot renderer for highlighting max/min
  const CustomDot = (props: any) => {
    const { cx, cy, value } = props
    let fill = '#2563eb'
    if (value === maxRevenue) fill = '#22c55e'
    if (value === minRevenue) fill = '#ef4444'
    return (
      <circle cx={cx} cy={cy} r={5} stroke={fill} strokeWidth={2} fill={fill} />
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading financial data...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Financial Dashboard</h2>
          <p className="text-gray-600">Track your daily earnings and order metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <Select
                    value={filterState.timePeriod}
                    onValueChange={(value) => handleFilterChange('timePeriod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer</label>
                  <Select
                    value={filterState.customerId || 'all'}
                    onValueChange={(value) => handleFilterChange('customerId', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Customers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      {customers.filter(customer => customer.id && customer.id !== '').map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Item</label>
                  <Select
                    value={filterState.itemId || 'all'}
                    onValueChange={(value) => handleFilterChange('itemId', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Items" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      {items.filter(item => item.id && item.id !== '').map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{getTotalRevenue().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {filterState.timePeriod === 'today' ? 'Today' : 
               filterState.timePeriod === '7d' ? 'Last 7 days' :
               filterState.timePeriod === '30d' ? 'Last 30 days' :
               filterState.timePeriod === 'quarter' ? 'Last quarter' :
               'Last year'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalOrders()}</div>
            <p className="text-xs text-muted-foreground">
              {filterState.timePeriod === 'today' ? 'Today' : 
               filterState.timePeriod === '7d' ? 'Last 7 days' :
               filterState.timePeriod === '30d' ? 'Last 30 days' :
               filterState.timePeriod === 'quarter' ? 'Last quarter' :
               'Last year'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{getAverageOrderValue().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {filterState.timePeriod === 'today' ? 'Today' : 
               filterState.timePeriod === '7d' ? 'Last 7 days' :
               filterState.timePeriod === '30d' ? 'Last 30 days' :
               filterState.timePeriod === 'quarter' ? 'Last quarter' :
               'Last year'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Daily revenue over time (with 7-day moving average)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enhancedStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={date => date} />
                <YAxis tickFormatter={v => `₹${v.toLocaleString()}`} />
                <Tooltip
                  formatter={(_, name, props) => {
                    if (name === 'total') return [`₹${props.payload.total.toFixed(2)}`, 'Revenue']
                    if (name === 'movingAvg') return [`₹${props.payload.movingAvg.toFixed(2)}`, '7d Avg']
                    if (name === 'orderCount') return [props.payload.orderCount, 'Orders']
                    if (name === 'averageOrderValue') return [`₹${props.payload.averageOrderValue.toFixed(2)}`, 'Avg Order Value']
                    return _
                  }}
                  labelFormatter={label => `Date: ${label}`}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="bg-white rounded shadow p-3 text-xs space-y-1">
                        <div><b>{label}</b></div>
                        <div>Revenue: <b>₹{d.total.toFixed(2)}</b></div>
                        <div>7d Avg: <b>₹{d.movingAvg.toFixed(2)}</b></div>
                        <div>Orders: <b>{d.orderCount}</b></div>
                        <div>Avg Order Value: <b>₹{d.averageOrderValue.toFixed(2)}</b></div>
                      </div>
                    )
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={<CustomDot />}
                  activeDot={{ r: 7 }}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="movingAvg"
                  stroke="#f59e42"
                  strokeWidth={2}
                  dot={false}
                  name="7d Avg"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Volume</CardTitle>
          <CardDescription>Daily order count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="orderCount" 
                  fill="#2563eb" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FinancialDashboard 