// ==UserScript==
// @name         Auto Sythe Bumper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Will comment automatically all the included threads, it run in the www.sythe.org page, the main program will check every 5 minutes all the added threads, if one thread have 4 or more hours it will open that thread in a new tab, then will run thread main program, it will check if the page is added, if not then it will do nothing by itself until you press Insert, that key open a confirm pop up, accepting it will bump the thread and add the thread to the watch list
// @author       https://github.com/portareset1
// @match        https://www.sythe.org
// @match        https://www.sythe.org/threads/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        unsafeWindow
// @grant        window.close
// @run-at       document-idle

// ==/UserScript==

//Global vars definition
var valuesNames = GM_listValues(); //valuesNames have all the data values stored by the script which are have the pages links in the name parameter and a Date.now value in milliseconds
var sytheBumpDelay = 4; //sytheBumpDelay is the delay between bumps allowd by sythe.org represented in hours


//This function receives an integer represented in hours and return the introduced value in milliseconds, the introduced parameter cant be empty
function convertHoursToMs(hours){
    //Some validators
    if(!hours)return alert("The hour parameter is empty");
    if(typeof hours !== "number")return alert("The received parameter is not a number");

    //Variables declaration
    var hoursInMs;
    var ms;

    hoursInMs = (1000 * 60 * 60);//Basic milliseconds in an hour formula

    ms = hours*hoursInMs;//Hour to milliseconds convertion, a simple multiplication

    return ms;//Return the converted value in milliseconds
}


//This function receives an integer represented in milliseconds and return the introduced value in hours, the introduced parameter cant be empty
function convertDateToHours(date){
    //Some validators
    if(!date)return alert("The date is empty");
    if(typeof date !== "number")return alert("The received parameter is not a number");

    //Variables declaration
    var hoursInMs;
    var hours;

    hoursInMs = (1000 * 60 * 60);//Basic milliseconds in an hour formula

    hours = Math.floor(date/hoursInMs);//Milliseconds to hour convertion, the math.floor method will round the result to the lower possible value preventing bumping before the allowed time

    return hours;//Return the converted value in hours
}


//This function receives a Date parameter in milliseconds, convert it to hours and return the hours elapsed at the function call moment
function timeElapsed(date){

    //Variables declarations
    var lastBump;
    var actualHour;
    var timeElapsed;


    lastBump = convertDateToHours(date);//Received parameter converted to hours
    actualHour = convertDateToHours(Date.now());//Time at the function call moment converted to hours

    timeElapsed = actualHour-lastBump;//Time elapsed since the received parameter time to the actual time in hours


    return timeElapsed;//Return the time elapsed
}

//This function will get the thread ID link by DOM traversing, it search for it in a head element which contains a link with the thread ID attached to it and return that element
function getThreadIdLink(){

    //Variables declarations
    var $d;
    var $elementIdContainer;
    var $elementIdLink;

    $d = document;//This var have the document object attached to it

    $elementIdContainer = $d.querySelector("link[rel='canonical']");//Get the element ID element container

    if(!$elementIdContainer)return alert("This page don't have a valid ID container");//Validator to check if the page have an ID container

    $elementIdLink = $elementIdContainer.href;//Accesing the element ID container href attribute, it contains the link with the ID attached

    return $elementIdLink;//Return the link with the ID of the thread
}

//This function receives a link string as a parameter, then a regular expression will check the link to get the ID attached to that link, it returns that ID
function substIdFromLink(link){

    //Some validators
    if(!link)return alert("No ID link detected");
    if(typeof link != "string") return alert("The introduced ID link isn't a valid string");

    //Variables declarations
    var threadId;
    var regExp;

    regExp =/([\d]){7}(?=[/])/g;//Regular expression that match a 7 numbers set (the sythe threads ID have 7 numbers IDs)

    threadId = link.match(regExp);//Contains the result of the regex match method which is the ID

    if(!threadId)return alert("The ID search didn't found an ID");//This validator will check if the match method result was succesfull or not

    return threadId[0];//Return the match method result
}

//This function get the thread ID link and then substract the ID from that link, it return the thread ID
function getThreadId(){

    //Variables declarations
    var threadLink;
    var threadId;

    threadLink = getThreadIdLink();//This get the thread id link
    threadId = substIdFromLink(threadLink);//This will substract the thread ID of the thread link

    return threadId;//Return the thread ID
}


//This function get the stored value name in a thread, it takes the actual thread ID link, then compare that ID against all the stored values links ID's, if it match with a valueName of that list
//then the valueName var will have the name value associated to that thread which is the link of the thread
function getValueName(){

    //Variables declarations
    var threadId;
    var storedId;
    var valueName;


    threadId = getThreadId();//This will substract the thread ID of the thread link

    //This for of loop take the actual thread ID and compare it against all the stored values ID's (using their values which are links with ID's attached) to substract and get their ID's to compare them,
    //if the ID's match then the valueName var will have the link of the stored value, this was made to ever use the ID's as a reference for matches and not the actual link because the links can change
    //but the ID's are always the same
    for(var el of valuesNames){
        storedId = substIdFromLink(el);//Get all the stored values ID's

        //Compare the stored values ID's against the thread ID
        if(threadId ===storedId){
            valueName = el;
            return valueName;//Return this if a match is found then valueName will have the match value name
        }
    }
    return alert("Not value name found");//Return this if not match found
}

//This function checks if the thread is stored in the bump watcher list, it get the thread ID and compare it against all the stored values ID's, if it get a match then the isStored var will be true
function isStored(){

    //Variables declarations
    var threadId;
    var storedId;
    var isStored;


    threadId = getThreadId();//This will substract the thread ID of the thread link
    isStored = false;//The initual status of the isStored value, is false by default

    //This for of loop will compare the thread ID against all the stored ID's, if it match then the isStored var will be true
    for(var el of valuesNames){
        storedId = substIdFromLink(el);//Get all the stored values ID's

        //If match isStored will be true, that means the thread is stored in the list
        if(threadId ===storedId){
            isStored = true;
        }
    }
    return isStored;//Return true if the loop get a match or false if not
}

//This function receives an url and open that url in a new tab
function openTabs(url){

    //Some validations
    if(!url)return alert("The url parameter is empty");

    //Variable declaration
    var w;

    w = window.open(url, '_blank');//This have the the tab instance properties
}


//This function receives a comment parammeter which is the text that is going to be commented when a thread is bumped
function commentThread(comment){

    //Variables declarations
    var $d;
    var $commentBox;
    var $commentBoxParaph;
    var $commentBoxButton;


    $d = document;//This have the document object
    $commentBox = $d.querySelector("iframe").contentWindow.document;//This get the commentbox element

    //Some validations, it will send an alert if the thread don't have a commentbox
    if(!$commentBox){
        return alert("This thread cant be commented, not comment box found");
    }

    $commentBoxParaph = $commentBox.querySelector("p");//This get the commentbox paraph
    $commentBoxButton = $d.querySelector("input.button.primary[value='Post Reply']");//This get the commentbox Post Reply button
    $commentBoxParaph.innerHTML = comment;//This will change the commentbox paraph content to the fuction parameter content

    $commentBoxButton.click();//This will call the .click method, it clicks the Post Reply button
}

//This function will create a thread value based in the threadIdLink and the actual date, will add the thread to the bump watcher list in other words
function createThreadValue(){

    //Variables declarations
    var threadIdLink;
    var actualDate;
    var value;

    threadIdLink = getThreadIdLink();//This get the thread id link
    actualDate = Date.now();//This get the actual hour at the function call moment
    value = GM_setValue(threadIdLink, actualDate);//This create the de value with the actual thread link as a name and the actual date as a value
}

//This function receives a thread id link as a parameter and then will update the thread value to the actual time
function updateBumpTime(threadIdLink){

    //Some validations
    if(!threadIdLink)return alert("The thread id link it's invalid");

    //Variable declaration
    var actualDate;

    actualDate = Date.now();//This have the actual hour at the call moment

    GM_setValue(threadIdLink, actualDate);//This update the thread value and replace it with the actual hour
}


//This function is called when the isStored value is true in the main thread function, it will get the thread id and the time value associated to it, then will check the time elapsed
//since the last declaration and compare against the sytheBumpDelay which is a global var that have the minimum sythe allowed bump time,
//if the value time is higher than this, the thread is bumped and the date updated
function threadsMain(){

    //Variables declarations
    var valueName;
    var value;
    var lastTimeBumped;
    var comment;

    valueName = getValueName();//This get the threadIdLink of the actual thread
    value = GM_getValue(valueName);//This get the thread date value of the actual thread


    lastTimeBumped = timeElapsed(value);//This get the thread date value time elapsed at the call moment

    //This conditional will check if the last time bumped value is higher than the minimum sythe allowed time
    if(lastTimeBumped >= sytheBumpDelay){
        comment = "bump";//This var is the comment that is going to be bumped


        setTimeout(()=>{
            commentThread(comment);//This will call the comment function
             updateBumpTime(valueName);//This will update the last time updated value of the thread
            window.close();
        }, Math.floor(Math.random()*1000*60));

    }
}


//This is the main function, it run in the sythe.org page, it will check if the user have stored pages, if not then will display an alert box, if the user have stored pages in the bump watch list
//the function start an interval which is going to check all the stored pages every 5 minutes, if the for inside the interval get a value higher than the minimun sythe allowed bump time
//it will open the respective thread in a new tab
if (!/threads/.test(window.location.href)){
    (function main () {
        'use strict';

        //Variables declarations
        var bumpInterval;
        var values;
        var lastTimeBumped;

        //This conditional will check if the user have stored pages, if not then will display an informative alert message
        if(valuesNames.length <1) return alert("Not pages found in the threads watcher, if you want to add a new page, go to the thread and press 'Insert' then click Accept, doing that will bump the thread.");

        //If the thread watcher list have at least 1 element then this interval will be called, it will check every 5 minutes for pages with higher date values than the sythe min allowed
        bumpInterval = setInterval(()=>{

            //This loop iterates all the stored values to compare then
            for(var el of valuesNames){
                values = GM_getValue(el);//This get all the stored element date values
                lastTimeBumped = timeElapsed(values);//This get the last time bumped hours of the values

                //This conditional compares all the values hours against the sythe minimun allowed hours
                if(lastTimeBumped >= sytheBumpDelay){
                    openTabs(el);//This open a tab with the thread that match
                }
            }
        }, 300000);//This is the interval timer in milliseconds which is 5 minutes


    })();
}


//This is the threads main function, it will do nothing than let the user add the page to the list by pressing Insert if the actual page is not on the bump watch list,
//if the page is stored then the same button will display an informative alert, if the page is stored and the thread value is higher than the sythe min allowed then the thread will bump
if (/threads/.test(window.location.href)){
    (function manageThreads(){

        //Variables declarations
        var confirmBox;
        var stored;
        var $w;
        var $d;
        var comment;

        $w = window;//This have the window object
        $d = document;//This have the document object
        comment = "bump";//This is the comment that will be passed to the comment function

        stored = isStored();//This says if the thread is stored or not
        $d.addEventListener('keydown', logKey);//This add keydown eventlistener to the document

        //This will call the function automatically if the thread is stored
        if(stored){
            threadsMain();//Calls the main threads function and will bump if the time is higher than the sythe minimun allowed
        }

        //This is the function called by the event listener, it binds the Insert key and will display a confirm box if the page is not stored
        function logKey(e) {
            //Bind the insert key
            if(e.code === "Insert"){
                //This conditional will execute the code if the thread is not on the list
                if(!stored){
                    confirmBox = $w.confirm("This page is not on the bump watcher, do you want to add it? Doing this will bump the thread");//This have a confirm box that let you add the thread to the list
                    if(!confirmBox)alert("The page wasn't added to the bump watcher");//Show this if the user click Cancel
                    //Do this is the user click Accept
                    if(confirmBox){
                        commentThread(comment);//This call the comment thread function, will comment the thread with the message introduced as a parameter
                        createThreadValue();//Add the thread to the list
                        alert("The page was bumped succesfully and added to the list");//Show this after adding the thread
                    }
                }
                //Show this if Insert is pressed and the page is already on the list
                if(stored){
                    alert("This page is already on the watch list!");
                }
            }
        }
    })();
}