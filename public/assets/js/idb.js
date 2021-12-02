// create variable to hold db connection
let db;

// establish a connection to IndexedDB database called 'pizza_hunt' and set it to version 1.
const request = indexedDB.open('pizza_hunt', 1);

// This event only executes when the version of the database has changed or no database was 
// detected and needs to be created (nonexistant to version 1, v1 to v2, etc.).
request.onupgradeneeded = function (event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `new_pizza`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_pizza', { autoIncrement: true });
};

// upon a successful 
request.onsuccess = function (event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;

    // check if app is online, if yes run uploadPizza() function to send all local db data to api
    if (navigator.onLine) {
        uploadPizza();
    }
};

request.onerror = function (event) {
    // log error here
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new pizza and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    // access the object store for `new_pizza`
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    // add record to your store with add method
    pizzaObjectStore.add(record);
}

function uploadPizza() {
    // open a transaction on your db
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    // access your object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    // get all records from store and set to a variable
    const getAll = pizzaObjectStore.getAll();

    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function () {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.transaction(['new_pizza'], 'readwrite');
                    // access the new_pizza object store
                    const pizzaObjectStore = transaction.objectStore('new_pizza');
                    // clear all items in your store
                    pizzaObjectStore.clear();

                    alert('All saved pizza has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', uploadPizza);




// ---------------------------------Notes--------------------------------- //

// As part of the browser's window object, indexedDB is a global variable. 
// Thus, we could say window.indexedDB, but there's no need to.

// We create the request variable (line 5) to act as an event listener for the database. That event listener 
// is created when we open the connection to the database using the indexedDB.open() method.

// In IndexedDB, the container that stores the data is called an object store. 
// We can't create an object store until the connection to the database is open, 
// emitting an event that the request variable will be able to capture.

// IndexedDB infers that a change needs to be made when the database is 
// first connected (which we're doing now) or if the version number changes.

// Thus, this onupgradeneeded event will emit the first time we run this code and 
// create the new_pizza object store. The event won't run again unless we delete the 
// database from the browser or we change the version number in the .open() method 
// to a value of 2, indicating that our database needs an update.

// When this event executes, we store a locally scoped connection to the database 
// and use the .createObjectStore() method to create the object store that will hold 
// the pizza data. With IndexedDB, we have a veritable blank slate—we'll 
// have to establish all of the rules for working with the database.

// For that reason, when we create the new_pizza object store, we also instruct 
// that store to have an auto incrementing index for each new set of data we insert. 
// Otherwise we'd have a hard time retrieving data.

// --------- Regarding transactions ----------
// With IndexedDB, we don't always have that direct connection like we do with SQL and 
// MongoDB databases, so methods for performing CRUD operations with IndexedDB aren't 
// available at all times. Instead, we have to explicitly open a transaction, or a temporary 
// connection to the database. This will help the IndexedDB database maintain an accurate 
// reading of the data it stores so that data isn't in flux all the time.

// ----------- Function UploadPizza() -----------
// Now, you may think that the getAll variable will automatically receive the data from 
// the new_pizza object store, but unfortunately it does not. Because the object stores 
// can be used for both small and large file storage, the .getAll() method is an asynchronous 
// function that we have to attach an event handler to in order to retrieve the data. Let's add that next.

// If there's data to send, we send that array of data we just retrieved to the server at 
// the POST /api/pizzas endpoint. Fortunately, the Mongoose .create() method we use to create 
// a pizza can handle either single objects or an array of objects, so no need to create another
// route and controller method to handle this one event.