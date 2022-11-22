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

        while (returnArray.includes(newIndex) || outlierFlag) {
            newIndex = getRandomNumber();
            outlierFlag = checkIfOutlier(newIndex);
        }
        returnArray[i] = newIndex;
    }

    return returnArray;
}

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

function renderItem(){
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

    renderItem();
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


initilizeImageSpaces();
initilizeItemArray();
renderItem();

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