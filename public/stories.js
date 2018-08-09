'use strict';

let lastUpload;

function getStoryById(storyId, callback) {
    const requestURI = `${API_URLS.getStoryById}/${storyId}`;
    return $.getJSON(requestURI, callback);
}

function renderCreateStoryInterface(title, id) {

    const createURL = API_URLS.createStory

    return `
    <form id="createStory" action="${createURL}/${id}" method="POST">
        <fieldset id="storyBankForm">
            <legend>Add a story to ${title}</legend>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <input id="title" class="mdl-textfield__input" name="title">
                <label id="titleLabel" class="mdl-textfield__label" for="title">Title</label>
            </div>
            <input type="file" onchange='onChooseFile(event, onFileLoad.bind(this, "contents"))' id="image" class="imageUploadButton"
                name="image">
    
            <div class="imageThumbBox">
                <canvas id="canvas" />
                <button id="rotate-cw">Rotate CW</button>

                <img id="storyImagePreview" class="imageThumb" src="">
            </div>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="contentHolder">
                <textarea class="mdl-textfield__input" type="text" rows="3" id="content" name="content"></textarea>
                <label id="contentLabel" class="mdl-textfield__label" for="content">Write your story</label>
            </div>
            <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-2">
                <input type="checkbox" id="switch-2" class="mdl-switch__input" name="publicStatus">
                <span class="mdl-switch__label">publicStatus?</span>
            </label>
            <button type="submit" class="userButton">Add to block</button>
            <button type="button" class="userButton" id="cancelStoryCreate">Cancel</button>
        </fieldset>
    </form>`
}

function viewCreateStoryInterface() {
    $('.storyBlockView-Title').on('click', 'button.addStory', function (event) {
        event.preventDefault();
        const blockTitle = $(event.target).closest('.storyBlock').find('.blockTitle').text();
        const blockId = $(event.target).closest('.storyBlock').find('.blockId').text();
        const createStoryInterface = renderCreateStoryInterface(blockTitle, blockId);
        $('.storyBlockView').hide('slow');
        $('.storyCreateInterface').html(createStoryInterface);
        componentHandler.upgradeDom();
    });
}

function hideStoryCreateInterface() {
    $('.storyCreateInterface').on('click', 'button#cancelStoryCreate', function (event) {
        $('.storyCreateInterface').empty();
        $('.storyBlockView').show('slow');
    });
}

function processImage(ev) {
    console.log('PROCESS IMAGE', ev)
}

function renderStory(result) {
    //if user chooses not to provide an image
    let image;
    if (!(result.story.image)) {
        image = `<br>`;
    } else {
        image = `<img class="storyImage" src="${result.story.image}">`;
    }

    let publicStatus;

    if (result.story.publicStatus === true) {
        publicStatus = `Public`;
    } else {
        publicStatus = `Not Public`;
    }

    return `
        <div class="storyDetailView" id="${result.story.id}">
        <h3 class="storyTitle">${result.story.title}</h3>
        <p class="storyId">${result.story.id}</p>
        <p class="publicStatus">${result.story.publicStatus}</p>
        <div class="imageBox">
        ${image}
        </div>
        <p class="storyContent">${result.story.content}</p>
        <p class="publicStatusInfo">${publicStatus}</p>
        <button type="button" id="displayStoryDeleteMenu" class="userButton">Delete</button>
        <button type="button" id="displayStoryEditMenu" class="userButton">Edit</button>
        </div>
    `
}

function displayStory(result) {
    const story = renderStory(result);
    $('.storyBlockView').html(story);
}

function renderStoryQuickView(result) {
    const blockColor = $('.js-block-result').find(`.storyBlock[id="${result.block}"]`).attr('style');

    let backgroundStyle;
    if (!(result.image)) {
        backgroundStyle = `"${blockColor}"`
    } else {
        backgroundStyle = `"background: linear-gradient( rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6) ), url(${result.image});
        background-repeat: no-repeat;
        background-position: center;"`
    }

    //For converting boolean value into plain english for user
    let publicStatus;
    if (result.publicStatus === true) {
        publicStatus = `Public`;
    } else {
        publicStatus = `Not Public`;
    }

    return `
    <button type="button" class="storyQuickView" style=${backgroundStyle}>
    <p class="quickViewTitle">${result.title}</p>
    <p class="publicStatusInfo">${publicStatus}</p>
    <p class="storyId">${ result.id}</p>
    </button>
    `
}

function handleViewStory() {
    $('.storyBlockView').on('click', 'button.storyQuickView', function (event) {
        event.preventDefault();
        const storyId = $(event.target).closest('.storyQuickView').find('.storyId').text();
        console.log('The story id is:', storyId);
        const resultPromise = getStoryById(storyId);
        $('.storyBlockView').empty();
        resultPromise.catch(err => {
            console.error('Error', err);
        })

        resultPromise.then(resultResponse => {
            return displayStory(resultResponse);
        })
    })
}


function rotate(image, ctx, degrees) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(degrees * Math.PI / 180);
    ctx.drawImage(image, -image.width / 2, -image.width / 2);
    ctx.restore();
}

//For image uploading purposes
var angle=0
function onFileLoad(elementId, event) {
    const data = event.target.result;
    console.log('Got file data', data);
    $('#storyImagePreview').attr('src', data);

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    var image = document.createElement("img");
    image.onload = function () {
        ctx.drawImage(image, canvas.width / 2 - image.width / 2, canvas.height / 2 - image.width / 2);
        console.log('Canvas is dirty')

        $('#rotate-cw').off('click')
        $('#rotate-cw').on('click', ev => {
            ev.preventDefault()
            angle = (angle+90)%360
            rotate(image, ctx, angle)
        })

    }
    image.src = data;

    lastUpload = data;
}

function onChooseFile(event, onLoadFileHandler) {
    if (typeof window.FileReader !== 'function')
        throw ("The file API isn't supported on this browser.");
    let input = event.target;
    if (!input)
        throw ("The browser does not properly implement the event object");
    if (!input.files)
        throw ("This browser does not support the `files` property of the file input.");
    if (!input.files[0])
        return undefined;
    let file = input.files[0];
    let fr = new FileReader();
    fr.onload = onLoadFileHandler;
    fr.readAsDataURL(file)
}

function handleCreateStory() {
    const $form = $('#createStory'),
        title = $form.find('input[name="title"]').val(),
        content = $form.find('textarea[name="content"]').val();

    const ckBox = $form.find("#switch-2")
    const publicStatus = ckBox.is(':checked')
    const url = $form.attr('action');

    const formData = {
        title: title,
        image: lastUpload,
        content: content,
        publicStatus: publicStatus
    }

    const posting = $.ajax({
        type: "POST",
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        dataType: 'json',
        data: JSON.stringify(formData)
    });

    posting.done(function (data) {
        lastUpload = null
        const content = renderStoryQuickView(data.story);
        console.log('story id is', data.story.id);
        $('.storyBlockView').show('slow');
        $('.storyBlockView').append(content);
        $('.storyCreateInterface').empty();
        componentHandler.upgradeDom();
    });
}


function stories() {
    $(viewAllStoriesInBlock);
    $(handleViewStory);
    $(viewCreateStoryInterface);
    $(hideStoryCreateInterface);
}

$(stories);