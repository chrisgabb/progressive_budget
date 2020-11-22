const dbName = "Budget_DB"
const storeName = "transactionData"
const request = window.indexedDB.open(dbName, 1)

request.onerror = function (e) {
    console.log("Not able to use IndexDB. There was an error");
};

request.onupgradeneeded = function (e) {
    const db = e.target.result
    const objectStore = db.createObjectStore(storeName, { autoIncrement: true });
    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("value", "value", { unique: false });
}
request.onsuccess = function (e) {
    db = e.target.result;
    trx = db.transaction(storeName, "readwrite");
    store = trx.objectStore(storeName)
    getData()

    // db.onerror = function (e) {
    //     console.log("Ya dun messed up now!")
    // }


    // trx.oncomplete = function () {
    //     db.close();
    // };

    function getData() {
        // Get data from database when new req is made
        const trx2 = db.transaction([storeName], 'readwrite');
        const objStore = trx2.objectStore(storeName);
        const reqData = objStore.getAll();
        reqData.onsuccess = function () {
            if (reqData.result.length > 0) {
                fetch('/api/transaction/bulk', {
                    method: 'POST',
                    body: JSON.stringify(reqData.result),
                    headers: {
                        Accept: 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => response.json())
                    .then(() => {
                        const trx3 = db.transaction([storeName], 'readwrite');
                        const objectStore = trx3.objectStore(storeName);
                        objectStore.clear();
                    });
            };
        };
    };


};

