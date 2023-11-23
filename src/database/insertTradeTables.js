const pool = require('./db')

async function insertTradeTable(shopify_order) {
    try {

        const result = await pool.query(`

        CREATE TABLE IF NOT EXISTS ecommerce.pedidos_pix (
            id SERIAL PRIMARY KEY,
            order_number int unique,
            qr_code varchar(255),
            phone varchar(255),
            email varchar(255),
            enviada boolean
            );

        insert into ecommerce.pedidos_pix 
        (order_number,enviada,phone,qr_code,email)
        values 
        ('${shopify_order.order_number}',false,'${shopify_order.phone}','${shopify_order.qr_code}','${shopify_order.email}')
        
        `)

        // console.log('order inserted:', result)

    } catch (error) {

        if (error.code != '23505') {
            console.error(error)
        }
    }
}

module.exports = insertTradeTable