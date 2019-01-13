/*const IOTA = require('iota.lib.js');
const iota = new IOTA({ provider: 'https://pow2.iota.community:443' });
*/
const config = require('../config.json');
const Iota = require('@iota/core');
const iota = Iota.composeAPI({ provider: 'http://' + config.compass.ip + ':14265' });
//const iota = Iota.composeAPI({ provider: 'https://nodes.devnet.iota.org:443' });
const Converter = require('@iota/converter');

const getNodeInfo = async () => {
  return new Promise((resolve, reject) => {
    iota.getNodeInfo()
      .then(info => resolve(info))
      .catch(err => reject(err));
  });
};

const prepareTransfer = async (transfer, ret) => {
  console.time("prepareTransfer");
    const transfers = [{
        address: transfer.to,
        value: parseInt(transfer.value),
        tag: '', // optional tag of `0-27` trytes
        message: Converter.asciiToTrytes(transfer.message) // optional message in trytes
    }]

    const depth = 3

    // Difficulty of Proof-of-Work required to attach transaction to tangle.
    // Minimum value on mainnet & spamnet is `14`, `9` on devnet and other testnets.
    const minWeightMagnitude = transfer.difficulty;

    const inputs = await iota.getInputs(transfer.seed);
    try{
        iota.prepareTransfers(transfer.seed, transfers , inputs)
        .then(trytes => {
            console.timeEnd("prepareTransfer");
            return iota.sendTrytes(trytes, depth, minWeightMagnitude);
        })
        .then(bundle => {
            console.log(bundle);
            ret(bundle[0].hash,null);
        })
        .catch(err => {
            ret(null,err);
        })
    }catch(err){
        ret(null,err);
    }
};


const getBalances = async (addresses) => {
  return new Promise((resolve, reject) => {
    iota.getBalances(addresses, 100)
      .then(({ balances }) => {
        resolve(balances);
      })
      .catch(err => {
        reject(err);
      })
  });
};

const transfer = async (seed, value, receivingAddress, message, addresses, wm) => {
  let balances = await getBalances(addresses);
  return new Promise((resolve, reject) => {
    let messageTrytes = Converter.asciiToTrytes(message);
    let transfers = [
      {
      value: value,
      address: receivingAddress,
      message: messageTrytes,
      tag: "PLATOONING"
      }
    ];
    let index = 0;
    let indexI = 0;
    for(let i = 0; i < balances.length; i++) {
      if(balances[i] == 0){
        index = i;
        break;
      }
    }
    if(index == 0)
      indexI = 1;

    let options = {
      inputs: [
        {
          address: addresses[indexI],
          keyIndex: indexI,
          security: 2,
          balance: balances[indexI]
        }
      ],
      remainderAddress: addresses[index],
      security: 2
    };
    console.time("prepareTransfers");
    iota.prepareTransfers(seed, transfers, options)
      .then(trytes => {console.timeEnd("prepareTransfers"); return iota.sendTrytes(trytes, (depth = 3), (mwm = wm))})
      .then(bundle => {
        console.log(bundle);
        resolve(bundle);
      }).catch(err => {
        reject(err);
      });
  });
};

const getNewAddress = async (seed, nbr, amount) => {
  return new Promise((resolve, reject) => {
    iota.getNewAddress(seed, {index: nbr, returnAll: true, total: amount, security: 2})
      .then(address => {
        resolve(address);
      })
      .catch(err => {
        reject(err);
      });
 });
};


module.exports = {
  prepareTransfer,
  getNodeInfo,
  transfer,
  getBalances,
  getNewAddress,
  getMessageOfTransaction: function(hash, cb) {
    iota.getTrytes(hash)
    .then(trytes => {
      var ascii = Converter.trytesToAscii(trytes[0].substring(0, 2186));
      ascii = ascii.toString().replace(/\0/g, '');
      cb(ascii);
    })
    .catch(err => {
      throw err;
    })
  },

  getAccountData: function(seed, cb) {
    iota.getAccountData(seed, {
     start: 0,
     security: 2
    })
    .then(accountData => {
      cb(accountData);
      // ...
    })
    .catch(err => {
      // ...
    })
    }
};
