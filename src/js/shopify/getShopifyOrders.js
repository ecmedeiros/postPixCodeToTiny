require('dotenv').config()
const axios = require('axios')
const fs = require('fs')
const insertTradeTable = require('../../database/insertTradeTables')

const jsonPath = '../src/json'
const accessToken = process.env.SHOPIFY_TOKEN
const shopifyDomain = process.env.DOMAIN

async function dumpJSON(data, archiveName, append) {
    const textJson = JSON.stringify(data)
    append ?
        fs.writeFile(`${jsonPath}/${archiveName}`, textJson, (err) => err ? console.error(err) : console.log('sucefully write shopJson.json'))
        :
        fs.writeFile(`${jsonPath}/${archiveName}`, textJson, (err) => err ? console.error(err) : console.log('sucefully append orders to shopJson.json'))
}

async function fetchOrders() {
    try {
        const since_id = getLastPage();

        const ordersUrl = `https://${shopifyDomain}/admin/api/2022-01/orders.json?limit=250&since_id=${since_id}`

        const config = {
            headers: {
                'X-Shopify-Access-Token': accessToken,
            },
        };

        const response = await axios.get(ordersUrl, config)
        const orders = response.data.orders;

        if (orders.length > 0) {
            const lastOrderId = orders[orders.length - 1].id;
            dumpJSON(lastOrderId, 'lastPage.json', false)
            return orders
        } else {
            return []
        }

    } catch (error) {
        console.error(error)
    }
}


function getLastPage() {
    try {
        const readedPage = fs.readFileSync(`${jsonPath}/lastPage.json`)
        return readedPage.toString()

    } catch (err) {
        console.error(err)
        return 'error'
    }
}

async function FilterPixOrders(orders) {
    const pix_orders = []

    orders.map(order => {

        // console.log(order.note_attributes)

        if (typeof order.note_attributes != 'undefined') {
            const notes = order.note_attributes

            notes.forEach(note => {
                if (note.name.includes('payment_qr_code') /*|| note.value.includes('pix')*/) {
                    const cleanedPhone = order.billing_address.phone.replace(/\D/g, '') || 'no_phone'; // \D pega tudo que não é dígito
                    const email = order.customer.email || 'no_email'
                    const order_number = order.order_number
                    const qr_code = note.value;

                    pix_orders.push({ order_number, qr_code, phone: cleanedPhone, email })

                };
            });
        }
    })

    const lastOrderId = orders[orders.length - 1].id;

    dumpJSON(orders, 'shopJson.json', true)
    dumpJSON(lastOrderId, 'lastPage.json', false)
    return pix_orders
}

async function savePixOrders(orders) {
    for (let order of orders) {
        insertTradeTable(order)
    }
}

//main
async function main() {
    const orders = await fetchOrders();
    if (orders.length > 0) {
        const pixOrders = await FilterPixOrders(orders)
        await savePixOrders(pixOrders)
    }
    return
}

module.exports = main