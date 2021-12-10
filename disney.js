window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}
var collectionGroupId;
var displayUrls = {};
var imageIdCount = 1;
var focusImageRow;
var focusImageId;
var fullCategoryTitles = [];

//fetch call to grab json data and use it to parse and display data needed for home page view
fetch('https://cd-static.bamgrid.com/dp-117731241344/home.json', {credentials: 'same-origin'})
        .then(function (response) {
            return response.json();
        })
        .then(function (responseObj) {
            //get container obj 
            var container = responseObj.data.StandardCollection.containers;

            //Displays container titles i.e New to Disney+, Collections, Trending, etc
            var titleNumber = 1;
            for(var i=0; i<container.length; i++){
                document.getElementById("title" + titleNumber).innerHTML = container[i].set.text.title.full.set.default.content;
                fullCategoryTitles.push([container[i].set.text.title.full.set.default.content]);
                titleNumber = titleNumber + 1;
            }

            //create containerSet obj that contains the image array we need to get and display
            var imagesDivCounter = 1
            for(var i=0; i<4; i++){
              containerSet = container[i].set.items;
              displayUrlImage(containerSet, imagesDivCounter);
              imagesDivCounter = imagesDivCounter + 1;
            }

            //focus on the first image of the first row at the start of the page load
            let focusImage = document.getElementById("images1").firstChild;
            document.getElementById(focusImage.id).style.border = "5px solid white";
            focusImageRow = "images1";
            focusImageId = focusImage.id;

            //used to detect where to move the focus based on remote control movements i.e up/down/left/right keys
            document.body.addEventListener('keydown', function(event){
                const key = event.key;
                switch (key) {
                    case "ArrowLeft":
                        getNewFocusImage(focusImageRow, focusImageId, "left");
                        break;
                    case "ArrowRight":
                        getNewFocusImage(focusImageRow, focusImageId, "right");
                        break;
                    case "ArrowUp":
                        getNewFocusImage(focusImageRow, focusImageId, "up");
                        break;
                    case "ArrowDown":
                        getNewFocusImage(focusImageRow, focusImageId, "down");
                        break;
                }
            });

            //display and get the rest of the category images not given by the home API
            //sends in title and refId to pull data and check its contents
            categoryTitles = [];
            for(var i=4; i<container.length; i++){
              categoryTitles.push({
                title: container[i].set.text.title.full.set.default.content,
                refId: container[i].set.refId
              });
            }
            displayOtherCategories(categoryTitles);
        })
        .catch(function (err) {
            console.log('error: ' + err);
        });

//gets and display's each url as an image to the screen 
//adds every image url to an array to populate each image
//uses three helper functions to get the correct url path in json file
//loops through the array to display the images as a row by appending the image elements 
//sets div to nowrap so images are displayed the same way as Disney/Hulu application
function displayUrlImage(containerSet, imagesDivCounter){
    var imageUrls = [];

    for(let i=0; i<containerSet.length; i++){
      var containerItem = containerSet[i];

      if(isCollection(containerItem)) {
        imageUrls.push(containerItem.image.tile[1.78].default.default.url);
      } 
      else if (isSeries(containerItem)) {
        imageUrls.push(containerItem.image.tile[1.78].series.default.url);
      } 
      else if (isProgram(containerItem)) {
        imageUrls.push(containerItem.image.tile[1.78].program.default.url);
      }
    }

    let images = "images" + imagesDivCounter.toString();
    for(var i=0; i<imageUrls.length; i++){
        var imgId = "imgNum" + imageIdCount.toString();
        var showImage = document.createElement("img");
        showImage.src = imageUrls[i];
        showImage.id = imgId;
        document.getElementById(images).appendChild(showImage);
        imageIdCount++;
        document.getElementById(images).style.whiteSpace = "nowrap";
    }
}

//three functions checks to see if containerSet obj is a collection, series, or program
function isCollection(containerSet) {
  return containerSet.collectionId;
}
function isSeries(containerSet) {
  return containerSet.seriesId;
}
function isProgram(containerSet) {
  return containerSet.programId;
}

//track which image to focus on with whatever key was clicked using the image id associated with each image and the row it is in
//for left and right: need to get and check first and last elements so that remote control works properly
//up and down uses the rows dictated by HTML to set remote control focus movement
function getNewFocusImage(currentImageRow, currentImageId, direction){
    if(direction == "right"){
        let imgId = "imgNum"+ (parseInt(currentImageId.substring(6)) + 1).toString();
        lastImageInRow = document.getElementById(currentImageRow).lastChild.id;
        if(document.getElementById(currentImageRow).contains(document.getElementById(currentImageId))
                && (lastImageInRow > currentImageId)){
            setNewFocusImage(currentImageId, imgId);
        }
        //at the end of the row
        else{ console.log("At end of category collection, ", focusImageId); }
    }
    if(direction == "left"){
        let imgId = "imgNum" + (parseInt(currentImageId.substring(6)) - 1).toString();
        firstImageInRow = document.getElementById(currentImageRow).firstChild.id;
        if(document.getElementById(currentImageRow).contains(document.getElementById(currentImageId))
                && (firstImageInRow < currentImageId)){
            setNewFocusImage(currentImageId, imgId);
        }
        //at the start of the row
        else{ console.log("At start of category collection, ",focusImageId ); }
    }
    if(direction == "up"){
        let imgRow = "images" + (parseInt(currentImageRow.substring(6)) - 1).toString();
        let imgId = "imgNum" + (parseInt(currentImageId.substring(6)) - 15).toString();
        if(document.body.contains(document.getElementById(imgRow))){
            focusImageRow = imgRow;
            setNewFocusImage(currentImageId, imgId);
        }
        //at the start of all collections
        else{ console.log("At start of categories, ", focusImageRow); }
    }
    if(direction == "down"){
        let imgRow = "images" + (parseInt(currentImageRow.substring(6)) + 1).toString();
        let imgId = "imgNum" + (parseInt(currentImageId.substring(6)) + 15).toString();
        if(document.body.contains(document.getElementById(imgRow))){
            focusImageRow = imgRow;
            setNewFocusImage(currentImageId, imgId);
        }
        //at the end of all collections that can be displayed
        else{ console.log("At end of categories, ", focusImageRow); }
    }
}

//set the new focus image given the right parameters and unsets previous focus
function setNewFocusImage(currentImageId, imgId){
    document.getElementById(currentImageId).style.border = "";
    focusImageId = imgId;
    document.getElementById(focusImageId).style.border = "5px solid white";
}

//display the other images not already shown; dynamically pulled via json using the refId provided
//need to use async await so that the image id's for dynamically populated images are ordered correctly for each row 
//uses SetCorrectContainer to correct map the right path to retrieve images
//uses getImageDivId to set the images to the correct row
//uses displayUrlImage to display images
async function displayOtherCategories(categories){
    for(i=0; i<categories.length;i++) {
      var refId = categories[i].refId;
      let dynamicFetch = await fetch("https://cd-static.bamgrid.com/dp-117731241344/sets/" + refId + ".json", {credentials: 'same-origin'})
        .then(function (response) {
            return response.json();
        })
        .then(function (responseDataDynamic) {
            containerSet = setCorrectContainer(responseDataDynamic.data);
            var imagesDivCounterForDynamicRefs = getImageDivId(responseDataDynamic.data);
            displayUrlImage(containerSet, imagesDivCounterForDynamicRefs);
        })
    }
}

//checks which set response is and returns the path to obtain images
function setCorrectContainer(response){
    if(response.TrendingSet){
        return response.TrendingSet.items;
    }
    else if(response.CuratedSet){
        return response.CuratedSet.items;
    }
    else if(response.PersonalizedCuratedSet){
        return response.PersonalizedCuratedSet.items;
    }
}

//checks the content title associated with the object
//returns the correct row count for image display
function getImageDivId(container){
    for(var i=0; i<fullCategoryTitles.length; i++){
        if(container.TrendingSet){
            if(container.TrendingSet.text.title.full.set.default.content == fullCategoryTitles[i])
            {
                return i+1;
            }
        }
        else if(container.CuratedSet){
            if(container.CuratedSet.text.title.full.set.default.content == fullCategoryTitles[i])
            {
                return i+1;
            }
        }
        else if(container.PersonalizedCuratedSet){
            if(container.PersonalizedCuratedSet.text.title.full.set.default.content == fullCategoryTitles[i])
            {
                return i+1;
            }
        }
    }
}