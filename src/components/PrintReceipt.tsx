
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { Order, OrderItem } from '@/config/supabase'

interface PrintReceiptProps {
  order: Order & { order_items?: OrderItem[] }
  onPrint?: () => void
}

const PrintReceipt = ({ order, onPrint }: PrintReceiptProps) => {
  const formatDate = (dateString: string) => {
    if (dateString.includes('T') || dateString.includes(' ')) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      const [year, month, day] = dateString.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      })
    }
  }

  const groupOrderItems = (items: OrderItem[]) => {
    const grouped = items.reduce((acc, item) => {
      const key = item.item_name
      if (!acc[key]) {
        acc[key] = {
          item_name: item.item_name,
          sizes: [],
          total_amount: 0
        }
      }
      
      acc[key].sizes.push({
        size_type: item.size_type,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      })
      acc[key].total_amount += item.total_price
      
      return acc
    }, {} as any)
    
    return Object.values(grouped)
  }

  const printReceipt = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt - ${order.order_number}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 20px;
            font-size: 12px;
            line-height: 1.4;
            max-width: 300px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .header h1 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
          }
          .header p {
            margin: 2px 0;
            font-size: 10px;
          }
          .order-info {
            margin-bottom: 15px;
          }
          .order-info div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .items {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
            margin-bottom: 10px;
          }
          .item {
            margin-bottom: 8px;
          }
          .item-name {
            font-weight: bold;
            margin-bottom: 2px;
          }
          .item-details {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            margin-left: 10px;
          }
          .totals {
            margin-top: 10px;
          }
          .totals div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .total-line {
            border-top: 1px solid #000;
            padding-top: 5px;
            font-weight: bold;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px dashed #000;
            font-size: 10px;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🍽️ Ghar Ka Khana</h1>
          <p>Homestyle Indian Cuisine</p>
          <p>📞 Contact: +91-XXXXXXXXXX</p>
        </div>

        <div class="order-info">
          <div><span>Order #:</span><span>${order.order_number}</span></div>
          <div><span>Date:</span><span>${formatDate(order.created_at)}</span></div>
          <div><span>Delivery:</span><span>${formatDate(order.delivery_date)}</span></div>
          ${order.delivery_time ? `<div><span>Time:</span><span>${order.delivery_time}</span></div>` : ''}
          <div><span>Customer:</span><span>${order.customer_name}</span></div>
          <div><span>Phone:</span><span>${order.customer_phone}</span></div>
          ${order.delivery_address ? `<div><span>Address:</span><span style="font-size: 10px;">${order.delivery_address}</span></div>` : ''}
        </div>

        <div class="items">
          ${order.order_items ? groupOrderItems(order.order_items).map((groupedItem: any) => `
            <div class="item">
              <div class="item-name">${groupedItem.item_name}</div>
              ${groupedItem.sizes.map((size: any) => `
                <div class="item-details">
                  <span>${size.quantity}x ${size.size_type.replace('_', ' ')}</span>
                                        <span>${size.total_price.toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          `).join('') : ''}
        </div>

        <div class="totals">
                      ${order.subtotal_amount ? `<div><span>Subtotal:</span><span>$${order.subtotal_amount.toFixed(2)}</span></div>` : ''}
          ${order.discount_amount && order.discount_amount > 0 ? `
                          <div><span>Discount (${order.discount_type === 'percentage' ? order.discount_value + '%' : '$' + order.discount_value}):</span><span>-$${order.discount_amount.toFixed(2)}</span></div>
          ` : ''}
          ${order.tip_amount && order.tip_amount > 0 ? `
                          <div><span>Tip:</span><span>+$${order.tip_amount.toFixed(2)}</span></div>
          ` : ''}
          <div class="total-line">
                          <span>TOTAL:</span><span>$${order.total_amount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        ${order.special_instructions ? `
          <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000;">
            <div style="font-weight: bold; margin-bottom: 5px;">Special Instructions:</div>
            <div style="font-size: 10px;">${order.special_instructions}</div>
          </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for choosing Ghar Ka Khana!</p>
          <p>🙏 Your satisfaction is our priority</p>
          <p>Generated: ${new Date().toLocaleString('en-IN')}</p>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
          onPrint?.()
        }, 500)
      }
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={printReceipt}
      className="flex items-center space-x-2"
    >
      <Printer className="w-4 h-4" />
      <span>Print Receipt</span>
    </Button>
  )
}

export default PrintReceipt
