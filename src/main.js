const mainShopify = require('./js/shopify/getShopifyOrders');
const { sendPixCode } = require('./js/sleekflow/sendPixCode');

const checkSleekflow = async () => {
    try {
        console.log('Checking new orders in database...')
        await sendPixCode();
        console.log('Sleekflow Tasks Done!');
    } catch (err) {
        console.error('Error in Sleekflow:', err);
        setTimeout(mainProcess, 300000); // Espera 5 minutos e tenta novamente
    }
};

const callShopify = async () => {
    try {
        console.log('Calling Shopify Orders...');
        await mainShopify();
        console.log('Shopify Tasks Done!');
    } catch (err) {
        console.error('Error in Shopify:', err);
        setTimeout(mainProcess, 300000); // Espera 5 minutos e tenta novamente
    }
};

const mainProcess = async () => {
    try {
        await callShopify();
        await checkSleekflow();

        // Configura os loops após a execução inicial
        setInterval(callShopify, 300000);
        setInterval(checkSleekflow, 360000);
    } catch (err) {
        console.error('Main Process Error:', err);
        setTimeout(mainProcess, 300000); // Espera 5 minutos e tenta novamente
    }
};

mainProcess();
