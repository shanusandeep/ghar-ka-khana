import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ordersApi, customersApi } from '@/services/api'
import { Order, OrderItem, Customer } from '@/config/supabase'

// Extended Order interface that includes order_items from the API join
interface OrderWithItems extends Order {
  order_items?: OrderItem[]
}
import { format, subDays, startOfDay, endOfDay, parseISO, subMonths, subQuarters, subYears, startOfMonth, startOfQuarter, startOfYear, endOfMonth } from 'date-fns'
import { DollarSign, TrendingUp, Package, Calendar, Filter, Download, FileText, FileSpreadsheet, Heart, Clock } from 'lucide-react'
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import FinancialAnalytics from './FinancialAnalytics'

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
  customStartDate?: string
  customEndDate?: string
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
  const [activeTab, setActiveTab] = useState('overview')
  const [tipModalOpen, setTipModalOpen] = useState(false)
  const [pendingModalOpen, setPendingModalOpen] = useState(false)
  const [ordersModalOpen, setOrdersModalOpen] = useState(false)
  const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [statusOrdersModalOpen, setStatusOrdersModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('')

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
      const data = await customersApi.getAllWithOrderTotals()
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

    // Filter by order status - only include paid orders for revenue
    filteredOrders = filteredOrders.filter(order => order.status === 'paid')

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
      case 'thisMonth':
        startDate = startOfMonth(today)
        break
      case 'lastMonth':
        const lastMonth = subMonths(today, 1)
        startDate = startOfMonth(lastMonth)
        endDate = endOfMonth(lastMonth)
        break
      case 'thisQuarter':
        startDate = startOfQuarter(today)
        break
      case 'thisYear':
        startDate = startOfYear(today)
        break
      case 'quarter':
        startDate = subQuarters(today, 1)
        break
      case 'year':
        startDate = subYears(today, 1)
        break
      case 'custom':
        if (filterState.customStartDate && filterState.customEndDate) {
          startDate = parseISO(filterState.customStartDate)
          endDate = parseISO(filterState.customEndDate)
        } else {
          startDate = subDays(today, 6) // Default to 7 days if custom dates not set
        }
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
    setFilterState({ 
      timePeriod: '7d',
      customStartDate: undefined,
      customEndDate: undefined 
    })
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

  const getTotalTips = () => {
    let filteredOrders = [...orders]

    // Filter by order status - only include paid orders for tip calculations
    filteredOrders = filteredOrders.filter(order => order.status === 'paid')

    // Apply filters
    if (filterState.customerId) {
      filteredOrders = filteredOrders.filter(order => order.customer_id === filterState.customerId)
    }

    // Apply time filters
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (filterState.timePeriod) {
      case 'today':
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        break
      case '7d':
        startDate = subDays(now, 7)
        break
      case '30d':
        startDate = subDays(now, 30)
        break
      case 'thisMonth':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case 'lastMonth':
        startDate = startOfMonth(subMonths(now, 1))
        endDate = endOfMonth(subMonths(now, 1))
        break
      case 'thisQuarter':
        startDate = startOfQuarter(now)
        break
      case 'thisYear':
        startDate = startOfYear(now)
        break
      case 'quarter':
        startDate = startOfQuarter(subQuarters(now, 1))
        endDate = endOfMonth(subQuarters(now, 1))
        break
      case 'year':
        startDate = startOfYear(subYears(now, 1))
        endDate = endOfMonth(subYears(now, 1))
        break
      case 'custom':
        if (filterState.customStartDate && filterState.customEndDate) {
          startDate = startOfDay(parseISO(filterState.customStartDate))
          endDate = endOfDay(parseISO(filterState.customEndDate))
        } else {
          startDate = subDays(now, 7)
        }
        break
      default:
        startDate = subDays(now, 7)
    }

    filteredOrders = filteredOrders.filter(order => {
      const deliveryDate = parseISO(order.delivery_date)
      return deliveryDate >= startDate && deliveryDate <= endDate
    })

    return filteredOrders.reduce((sum, order) => sum + (order.tip_amount || 0), 0)
  }

  const getOrdersWithTips = () => {
    let filteredOrders = [...orders]

    // Filter by order status - only include paid orders for tip calculations
    filteredOrders = filteredOrders.filter(order => order.status === 'paid')

    // Apply same filters as getTotalTips
    if (filterState.customerId) {
      filteredOrders = filteredOrders.filter(order => order.customer_id === filterState.customerId)
    }

    // Apply time filters (same logic as getTotalTips)
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (filterState.timePeriod) {
      case 'today':
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        break
      case '7d':
        startDate = subDays(now, 7)
        break
      case '30d':
        startDate = subDays(now, 30)
        break
      case 'thisMonth':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case 'lastMonth':
        startDate = startOfMonth(subMonths(now, 1))
        endDate = endOfMonth(subMonths(now, 1))
        break
      case 'thisQuarter':
        startDate = startOfQuarter(now)
        break
      case 'thisYear':
        startDate = startOfYear(now)
        break
      case 'quarter':
        startDate = startOfQuarter(subQuarters(now, 1))
        endDate = endOfMonth(subQuarters(now, 1))
        break
      case 'year':
        startDate = startOfYear(subYears(now, 1))
        endDate = endOfMonth(subYears(now, 1))
        break
      case 'custom':
        if (filterState.customStartDate && filterState.customEndDate) {
          startDate = startOfDay(parseISO(filterState.customStartDate))
          endDate = endOfDay(parseISO(filterState.customEndDate))
        } else {
          startDate = subDays(now, 7)
        }
        break
      default:
        startDate = subDays(now, 7)
    }

    filteredOrders = filteredOrders.filter(order => {
      const deliveryDate = parseISO(order.delivery_date)
      return deliveryDate >= startDate && deliveryDate <= endDate
    })

    return filteredOrders.filter(order => order.tip_amount && order.tip_amount > 0).length
  }

  const getAverageTip = () => {
    const ordersWithTips = getOrdersWithTips()
    const totalTips = getTotalTips()
    return ordersWithTips > 0 ? totalTips / ordersWithTips : 0
  }

  const getPendingRevenue = () => {
    let filteredOrders = [...orders]

    // Filter by order status - include all non-paid orders (received, delivered, and any future status)
    filteredOrders = filteredOrders.filter(order => order.status !== 'paid')

    // Apply customer filter only (no time period filter for pending revenue)
    if (filterState.customerId) {
      filteredOrders = filteredOrders.filter(order => order.customer_id === filterState.customerId)
    }

    // For pending revenue, we want ALL unpaid orders regardless of delivery date
    // since these represent future revenue obligations

    return filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  }

  const getPendingOrdersCount = () => {
    let filteredOrders = [...orders]

    // Filter by order status - include all non-paid orders (received, delivered, and any future status)
    filteredOrders = filteredOrders.filter(order => order.status !== 'paid')

    // Apply customer filter only (no time period filter for pending orders count)
    if (filterState.customerId) {
      filteredOrders = filteredOrders.filter(order => order.customer_id === filterState.customerId)
    }

    // For pending orders count, we want ALL unpaid orders regardless of delivery date
    // since these represent future obligations

    return filteredOrders.length
  }

  const handleOrderClick = (order: OrderWithItems) => {
    setSelectedOrder(order)
    setOrderDetailsModalOpen(true)
  }

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status)
    setStatusOrdersModalOpen(true)
  }

  const getTopItemsBySales = () => {
    let filteredOrders = [...orders]

    // Filter by order status - only include paid orders for sales analytics
    filteredOrders = filteredOrders.filter(order => order.status === 'paid')

    // Apply filters
    if (filterState.customerId) {
      filteredOrders = filteredOrders.filter(order => order.customer_id === filterState.customerId)
    }
    if (filterState.itemId) {
      filteredOrders = filteredOrders.filter(order => 
        order.order_items?.some(item => item.menu_item_id === filterState.itemId)
      )
    }

    // Apply date range filter
    const today = new Date()
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
      case 'thisMonth':
        startDate = startOfMonth(today)
        break
      case 'lastMonth':
        const lastMonth = subMonths(today, 1)
        startDate = startOfMonth(lastMonth)
        endDate = endOfMonth(lastMonth)
        break
      case 'thisQuarter':
        startDate = startOfQuarter(today)
        break
      case 'thisYear':
        startDate = startOfYear(today)
        break
      case 'quarter':
        startDate = subQuarters(today, 1)
        break
      case 'year':
        startDate = subYears(today, 1)
        break
      case 'custom':
        if (filterState.customStartDate && filterState.customEndDate) {
          startDate = parseISO(filterState.customStartDate)
          endDate = parseISO(filterState.customEndDate)
        } else {
          startDate = subDays(today, 6)
        }
        break
      default:
        startDate = subDays(today, 6)
    }

    filteredOrders = filteredOrders.filter(order => {
      const orderDate = parseISO(order.delivery_date)
      return orderDate >= startDate && orderDate <= endDate
    })

    // Calculate item sales
    const itemSales: { [key: string]: { name: string; totalSales: number; quantity: number } } = {}
    
    filteredOrders.forEach(order => {
      order.order_items?.forEach(item => {
        const key = item.item_name
        if (!itemSales[key]) {
          itemSales[key] = {
            name: item.item_name,
            totalSales: 0,
            quantity: 0
          }
        }
        itemSales[key].totalSales += item.total_price
        itemSales[key].quantity += item.quantity
      })
    })

    // Sort by total sales and return top 5
    return Object.values(itemSales)
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5)
  }

  // Export functions
  const exportToCSV = () => {
    const headers = ['Date', 'Revenue ($)', 'Order Count', 'Average Order Value ($)', '7-Day Moving Average ($)']
    const enhancedData = calculateMovingAverage(dailyStats)
    
    const csvContent = [
      headers.join(','),
      ...enhancedData.map(row => [
        `"${row.date}"`,
        row.total.toFixed(2),
        row.orderCount,
        row.averageOrderValue.toFixed(2),
        row.movingAvg.toFixed(2)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `financial-report-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    const enhancedData = calculateMovingAverage(dailyStats)
    const timePeriodLabel = filterState.timePeriod === 'today' ? 'Today' : 
                           filterState.timePeriod === '7d' ? 'Last 7 days' :
                           filterState.timePeriod === '30d' ? 'Last 30 days' :
                           filterState.timePeriod === 'thisMonth' ? 'This month' :
                           filterState.timePeriod === 'lastMonth' ? 'Last month' :
                           filterState.timePeriod === 'thisQuarter' ? 'This quarter' :
                           filterState.timePeriod === 'thisYear' ? 'This year' :
                           filterState.timePeriod === 'quarter' ? 'Last quarter' : 
                           filterState.timePeriod === 'year' ? 'Last year' :
                           filterState.timePeriod === 'custom' ? 'Custom range' : 'Last 7 days'
    
    // Create HTML content for PDF
    const htmlContent = `
      <html>
        <head>
          <title>Financial Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { display: flex; justify-content: space-around; margin-bottom: 30px; }
            .summary-card { text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .summary-card h3 { margin: 0; color: #666; font-size: 14px; }
            .summary-card p { margin: 10px 0 0 0; font-size: 24px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .date-col { text-align: left; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Financial Dashboard Report</h1>
            <p>Period: ${timePeriodLabel}</p>
            <p>Generated on: ${format(new Date(), 'PPP')}</p>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Total Revenue</h3>
              <p>${getTotalRevenue().toFixed(2)}</p>
            </div>
            <div class="summary-card">
              <h3>Total Orders</h3>
              <p>${getTotalOrders()}</p>
            </div>
            <div class="summary-card">
              <h3>Average Order Value</h3>
              <p>${getAverageOrderValue().toFixed(2)}</p>
            </div>
            <div class="summary-card">
              <h3>Total Tips</h3>
              <p style="color: #16a34a;">${getTotalTips().toFixed(2)}</p>
              <small>${getOrdersWithTips()} orders with tips</small>
            </div>
            <div class="summary-card">
              <h3>Pending Revenue</h3>
              <p style="color: #ea580c;">${getPendingRevenue().toFixed(2)}</p>
              <small>${getPendingOrdersCount()} future orders</small>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="date-col">Date</th>
                <th>Revenue</th>
                <th>Orders</th>
                <th>Avg Order Value</th>
                <th>7-Day Moving Avg</th>
              </tr>
            </thead>
            <tbody>
              ${enhancedData.map(row => `
                <tr>
                  <td class="date-col">${row.date}</td>
                                <td>${row.total.toFixed(2)}</td>
              <td>${row.orderCount}</td>
              <td>${row.averageOrderValue.toFixed(2)}</td>
              <td>${row.movingAvg.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    // Open print dialog for PDF
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
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
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={exportToCSV}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={exportToPDF}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </Button>
              </div>
            </PopoverContent>
          </Popover>
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
                      <SelectItem value="thisMonth">This Month</SelectItem>
                      <SelectItem value="lastMonth">Last Month</SelectItem>
                      <SelectItem value="thisQuarter">This Quarter</SelectItem>
                      <SelectItem value="thisYear">This Year</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filterState.timePeriod === 'custom' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Start Date</label>
                        <Input
                          type="date"
                          value={filterState.customStartDate || ''}
                          onChange={(e) => handleFilterChange('customStartDate', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">End Date</label>
                        <Input
                          type="date"
                          value={filterState.customEndDate || ''}
                          onChange={(e) => handleFilterChange('customEndDate', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Card 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setOrdersModalOpen(true)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue & Orders</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${getTotalRevenue().toFixed(2)}</div>
                <div className="text-lg font-semibold text-blue-600 mt-1">{getTotalOrders()} orders</div>
                <p className="text-xs text-muted-foreground">
                  {filterState.timePeriod === 'today' ? 'Today' : 
                   filterState.timePeriod === '7d' ? 'Last 7 days' :
                   filterState.timePeriod === '30d' ? 'Last 30 days' :
                   filterState.timePeriod === 'thisMonth' ? 'This month' :
                   filterState.timePeriod === 'lastMonth' ? 'Last month' :
                   filterState.timePeriod === 'thisQuarter' ? 'This quarter' :
                   filterState.timePeriod === 'thisYear' ? 'This year' :
                   filterState.timePeriod === 'quarter' ? 'Last quarter' :
                   filterState.timePeriod === 'year' ? 'Last year' :
                   filterState.timePeriod === 'custom' ? 'Custom range' : 
                   'Last 7 days'}
                  <span className="block text-blue-600 mt-1">Click to view orders</span>
                </p>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setPendingModalOpen(true)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">${getPendingRevenue().toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {getPendingOrdersCount()} pending orders (all future orders)
                  <span className="block text-blue-600 mt-1">Click to view orders</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${getAverageOrderValue().toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {filterState.timePeriod === 'today' ? 'Today' : 
                   filterState.timePeriod === '7d' ? 'Last 7 days' :
                   filterState.timePeriod === '30d' ? 'Last 30 days' :
                   filterState.timePeriod === 'thisMonth' ? 'This month' :
                   filterState.timePeriod === 'lastMonth' ? 'Last month' :
                   filterState.timePeriod === 'thisQuarter' ? 'This quarter' :
                   filterState.timePeriod === 'thisYear' ? 'This year' :
                   filterState.timePeriod === 'quarter' ? 'Last quarter' :
                   filterState.timePeriod === 'year' ? 'Last year' :
                   filterState.timePeriod === 'custom' ? 'Custom range' : 
                   'Last 7 days'}
                </p>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setTipModalOpen(true)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${getTotalTips().toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {getOrdersWithTips()} orders with tips • Avg: ${getAverageTip().toFixed(2)}
                  <span className="block text-blue-600 mt-1">Click to view details</span>
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
                    <YAxis tickFormatter={v => `$${v.toLocaleString()}`} />
                    <Tooltip
                      formatter={(_, name, props) => {
                        if (name === 'total') return [`$${props.payload.total.toFixed(2)}`, 'Revenue']
                        if (name === 'movingAvg') return [`$${props.payload.movingAvg.toFixed(2)}`, '7d Avg']
                        if (name === 'orderCount') return [props.payload.orderCount, 'Orders']
                        if (name === 'averageOrderValue') return [`$${props.payload.averageOrderValue.toFixed(2)}`, 'Avg Order Value']
                        return _
                      }}
                      labelFormatter={label => `Date: ${label}`}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null
                        const d = payload[0].payload
                        return (
                          <div className="bg-white rounded shadow p-3 text-xs space-y-1">
                            <div><b>{label}</b></div>
                            <div>Revenue: <b>${d.total.toFixed(2)}</b></div>
                            <div>7d Avg: <b>${d.movingAvg.toFixed(2)}</b></div>
                            <div>Orders: <b>{d.orderCount}</b></div>
                            <div>Avg Order Value: <b>${d.averageOrderValue.toFixed(2)}</b></div>
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

          <Card>
            <CardHeader>
              <CardTitle>Top Items by Sales</CardTitle>
              <CardDescription>
                Items with highest sales amount for {
                  filterState.timePeriod === 'today' ? 'today' : 
                  filterState.timePeriod === '7d' ? 'last 7 days' :
                  filterState.timePeriod === '30d' ? 'last 30 days' :
                  filterState.timePeriod === 'thisMonth' ? 'this month' :
                  filterState.timePeriod === 'lastMonth' ? 'last month' :
                  filterState.timePeriod === 'thisQuarter' ? 'this quarter' :
                  filterState.timePeriod === 'thisYear' ? 'this year' :
                  filterState.timePeriod === 'quarter' ? 'last quarter' :
                  filterState.timePeriod === 'year' ? 'last year' :
                  filterState.timePeriod === 'custom' ? 'custom range' : 
                  'last 7 days'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTopItemsBySales().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No items found for the selected time period
                  </div>
                ) : (
                  getTopItemsBySales().map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.quantity} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${item.totalSales.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${(item.totalSales / item.quantity).toFixed(2)} avg
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <FinancialAnalytics 
            dailyStats={dailyStats}
            orders={orders}
            customers={customers}
            timePeriod={filterState.timePeriod}
            onStatusClick={handleStatusClick}
          />
        </TabsContent>
      </Tabs>

      {/* Tip Details Modal */}
      <Dialog open={tipModalOpen} onOpenChange={setTipModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Tip Details
            </DialogTitle>
            <DialogDescription>
              Individual tip transactions for {
                filterState.timePeriod === 'today' ? 'today' : 
                filterState.timePeriod === '7d' ? 'last 7 days' :
                filterState.timePeriod === '30d' ? 'last 30 days' :
                filterState.timePeriod === 'thisMonth' ? 'this month' :
                filterState.timePeriod === 'lastMonth' ? 'last month' :
                filterState.timePeriod === 'thisQuarter' ? 'this quarter' :
                filterState.timePeriod === 'thisYear' ? 'this year' :
                filterState.timePeriod === 'quarter' ? 'last quarter' :
                filterState.timePeriod === 'year' ? 'last year' :
                filterState.timePeriod === 'custom' ? 'custom range' : 
                'last 7 days'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            {(() => {
              // Filter orders with tips using the same logic as getTotalTips
              let filteredOrders = [...orders]

              // Filter by order status - only include paid orders for tip calculations
              filteredOrders = filteredOrders.filter(order => order.status === 'paid')

              // Apply filters
              if (filterState.customerId) {
                filteredOrders = filteredOrders.filter(order => order.customer_id === filterState.customerId)
              }

              // Apply time filters (same logic as getTotalTips)
              const now = new Date()
              let startDate: Date
              let endDate: Date = now

              switch (filterState.timePeriod) {
                case 'today':
                  startDate = startOfDay(now)
                  endDate = endOfDay(now)
                  break
                case '7d':
                  startDate = subDays(now, 7)
                  break
                case '30d':
                  startDate = subDays(now, 30)
                  break
                case 'thisMonth':
                  startDate = startOfMonth(now)
                  endDate = endOfMonth(now)
                  break
                case 'lastMonth':
                  startDate = startOfMonth(subMonths(now, 1))
                  endDate = endOfMonth(subMonths(now, 1))
                  break
                case 'thisQuarter':
                  startDate = startOfQuarter(now)
                  break
                case 'thisYear':
                  startDate = startOfYear(now)
                  break
                case 'quarter':
                  startDate = startOfQuarter(subQuarters(now, 1))
                  endDate = endOfMonth(subQuarters(now, 1))
                  break
                case 'year':
                  startDate = startOfYear(subYears(now, 1))
                  endDate = endOfMonth(subYears(now, 1))
                  break
                case 'custom':
                  if (filterState.customStartDate && filterState.customEndDate) {
                    startDate = startOfDay(parseISO(filterState.customStartDate))
                    endDate = endOfDay(parseISO(filterState.customEndDate))
                  } else {
                    startDate = subDays(now, 7)
                  }
                  break
                default:
                  startDate = subDays(now, 7)
              }

              filteredOrders = filteredOrders.filter(order => {
                const deliveryDate = parseISO(order.delivery_date)
                return deliveryDate >= startDate && deliveryDate <= endDate
              })

              const ordersWithTips = filteredOrders
                .filter(order => order.tip_amount && order.tip_amount > 0)
                .sort((a, b) => new Date(b.delivery_date).getTime() - new Date(a.delivery_date).getTime())
                .slice(0, 50) // Show latest 50 tip transactions

              if (ordersWithTips.length === 0) {
                return (
                  <div className="text-center text-gray-500 py-8">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium">No tips found</p>
                    <p className="text-sm">No tip transactions for the selected period</p>
                  </div>
                )
              }

              return (
                <>
                  <div className="flex items-center justify-between mb-4 p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-green-800">Total Tips: ${getTotalTips().toFixed(2)}</p>
                      <p className="text-sm text-green-600">
                        {ordersWithTips.length} transactions • Average: ${getAverageTip().toFixed(2)}
                      </p>
                    </div>
                    <Heart className="w-8 h-8 text-green-600" />
                  </div>
                  
                                     {ordersWithTips.map((order) => {
                     const customer = customers.find(c => c.id === order.customer_id)
                     const deliveryDate = parseISO(order.delivery_date)
                     const deliveryTime = order.delivery_time
                     
                     return (
                       <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                         <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                             <Heart className="w-5 h-5 text-green-600" />
                           </div>
                           <div>
                             <p className="font-medium text-gray-900">
                               {customer ? customer.name : 'Unknown Customer'}
                             </p>
                             <div className="flex items-center space-x-3 text-sm text-gray-600">
                               <span>Order #{order.order_number || order.id?.slice(0, 8)}</span>
                               <span>•</span>
                               <span>{format(deliveryDate, 'MMM dd, yyyy')}</span>
                               <span>•</span>
                               <span>{deliveryTime || format(deliveryDate, 'hh:mm a')}</span>
                             </div>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="text-lg font-bold text-green-600">
                             +${(order.tip_amount || 0).toFixed(2)}
                           </p>
                           <p className="text-xs text-gray-500">
                             Order: ${((order.total_amount || 0) - (order.tip_amount || 0)).toFixed(2)}
                           </p>
                         </div>
                       </div>
                     )
                   })}
                  
                  {filteredOrders.filter(order => order.tip_amount && order.tip_amount > 0).length > 50 && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-500">
                        Showing latest 50 of {filteredOrders.filter(order => order.tip_amount && order.tip_amount > 0).length} tip transactions
                      </p>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Pending Orders Modal */}
      <Dialog open={pendingModalOpen} onOpenChange={setPendingModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Pending Orders
            </DialogTitle>
            <DialogDescription>
              All orders that are not yet paid (upcoming revenue obligations)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {(() => {
              let filteredOrders = [...orders]
              // Include all non-paid orders
              filteredOrders = filteredOrders.filter(order => order.status !== 'paid')

              // Apply customer filter only (no time period filter for pending orders)
              if (filterState.customerId) {
                filteredOrders = filteredOrders.filter(order => order.customer_id === filterState.customerId)
              }

              // For pending orders modal, we show ALL unpaid orders regardless of delivery date
              // since these represent future revenue obligations

              // Sort by delivery date ascending
              filteredOrders.sort((a, b) => new Date(a.delivery_date).getTime() - new Date(b.delivery_date).getTime())

              if (filteredOrders.length === 0) {
                return (
                  <div className="text-center text-gray-500 py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium">No pending orders</p>
                    <p className="text-sm">No non-paid orders for the selected period</p>
                  </div>
                )
              }

              return (
                <>
                  <div className="flex items-center justify-between mb-4 p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-orange-800">Pending Revenue: ${getPendingRevenue().toFixed(2)}</p>
                      <p className="text-sm text-orange-600">
                        {filteredOrders.length} pending orders
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>

                  {filteredOrders.map((order) => {
                    const customer = customers.find(c => c.id === order.customer_id)
                    const deliveryDate = parseISO(order.delivery_date)
                    const deliveryTime = order.delivery_time
                    return (
                      <div 
                        key={order.id} 
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleOrderClick(order)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Clock className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {customer ? customer.name : 'Unknown Customer'}
                            </p>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <span>Order #{order.order_number || order.id?.slice(0, 8)}</span>
                              <span>•</span>
                              <span>{format(deliveryDate, 'MMM dd, yyyy')}</span>
                              <span>•</span>
                              <span>{deliveryTime || format(deliveryDate, 'hh:mm a')}</span>
                              <span>•</span>
                              <span className="capitalize">{order.status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-600">
                            ${ (order.total_amount || 0).toFixed(2) }
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Click for details</p>
                        </div>
                      </div>
                    )
                  })}
                </>
              )
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* All Orders Modal */}
      <Dialog open={ordersModalOpen} onOpenChange={setOrdersModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              All Orders
            </DialogTitle>
            <DialogDescription>
              Complete list of paid orders for the selected period
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {(() => {
              let filteredOrders = [...orders]
              
              // Include only paid orders for completed orders modal
              filteredOrders = filteredOrders.filter(order => order.status === 'paid')

              // Apply filters
              if (filterState.customerId) {
                filteredOrders = filteredOrders.filter(order => order.customer_id === filterState.customerId)
              }

              // Apply time filters (same logic as getTotalRevenue)
              const now = new Date()
              let startDate: Date
              let endDate: Date = now

              switch (filterState.timePeriod) {
                case 'today':
                  startDate = startOfDay(now)
                  endDate = endOfDay(now)
                  break
                case '7d':
                  startDate = subDays(now, 7)
                  break
                case '30d':
                  startDate = subDays(now, 30)
                  break
                case 'thisMonth':
                  startDate = startOfMonth(now)
                  endDate = endOfMonth(now)
                  break
                case 'lastMonth':
                  startDate = startOfMonth(subMonths(now, 1))
                  endDate = endOfMonth(subMonths(now, 1))
                  break
                case 'thisQuarter':
                  startDate = startOfQuarter(now)
                  break
                case 'thisYear':
                  startDate = startOfYear(now)
                  break
                case 'quarter':
                  startDate = startOfQuarter(subQuarters(now, 1))
                  endDate = endOfMonth(subQuarters(now, 1))
                  break
                case 'year':
                  startDate = startOfYear(subYears(now, 1))
                  endDate = endOfMonth(subYears(now, 1))
                  break
                case 'custom':
                  if (filterState.customStartDate && filterState.customEndDate) {
                    startDate = startOfDay(parseISO(filterState.customStartDate))
                    endDate = endOfDay(parseISO(filterState.customEndDate))
                  } else {
                    startDate = subDays(now, 7)
                  }
                  break
                default:
                  startDate = subDays(now, 7)
              }

              filteredOrders = filteredOrders.filter(order => {
                const deliveryDate = parseISO(order.delivery_date)
                return deliveryDate >= startDate && deliveryDate <= endDate
              })

              // Sort by delivery date descending (most recent first)
              filteredOrders.sort((a, b) => new Date(b.delivery_date).getTime() - new Date(a.delivery_date).getTime())

              if (filteredOrders.length === 0) {
                return (
                  <div className="text-center text-gray-500 py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium">No orders found</p>
                    <p className="text-sm">No paid orders for the selected period</p>
                  </div>
                )
              }

              return (
                <>
                  <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-blue-800">Total Revenue: ${getTotalRevenue().toFixed(2)}</p>
                      <p className="text-sm text-blue-600">
                        {filteredOrders.length} completed orders
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>

                  {filteredOrders.map((order) => {
                    const customer = customers.find(c => c.id === order.customer_id)
                    const deliveryDate = parseISO(order.delivery_date)
                    const deliveryTime = order.delivery_time
                    return (
                      <div 
                        key={order.id} 
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleOrderClick(order)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {customer ? customer.name : 'Unknown Customer'}
                            </p>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <span>Order #{order.order_number || order.id?.slice(0, 8)}</span>
                              <span>•</span>
                              <span>{format(deliveryDate, 'MMM dd, yyyy')}</span>
                              <span>•</span>
                              <span>{deliveryTime || format(deliveryDate, 'hh:mm a')}</span>
                              <span>•</span>
                              <span className="capitalize text-green-600 font-medium">{order.status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            ${ (order.total_amount || 0).toFixed(2) }
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Click for details</p>
                        </div>
                      </div>
                    )
                  })}
                </>
              )
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      <Dialog open={orderDetailsModalOpen} onOpenChange={setOrderDetailsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              Order Details
            </DialogTitle>
            <DialogDescription>
              Complete order information and item breakdown
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Order Header */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{selectedOrder.order_number || selectedOrder.id?.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {(() => {
                        const customer = customers.find(c => c.id === selectedOrder.customer_id)
                        return customer ? customer.name : 'Unknown Customer'
                      })()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">
                      ${(selectedOrder.total_amount || 0).toFixed(2)}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedOrder.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Delivery Date:</span>
                    <p className="font-medium">{format(parseISO(selectedOrder.delivery_date), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Delivery Time:</span>
                    <p className="font-medium">{selectedOrder.delivery_time || format(parseISO(selectedOrder.delivery_date), 'hh:mm a')}</p>
                  </div>
                  {selectedOrder.delivery_address && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Delivery Address:</span>
                      <p className="font-medium">{selectedOrder.delivery_address}</p>
                    </div>
                  )}
                  {selectedOrder.special_instructions && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Special Instructions:</span>
                      <p className="font-medium">{selectedOrder.special_instructions}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h4>
                {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrder.order_items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.item_name}</p>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span>Qty: {item.quantity}</span>
                            <span>•</span>
                            <span className="capitalize">{item.size_type?.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>${(item.unit_price || 0).toFixed(2)} each</span>
                          </div>
                          {item.special_instructions && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              Note: {item.special_instructions}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ${(item.total_price || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p>No order items found</p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      ${((selectedOrder.total_amount || 0) - (selectedOrder.discount_amount || 0) - (selectedOrder.tip_amount || 0)).toFixed(2)}
                    </span>
                  </div>
                  {selectedOrder.discount_amount && selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${selectedOrder.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.tip_amount && selectedOrder.tip_amount > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Tip:</span>
                      <span>+${selectedOrder.tip_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${(selectedOrder.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              {(() => {
                const customer = customers.find(c => c.id === selectedOrder.customer_id)
                if (customer) {
                  return (
                    <div className="border-t pt-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Name:</span>
                            <p className="font-medium">{customer.name}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Phone:</span>
                            <p className="font-medium">{customer.phone}</p>
                          </div>
                          {customer.email && (
                            <div className="col-span-2">
                              <span className="text-gray-500">Email:</span>
                              <p className="font-medium">{customer.email}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Orders Modal */}
      <Dialog open={statusOrdersModalOpen} onOpenChange={setStatusOrdersModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500" />
              {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Orders
            </DialogTitle>
            <DialogDescription>
              Complete list of {selectedStatus.toLowerCase()} orders for the selected period
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {(() => {
              let filteredOrders = [...orders]
              
              // Filter by selected status
              filteredOrders = filteredOrders.filter(order => order.status === selectedStatus)

              // Apply time filters (same logic as FinancialAnalytics)
              const now = new Date()
              let startDate: Date
              let endDate: Date = now

              switch (filterState.timePeriod) {
                case 'today':
                  startDate = startOfDay(now)
                  endDate = endOfDay(now)
                  break
                case '7d':
                  startDate = subDays(now, 7)
                  break
                case '30d':
                  startDate = subDays(now, 30)
                  break
                case 'thisMonth':
                  startDate = startOfMonth(now)
                  endDate = endOfMonth(now)
                  break
                case 'lastMonth':
                  startDate = startOfMonth(subMonths(now, 1))
                  endDate = endOfMonth(subMonths(now, 1))
                  break
                case 'thisQuarter':
                  startDate = startOfQuarter(now)
                  break
                case 'thisYear':
                  startDate = startOfYear(now)
                  break
                case 'quarter':
                  startDate = startOfQuarter(subQuarters(now, 1))
                  endDate = endOfMonth(subQuarters(now, 1))
                  break
                case 'year':
                  startDate = startOfYear(subYears(now, 1))
                  endDate = endOfMonth(subYears(now, 1))
                  break
                case 'custom':
                  if (filterState.customStartDate && filterState.customEndDate) {
                    startDate = startOfDay(parseISO(filterState.customStartDate))
                    endDate = endOfDay(parseISO(filterState.customEndDate))
                  } else {
                    startDate = subDays(now, 7)
                  }
                  break
                default:
                  startDate = subDays(now, 7)
              }

              filteredOrders = filteredOrders.filter(order => {
                const deliveryDate = parseISO(order.delivery_date)
                return deliveryDate >= startDate && deliveryDate <= endDate
              })

              // Sort by delivery date descending (most recent first)
              filteredOrders.sort((a, b) => new Date(b.delivery_date).getTime() - new Date(a.delivery_date).getTime())

              if (filteredOrders.length === 0) {
                return (
                  <div className="text-center text-gray-500 py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium">No {selectedStatus.toLowerCase()} orders found</p>
                    <p className="text-sm">No {selectedStatus.toLowerCase()} orders for the selected period</p>
                  </div>
                )
              }

              return (
                <>
                  <div className="flex items-center justify-between mb-4 p-3 bg-indigo-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-indigo-800">
                        {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Orders: {filteredOrders.length}
                      </p>
                      <p className="text-sm text-indigo-600">
                        Total Amount: ${filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toFixed(2)}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-indigo-600" />
                  </div>

                  {filteredOrders.map((order) => {
                    const customer = customers.find(c => c.id === order.customer_id)
                    const deliveryDate = parseISO(order.delivery_date)
                    const deliveryTime = order.delivery_time
                    return (
                      <div 
                        key={order.id} 
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleOrderClick(order)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {customer ? customer.name : 'Unknown Customer'}
                            </p>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <span>Order #{order.order_number || order.id?.slice(0, 8)}</span>
                              <span>•</span>
                              <span>{format(deliveryDate, 'MMM dd, yyyy')}</span>
                              <span>•</span>
                              <span>{deliveryTime || format(deliveryDate, 'hh:mm a')}</span>
                              <span>•</span>
                              <span className={`capitalize font-medium ${
                                selectedStatus === 'paid' ? 'text-green-600' : 
                                selectedStatus === 'received' ? 'text-blue-600' : 
                                'text-orange-600'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-indigo-600">
                            ${(order.total_amount || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Click for details</p>
                        </div>
                      </div>
                    )
                  })}
                </>
              )
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FinancialDashboard
