'use strict';

// Make an object with {name}, {image src}, {times image shown}
// Will add in {times clicked}

// Create script that shows 3 (dynamic) options
// Attach a listener to detect when something is clicked
// Repeat

// Dynamic number of rounds


import itemData from '../data/items.json' assert {type: 'json'};
let numberPerPage = 3;
let numberOfQuestions = getNumberOfQuestions();
let currentLineup = [];
let itemArray = [];
let totalClicks = 0;


// Returns the number of question to be asked
// Currently a static amount but can easily be adjusted to prompt the user
function getNumberOfQuestions(){
    return 25;
}

// Creates spaces for image elements and adds an event listener to each element
function initilizeImageSpaces(){
    let sectionLocation = document.querySelector('section');

    for (let n = 0; n < numberPerPage; n++) {
        let imageTag = document.createElement('img');
        imageTag.addEventListener('click', handleItemClick);
        currentLineup[n] = imageTag;
        sectionLocation.appendChild(imageTag);

        // let imageTag = document.createElement('img');
        // sectionLocation.appendChild(imageTag);
        // currentLineup[n] = document.querySelector(`section img:nth-child(${n + 1})`);
        // currentLineup[n].addEventListener('click', handleItemClick);
    }
}

// Pulls information from the json file and constructs an array with the information
function initilizeItemArray(){
    
    for (let i = 0; i < itemData.length; i++){
        let newItem = new oddDuckItem(itemData[i])
        itemArray.push(newItem);
    }
}

// Generates a random number
function getRandomNumber(){
    return Math.floor(Math.random() * itemArray.length);
}


// To prevent extreme outliers 
function checkIfOutlier(newIndex){
    let maxClicksAllowed = Math.ceil(totalClicks * numberPerPage * 1.0 / itemArray.length);
    return (itemArray[newIndex].views > maxClicksAllowed);
}

// Generates a random selection of [numberPerPage] indicies
function returnRandomIndexes(){
    let returnArray = [];

    for (let i = 0; i < currentLineup.length; i++) {
        let newIndex = getRandomNumber();
        let outlierFlag = checkIfOutlier(newIndex);

        console.log(selectionQueue.contains(newIndex));

        while (selectionQueue.contains(newIndex) || outlierFlag) {
            newIndex = getRandomNumber();
            outlierFlag = checkIfOutlier(newIndex);
        }
        selectionQueue.queue(newIndex);
        returnArray[i] = newIndex;
    }
    
    if(selectionQueue.maxLength === selectionQueue.length){
        selectionQueue.dequeue(numberPerPage);
    }

    // while (selectionQueue.length > numberPerPage){
       
    //     selectionQueue.dequeue(numberPerPage);
    // }
    return returnArray;
}

// Stages and displays a group of items to be clicked on
function loadCurrentItems(){
    let indexArray = returnRandomIndexes();

    for (let i = 0; i < currentLineup.length; i++){
        
        let itemToAdd = itemArray[indexArray[i]];

        currentLineup[i].src = itemToAdd.src;
        currentLineup[i].alt = itemToAdd.name;
        currentLineup[i].title = itemToAdd.name;
        currentLineup[i].id = indexArray[i];
        itemToAdd.views++;

    }
}

function run(){
    loadCurrentItems();
}

function handleItemClick(event){
    totalClicks++;

    itemArray[event.target.id].clicks++;

    if (totalClicks >= numberOfQuestions){
        for (let i = 0; i < currentLineup.length; i ++){
            currentLineup[i].removeEventListener('click', handleItemClick);
        }
    }

    loadCurrentItems();
}

class Node {
    constructor(data){
        this.data = data;
        this.next = null;
    }
}

class LinkedList {
    constructor(){
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    queue(data){
        if (this.length === 0){
            this.head = new Node(data);
            this.tail = this.head;
        } else {
            this.tail.next = new Node(data);
            this.tail = this.tail.next;
        }
        this.length++;
    }

    dequeue(){
        if (this.length === 0){
            return null;
        } else {
            let data = this.head.data;
            this.head = this.head.next;
            this.length--;
            return data;
        }
    }

    contains(data){
        if (this.length === 0){
            return false;
        }
        let currentNode = this.head;
        while (currentNode.next) {
            if (data === currentNode.data) {
                return true;
            }
            currentNode = currentNode.next;
        }
        if (data === currentNode.data) {
            return true;
        }

        return false;
    }
}

class CircularArray{
    constructor(maxLength){
        this.data = new Array(maxLength);
        this.head = 0;
        this.length = 0;
        this.maxLength = maxLength;
    }

    queue(data){
        if (this.length === this.maxLength){
            console.log(`WARNING: Exceeding circular array's maxmimum capacity`);
            return;
        }

        this.data[(this.head + this.length)%this.maxLength] = data;
        this.length++;
    }

    dequeue(number = 1){
        if (this.length < number){
            console.log(`WARNING: Array does not contain enough elements to dequeue`);
            return null;
        }

        let oldHead = this.head;
        this.length -= number;
        this.head += number;
        this.head %= this.maxLength;
        return this.data[oldHead];
    }

    contains(data){
        for (let i = 0; i < this.length; i++){
            if (this.data[(this.head + i)%this.maxLength] === data){
                return true;
            }
        }
        return false;
    }
}



// Constructor for oddDuckItem object
function oddDuckItem(item){
    this.name = item.name;
    this.src = item.src;
    this.clicks = 0;
    this.views = 0;
}

function viewResults(event){
    let ul = document.querySelector('ul');
    for (let i = 0; i < itemArray.length; i++) {
        let li = document.createElement('li');
        li.innerText = `${itemArray[i].name} was viewed ${itemArray[i].views} times, and was clicked ${itemArray[i].clicks} times.`;
        ul.appendChild(li);
    }
    resultsButton.removeEventListener('click', viewResults);
}

let selectionQueue = new CircularArray(numberPerPage * 2);

//let selectionQueue = new LinkedList();

initilizeImageSpaces();
initilizeItemArray();
run();

let resultsButton = document.getElementById('results');
resultsButton.addEventListener('click', viewResults);



// ***********************
// *** Extra Code ********
// ***********************

// Determines if a value is inside an array
// Replaced with .includes() method
// function inArray(array, toFind){

//     for (let i = 0; i < array.length; i++){
//         if (array[i] === toFind){
//             return true;
//         }
//     }
//     return false;
// }