window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}
var collectionGroupId;
var displayUrls = {};
var imageIdCount = 1;
var focusImageRow;
var focusImageId;
fetch('https://cd-static.bamgrid.com/dp-117731241344/home.json', {credentials: 'same-origin'})
        .then(function (response) {
            return response.json();
        })
        .then(function (responseObj) {
            // const flattenObj = (data) => {
            // // The object which contains the final result
            // let result = {};

            // // loop through the object "data"
            // for (const i in data) {

            //     // We check the type of the i using typeof() function and recursively call the function again
            //     //check if data is an object and not an array; do not want to touch arrays
            //     if ((typeof data[i]) === 'object' && !Array.isArray(data[i])) {
            //         const temp = flattenObj(data[i]);
            //         for (const j in temp) {
            //             // Store temp in result
            //             result[i + '.' + j] = temp[j];
            //         }
            //     }
            //     // Else store data[i] in result directly
            //     else {
            //         result[i] = data[i];
            //     }
            // }
            // return result;
            // };
            //collectionGroupId = responseObj.data.StandardCollection.collectionGroup.collectionGroupId;

            //get container obj 
            var container = responseObj.data.StandardCollection.containers;

            //Build Container Titles
            var titleNumber = 1;
            for(var i=0; i<container.length; i++){
                document.getElementById("title" + titleNumber).innerHTML = container[i].set.text.title.full.set.default.content;
                titleNumber = titleNumber + 1;
            }

            //create an object that contains the images we need to display and display them
            var imagesDivCounter = 1
            for(var i=0; i<4; i++){
              containerSet = container[i].set.items;
              displayUrlImage(containerSet, imagesDivCounter);
              imagesDivCounter = imagesDivCounter + 1;
            }

            //"focus" on the first image of the first row at the start of the page load
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

//display's each url as an image to the screen 
function displayUrlImage(containerSet, imagesDivCounter){
    var imageUrls = [];

    for(let i=0; i<containerSet.length; i++){
      var containerItem = containerSet[i];

      //checks if container item obj is a collection
      if(isCollection(containerItem)) {
        imageUrls.push(containerItem.image.tile[1.78].default.default.url);
      } 
      //checks if container item obj is a series
      else if (isSeries(containerItem)) {
        imageUrls.push(containerItem.image.tile[1.78].series.default.url);
      } 
      //checks if container item obj is a program
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
    }
    document.getElementById(images).style.whiteSpace = "nowrap";
}

function isCollection(containerSet) {
  return containerSet.collectionId;
}

function isSeries(containerSet) {
  return containerSet.seriesId;
}

function isProgram(containerSet) {
  return containerSet.programId;
}

//track which image to focus on with whatever key was clicked
function getNewFocusImage(currentImageRow, currentImageId, direction){
    if(direction == "right"){
        let imgId = "imgNum"+ (parseInt(currentImageId.substring(6)) + 1).toString();
        if(document.getElementById(currentImageRow).contains(document.getElementById(currentImageId))){
            setNewFocusImage(currentImageId, imgId);
        }
        //at the end of the row
        else{ console.log("At end of category collection, ", focusImageId); }
    }
    if(direction == "left"){
        let imgId = "imgNum" + (parseInt(currentImageId.substring(6)) - 1).toString();
        if(document.getElementById(currentImageRow).contains(document.getElementById(currentImageId))){
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
        if(document.body.contains(document.getElementById(imgRow)) && imgRow.substring(6) <= 4){
            focusImageRow = imgRow;
            setNewFocusImage(currentImageId, imgId);
        }
        //at the end of all collections that can be displayed
        else{ console.log("At end of categories, ", focusImageRow); }
    }
}
//set the new focus image given the right parameters
function setNewFocusImage(currentImageId, imgId){
    document.getElementById(currentImageId).style.border = "";
    focusImageId = imgId;
    document.getElementById(focusImageId).style.border = "5px solid white";
}

//display the other images not already shown; dynamically pulled via json
function displayOtherCategories(categories){
    for(i=0; i<categories.length;i++) {
      var refId = categories[i].refId;
      fetch("https://cd-static.bamgrid.com/dp-117731241344/sets/" + refId + ".json", {credentials: 'same-origin'})
        .then(function (response) {
            return response.json();
        })
        .then(function (responseDataDynamic) {
          var imagesDivCounter = 5;
            for(var i=0; i<4; i++){
              //containerSet = container[i].set.items;
              console.log(responseDataDynamic.data);
              containerSet = setCorrectContainer(responseDataDynamic.data);
              //console.log(containerSet)
              displayUrlImage(containerSet, imagesDivCounter);
              imagesDivCounter = imagesDivCounter + 1;
            }
        })
    }
}

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