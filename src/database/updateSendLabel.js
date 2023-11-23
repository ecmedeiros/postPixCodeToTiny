const pool = require('./db')

async function updateSendLabel(orders) {
    try {
        orders.forEach(async order => {
            const email = order.email
            // console.log(order)
    
            const sendLabels = await pool.query(`
            UPDATE ecommerce.pedidos_pix SET enviada = true WHERE email ='${email}'
            `)
        });
    } catch (error) {
        console.error(error)
    }


}

module.exports = updateSendLabel