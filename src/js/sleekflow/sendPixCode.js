const axios = require('axios');
require('dotenv').config();
const fs = require('fs');
const selectOrders = require('../../database/selectPixOrders');
const updateSendLabel = require('../../database/updateSendLabel')

async function toSleekflowFormat() {
  try {
    let jsonFormat = [];
    const pixOrders = await selectOrders()
    if (pixOrders.length > 0) {
      // console.log(pixOrders)

      pixOrders.forEach((row) => {
        const phone = row.phone;
        const qr_code = row.qr_code;
        const email = row.email;

        jsonFormat.push({ email, phoneNumber: phone, addLabels: ["pixOrder"], userProfileFields: [{ customFieldId: 'Pix Code', customFieldName: "Pix Code", customValue: qr_code }, { customFieldId: 'Payment Method', customFieldName: "Payment Method", customValue: 'pix' }] });
      });

      return jsonFormat
    }
    return jsonFormat


  } catch (error) {
    console.error(error)
  }
}

function dumpSendedOrders(data) {
  fs.writeFile('contatosUpdateds.json', JSON.stringify(data, null, 2), 'utf-8', (err) => {
    if (err) {
      console.error('Error while writing the file:', err);
    } else {
      console.log('JSON file saved successfully!');
    }
  })
}

async function sendPixCode() {

  const jsonFormatData = await toSleekflowFormat()
  if (jsonFormatData.length > 0) {
    dumpSendedOrders(jsonFormatData)
    const postEtiqueta = await addOrUpdatePost(jsonFormatData)

    if (postEtiqueta === "OK") {
      updateSendLabel(jsonFormatData)//TODO

    } else if (postEtiqueta.erro.code === 400) {

      console.log('Ocorreu um erro ao enviar um contato, tentando um a um')

      try {
        jsonFormatData.forEach(async (contact) => {

          // addOrUpdateUnique([contact])
          const addOneByOne = await addOrUpdatePost([contact])

          if (addOneByOne === "OK") {
            updateSendLabel(jsonFormatData)//TODO

          } else if (addOneByOne.erro.code === 400) {
            console.log(addOneByOne)
          }
        })

      } catch (error) {
        console.error(error)
        fs.writeFile('ContactNotSented.txt', JSON.stringify(error, null, 2), 'utf-8', (err) => {
          if (err) {
            console.error('Error saving the error:', err);
          } else {
            console.log('erro salvo com sucesso!');
          }
        })

      }
    }
  }
  return
}


async function addOrUpdatePost(data) {
  const options = {
    method: 'POST',
    url: 'https://api.sleekflow.io/api/contact/addOrUpdate',
    params: { apikey: process.env.SLEEKFLOW_TOKEN },
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    data: data,
  }

  try {
    const { data } = await axios.request(options);

    console.log(data);
    console.log('The labels have been sented!')
    return "OK"

  } catch (error) {
    console.log(error)
    return { erro: error.response.data, data }
  }

}

module.exports = { sendPixCode }