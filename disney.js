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
        .then(function (data) {
            console.log(data);

            const flattenObj = (data) => {
            // The object which contains the final result
            let result = {};

            // loop through the object "data"
            for (const i in data) {

                // We check the type of the i using typeof() function and recursively call the function again
                //check if data is an object and not an array; do not want to touch arrays
                if ((typeof data[i]) === 'object' && !Array.isArray(data[i])) {
                    const temp = flattenObj(data[i]);
                    for (const j in temp) {
                        // Store temp in result
                        result[i + '.' + j] = temp[j];
                    }
                }
                // Else store data[i] in result directly
                else {
                    result[i] = data[i];
                }
            }
            return result;
            };

            console.log("flattened obj" , flattenObj(data));
            console.log(data.data.StandardCollection.collectionGroup.collectionGroupId);
            collectionGroupId = data.data.StandardCollection.collectionGroup.collectionGroupId;
            //document.getElementById("collectionGroupId").innerHTML = collectionGroupId;

            //get container obj 
            var container = data.data.StandardCollection.containers;
            console.log("flat container", flattenObj(container));
            for(var i=0; i<=12; i++){
                if(container[i].set.setId != null){
                    console.log(container[i].set.setId);
                }else{
                    console.log(container[i].set.refId);
                }
            }

            //object that holds the items we need to display somewhat flattened view
            let containerSet = container[0].set.items;
            console.log("containerSet length: ", containerSet.length);
            console.log("flat containerSet", flattenObj(containerSet));
            //console.log(containerSet[0].image.background[1.78].series.default.url);

            //puts category names into a map to retrieve later
            var categoryTitles = {};
            for(var i=0; i<container.length; i++){
                categoryTitles[container[i].set.text.title.full.set.default.content] = i;
            }
            //displayCategories(categoryTitles, 1);

            //make another map that stores all the image url's to display using containerSet
            for(let i=0; i<containerSet.length; i++){
                try{
                    displayUrls[containerSet[i].image.tile[1.78].series.default.url] = i;
                }catch(error){
                    displayUrls[containerSet[i].image.tile[1.78].program.default.url] = i;
                }
                //console.log("at containerSet: ", i);
            }
            //displayUrls[container[0].set.text.title.full.set.default.content] = containerSet.length;
            // displayUrls.push(containerSet[0].image.tile[1.78].series.default.url);
            // displayUrls.push(containerSet[1].image.tile[1.33].series.default.url);
            // displayUrls.push(containerSet[2].image.tile[1.78].program.default.url); // some are series and some are programs
            // displayUrls.push(containerSet[14].image.tile[1.78].series.default.url);
            
            //display the image url map and the title for that category
            displayUrlImage(displayUrls, 1);
            document.getElementById("title1").innerHTML = getKeyByValue(categoryTitles, 0);

            //reset displayUrl map so we map only the url's for this next category set
            //set the containerSet to the next array object of items
            //then add those image urls to the map; display them; and display the title
            displayUrls = {}; 
            containerSet = container[1].set.items;
            for(let i=0; i<containerSet.length; i++){
                try{
                    displayUrls[containerSet[i].image.tile[1.78].default.default.url] = i;
                }catch(error){
                    console.log("Can't get url in Collections category");
                }
            }
            displayUrlImage(displayUrls, 2);
            document.getElementById("title2").innerHTML = getKeyByValue(categoryTitles, 1);
            
            //same same idea as above
            displayUrls = {};
            containerSet = container[2].set.items;
            for(let i=0; i<containerSet.length; i++){
                try{
                    displayUrls[containerSet[i].image.tile[1.78].series.default.url] = i;
                }catch(error){
                    displayUrls[containerSet[i].image.tile[1.78].program.default.url] = i;
                }
            }
            displayUrlImage(displayUrls, 3);
            document.getElementById("title3").innerHTML = getKeyByValue(categoryTitles, 2);

            //same idea as above
            displayUrls = {};
            containerSet = container[3].set.items;
            for(let i=0; i<containerSet.length; i++){
                try{
                    displayUrls[containerSet[i].image.tile[1.78].series.default.url] = i;
                }catch(error){
                    displayUrls[containerSet[i].image.tile[1.78].program.default.url] = i;
                }
            }
            displayUrlImage(displayUrls, 4);
            document.getElementById("title4").innerHTML = getKeyByValue(categoryTitles, 3);

            //display the rest of the categories that don't have images given by the home API
            displayOtherCategories(categoryTitles);

            //"focus" on the first image of the first row at the start of the page load
            let focusImage = document.getElementById("images1").firstChild;
            document.getElementById(focusImage.id).style.border = "5px solid white";
            focusImageRow = "images1";
            focusImageId = focusImage.id;
            //console.log(focusImageRow, focusImageId);

            //used to detect where to move the focus based on remote control movements i.e up/down/left/right keys
            document.body.addEventListener('keydown', function(event){
                const key = event.key;
                switch (key) {
                    case "ArrowLeft":
                        //console.log("left key pressed")
                        getNewFocusImage(focusImageRow, focusImageId, "left");
                        break;
                    case "ArrowRight":
                        //console.log("right key pressed")
                        getNewFocusImage(focusImageRow, focusImageId, "right");
                        break;
                    case "ArrowUp":
                        //console.log("up key pressed")
                        getNewFocusImage(focusImageRow, focusImageId, "up");
                        break;
                    case "ArrowDown":
                        //console.log("down key pressed")
                        getNewFocusImage(focusImageRow, focusImageId, "down");
                        break;
                }
            });
        })
        .catch(function (err) {
            console.log('error: ' + err);
        });

//display's each url as an image to the screen 
function displayUrlImage(imageUrls, imagesDivCounter){
    let images = "images" + imagesDivCounter.toString();
    for(var [key, val] of Object.entries(imageUrls)){
        var imgId = "imgNum" + imageIdCount.toString();
        var showImage = document.createElement("img");
        showImage.src = key;
        showImage.id = imgId;
        //document.getElementById("images1").appendChild(showImage);
        document.getElementById(images).appendChild(showImage);
        imageIdCount++;
    }
}

//display the titles not already shown
// function displayCategories(categoryTitles, titleCounter){
//     let title = "title" + titleCounter.toString();
//     for(var [key, val] of Object.entries(categoryTitles)){
//         //document.getElementById(title).innerHTML = "<br>" + key;
//         document.getElementById("titleTemp").innerHTML = document.getElementById("titleTemp").innerHTML + "<br>" + key;
//     }
// }

// function getImageUrls(containerSet, setItemsCount){
//     displayUrls = {};
//     if(containerSet[setItemsCount].set.items){
//         for(let i=0; i<containerSet.length; i++){
//             try{
//                 displayUrls[containerSet[i].image.tile[1.78].series.default.url] = i;
//             }catch(error){
//                 displayUrls[containerSet[i].image.tile[1.78].program.default.url] = i;
//             }
//         }
//         displayUrlImage(displayUrls);
//     }
// }

//used to find the key given the value we send in so we can locate which collection name to print to display
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => 
            object[key] === value);
}

//display the titles not already shown
function displayOtherCategories(categories){
    var i = 4;
    let title = "title";
    while(Object.values(categories).includes(i) && i<13){
        try{
            title = title.concat((i+1).toString());
            document.getElementById(title).innerHTML = getKeyByValue(categories, i);
            i++;
            title = "title";
        }catch{
            i++;
        }
    }
}

//track which image to focus on with whatever key was clicked
function getNewFocusImage(imageRow, imageId, direction){
    if(direction == "right"){
        let imgId = imageId.substring(0, 6) + (parseInt(imageId.substring(6)) + 1).toString();
        //console.log(imgId);
        //console.log(document.getElementById(imageRow).contains(document.getElementById(imgId)));
        if(document.getElementById(imageRow).contains(document.getElementById(imgId))){
            document.getElementById(imageId).style.border = "";
            focusImageId = imgId;
            //console.log(focusImageRow, focusImageId);
            document.getElementById(focusImageId).style.border = "5px solid white";
        }
        //at the end of the row
        else{ console.log("At end of category collection, ", focusImageId); }
    }
    if(direction == "left"){
        let imgId = imageId.substring(0, 6) + (parseInt(imageId.substring(6)) - 1).toString();
        if(document.getElementById(imageRow).contains(document.getElementById(imgId))){
            document.getElementById(imageId).style.border = "";
            focusImageId = imgId;
            //console.log(focusImageRow, focusImageId);
            document.getElementById(focusImageId).style.border = "5px solid white";
        }
        //at the start of the row
        else{ console.log("At start of category collection, ",focusImageId ); }
    }
    if(direction == "up"){
        let imgRow = imageRow.substring(0, 6) + (parseInt(imageRow.substring(6)) - 1).toString();
        let imgId = imageId.substring(0, 6) + (parseInt(imageId.substring(6)) - 15).toString();
        if(document.body.contains(document.getElementById(imgRow))){
            document.getElementById(imageId).style.border = "";
            focusImageId = imgId;
            focusImageRow = imgRow;
            //console.log(focusImageRow, focusImageId);
            document.getElementById(focusImageId).style.border = "5px solid white";
        }
        //at the start of all collections
        else{ console.log("At start of categories, ", focusImageRow); }
    }
    if(direction == "down"){
        let imgRow = imageRow.substring(0, 6) + (parseInt(imageRow.substring(6)) + 1).toString();
        let imgId = imageId.substring(0, 6) + (parseInt(imageId.substring(6)) + 15).toString();
        if(document.body.contains(document.getElementById(imgRow)) && imgRow.substring(6) <= 4){
            document.getElementById(imageId).style.border = "";
            focusImageId = imgId;
            focusImageRow = imgRow;
            //console.log(focusImageRow, focusImageId);
            document.getElementById(focusImageId).style.border = "5px solid white";
        }
        //at the end of all collections that can be displayed
        else{ console.log("At end of categories, ", focusImageRow); }
    }
}