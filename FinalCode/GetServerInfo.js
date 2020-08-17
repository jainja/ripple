const fetch = require("node-fetch");
const fs = require('fs');
var csvWriter = require('csv-write-stream');

var update_loop = setInterval(Main, 1000);

const Url = 'http://s1.ripple.com:51234';
const Data = {
  "method": "server_info",
  "params": [
    {
      "api_version": 1
    }
  ]
};
//optional parameters
const otherPram = {
  headers: {
    'Accept': 'application/json',
    'content-type': 'application:json',
  },
  body: JSON.stringify(Data),
  method: "POST"
};
var ledgerLastUpdate = '';
var preLedgerSeqNumber = 0;
console.log(ledgerLastUpdate);
Main();
function Main() {
  fetch(Url, otherPram).then(data => { return data.json() }).then(function (data) {
    const ledgerTime = new Date(data.result.info.time);
    const ledgerSeqNumber = data.result.info.validated_ledger.seq;
    const preLedgerDuration = data.result.info.last_close.converge_time_s;

    if (ledgerLastUpdate == '') {
      ledgerLastUpdate = new Date();
      ledgerLastUpdate.setSeconds(ledgerLastUpdate.getSeconds() - preLedgerDuration);
      console.log(ledgerLastUpdate);
    }

    var writer = csvWriter({ sendHeaders: false }); //Instantiate var
    var csvFilename = "ServerInfo.csv";

    // If CSV file does not exist, create it and add the headers
    if (!fs.existsSync(csvFilename)) {
      writer = csvWriter({ sendHeaders: false });
      writer.pipe(fs.createWriteStream(csvFilename));
      writer.write({
        header1: 'TIME',
        header2: 'SEQUENCE NUMBER',
        header3: 'PROCESSING TIME'
      });
      writer.end();
    }

    if (preLedgerSeqNumber != ledgerSeqNumber) {
      // Append some data to CSV the file    
      if (ledgerLastUpdate != '') {
        // var date1 = new Date(ledgerTime); 
        var date2 = new Date(ledgerLastUpdate);

        var Difference_In_Time = ledgerTime.getTime() - date2.getTime();
        console.log(ledgerTime, date2, Difference_In_Time);

      }
      ledgerLastUpdate = ledgerTime;
      const ledgerDuration = Difference_In_Time;
      writer = csvWriter({ sendHeaders: false });
      writer.pipe(fs.createWriteStream(csvFilename, { flags: 'a' }));
      writer.write({
        header1: ledgerTime,
        header2: ledgerSeqNumber,
        header3: ledgerDuration
      });
      writer.end();
      preLedgerSeqNumber = ledgerSeqNumber;
    }
  })
}

function stopFunction() {
  clearInterval(update_loop); // stop the timer
}


