'use strict';

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

// Logs the result and calls for a new set to be generated if the maximum number of questions has not been reached
function handleItemClick(event){
    totalClicks++;
    itemArray[event.target.id].clicks++;

    if (totalClicks%numberOfQuestions === 0){
        for (let i = 0; i < currentLineup.length; i ++){
            currentLineup[i].removeEventListener('click', handleItemClick);
        }

        let buttonsToAppend = document.getElementById(`buttons`);
        let resultsButton = document.createElement(`button`);
        resultsButton.addEventListener('click', viewResults);
        resultsButton.id = `results`;
        resultsButton.innerText = `View Results`;
        let resetButton = document.createElement(`button`);
        resetButton.addEventListener('click', resetResults);
        resetButton.innerText = `Reset Results`;
        buttonsToAppend.appendChild(resultsButton);
        buttonsToAppend.appendChild(resetButton);
    } else {
        loadCurrentItems();
    }
}

// Triggers rendering of charts and saving the collected data to local storage upon button click
function viewResults(event){
    renderChart();
    let resultsButton = document.getElementById(`results`);
    resultsButton.removeEventListener('click', viewResults);
    localStorage.setItem(`oddDuckStorage`, JSON.stringify(itemArray));
}

// Clears local storage
function resetResults(event){
    localStorage.clear();
}

// Constructs a circular array of a fixed size
class CircularArray{
    constructor(maxLength){
        this.data = new Array(maxLength);
        this.head = 0;
        this.length = 0;
        this.maxLength = maxLength;
    }

    // Adds an element to the end of the array
    queue(data){
        if (this.length === this.maxLength){
            console.log(`WARNING: Exceeding circular array's maxmimum capacity`);
            return;
        }

        this.data[(this.head + this.length)%this.maxLength] = data;
        this.length++;
    }

    // Removes 'number' elements from the front of the array and returns the first
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

    // Searches the array for a given value and returns a boolean result
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

// Constructs an object of collected 'oddDuckItem' data to be used with Chart.js
function chartDataSet(){
    this.itemName = [];
    this.itemClicks = [];
    this.itemViews = [];
    this.itemPercent = [];
    this.itemColor = [];
    this.itemBorderColor = [];

    // Push method adds an additional oddDuckItem into the data
    this.push = function(oddDuck){
        this.itemName.push(oddDuck.name);
        this.itemClicks.push(oddDuck.clicks);
        this.itemViews.push(oddDuck.views);
        if (oddDuck.views === 0){
            this.itemPercent.push(0);
        } else {
            let percent = ((oddDuck.clicks / oddDuck.views) * 100) ;
            this.itemPercent.push(percent);
        }
        let red = Math.floor(Math.random()*256);
        let green = Math.floor(Math.random()*256);
        let blue = Math.floor(Math.random()*256);
        this.itemColor.push(`rgba(${[red, green, blue]}, .4)`);
        this.itemBorderColor.push(`rgb(${[red, green, blue]})`);
    }

    // Normalizes the percents so that the sum of all percentages adds to 100%
    this.normalizePercents = function(){
        let summation = 0;
        for (let i = 0; i < this.itemPercent.length; i++){
            summation += this.itemPercent[i];
        }

        for (let i = 0; i < this.itemPercent.length; i++){
            if (summation === 0) {
                this.normalizedPercents.push(0);
            } else {
                let normPercent = ((this.itemPercent[i] / summation) * 100);
                this.normalizedPercents.push(normPercent);
            }
        }
    }

    // Selection Sort based on passed argument
    this.sortBy = function(sortingBy = `itemPercent`){
        for (let i = 0; i < this[sortingBy].length; i++){
            let minimumIndex = i;
            for (let j = i; j < this[sortingBy].length; j++){
                if (this[sortingBy][minimumIndex] > this[sortingBy][j]){
                    minimumIndex = j;
                }
            }
            if (minimumIndex != i){
                for (let property in this){
                    let temp = this[property][i];
                    this[property][i] = this[property][minimumIndex];
                    this[property][minimumIndex] = temp;
                }
            }
        }
    }
}

// Renders a bar and doughnut chart from chartDataSet object

  /* refer to Chart.js > Chart Types > Bar Chart: 
  https://www.chartjs.org/docs/latest/charts/bar.html 
  and refer to Chart.js > Getting Started > Getting Started:
  https://www.chartjs.org/docs/latest/getting-started/ */
function renderChart(){
    let dataSet = new chartDataSet();

    for (let i = 0; i < itemArray.length; i++){
        dataSet.push(itemArray[i]);
    }

    const data1 = {
        labels: dataSet.itemName,
        datasets: [{
            label: 'Number of Clicks',
            data: dataSet.itemClicks,
            backgroundColor: dataSet.itemColor,
            borderColor: dataSet.itemBorderColor,
            borderWidth: 1
        }, {
            label: 'Number of Views',
            data: dataSet.itemViews,
            borderColor: dataSet.itemBorderColor,
            borderWidth: .5
        }]
    };

    dataSet.sortBy(`itemPercent`);

    const data2 = {
        labels: dataSet.itemName,
        datasets: [{
            label: 'Percent Clicked',
            data: dataSet.itemPercent,
            backgroundColor: dataSet.itemColor,
            hoverOffset: 4,
        }]
    };

    const config1 = {
        type: 'bar',
        data: data1,
        options: {
            plugins: {
                title: {
                    display: true,
                    text: `Clicks and Views of the Items`,
                    font:{
                        size: 24
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        },
    };

    const config2 = {
        type: 'doughnut',
        data: data2,
        options: {
            plugins: {
                title: {
                    display: true,
                    text: `Percentage item was picked when it was an option`,
                    font:{
                        size: 24
                    }
                }
            }
        }
    };

    let canvasChart1 = document.getElementById('barChart');
    let canvasChart2 = document.getElementById('doughnutChart');
    const barChart = new Chart(canvasChart1, config1);
    const doughnutChart = new Chart(canvasChart2, config2);
}

let selectionQueue = new CircularArray(numberPerPage * 2);

// Loads past data from local storage (if it exists)
if (localStorage.getItem(`oddDuckStorage`)){
    itemArray = JSON.parse(localStorage.getItem(`oddDuckStorage`));
    for (let i = 0; i < itemArray.length; i++){
        totalClicks += itemArray[i].clicks;
    }
} else {
    initilizeItemArray();
}

initilizeImageSpaces();
run();

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



// class Node {
//     constructor(data){
//         this.data = data;
//         this.next = null;
//     }
// }

// class LinkedList {
//     constructor(){
//         this.head = null;
//         this.tail = null;
//         this.length = 0;
//     }

//     queue(data){
//         if (this.length === 0){
//             this.head = new Node(data);
//             this.tail = this.head;
//         } else {
//             this.tail.next = new Node(data);
//             this.tail = this.tail.next;
//         }
//         this.length++;
//     }

//     dequeue(){
//         if (this.length === 0){
//             return null;
//         } else {
//             let data = this.head.data;
//             this.head = this.head.next;
//             this.length--;
//             return data;
//         }
//     }

//     contains(data){
//         if (this.length === 0){
//             return false;
//         }
//         let currentNode = this.head;
//         while (currentNode.next) {
//             if (data === currentNode.data) {
//                 return true;
//             }
//             currentNode = currentNode.next;
//         }
//         if (data === currentNode.data) {
//             return true;
//         }

//         return false;
//     }
// }

// let ul = document.querySelector('ul');
// for (let i = 0; i < itemArray.length; i++) {
//     let li = document.createElement('li');
//     li.innerText = `${itemArray[i].name} was viewed ${itemArray[i].views} times, and was clicked ${itemArray[i].clicks} times.`;
//     ul.appendChild(li);
// }

// let resultsButton = document.getElementById('results');
// resultsButton.addEventListener('click', viewResults);

// let resetButton = document.getElementById('reset');
// resetButton.addEventListener('click', resetResults);

// let imageTag = document.createElement('img');
// sectionLocation.appendChild(imageTag);
// currentLineup[n] = document.querySelector(`section img:nth-child(${n + 1})`);
// currentLineup[n].addEventListener('click', handleItemClick);