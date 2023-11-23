const pool = require('./db')

async function selectOrders() {
    const pixOrders = []
    const orders = await pool.query(`
    SELECT * FROM ecommerce.pedidos_pix where enviada != true
    `)

    // ordersWithoutEcommerceNumber.rows.forEach(order => {
    //     pixOrders.push(order.order_number)
    // })

    return orders.rows
    // return ordersWithoutEcommerceNumber.rows
}

module.exports = selectOrders