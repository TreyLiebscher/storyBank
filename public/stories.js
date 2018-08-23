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
                <input id="title" class="mdl-textfield__input" name="title" tabindex="0">
                <label id="titleLabel" class="mdl-textfield__label" for="title">Title</label>
            </div>
            <label for="image">Upload a picture</label>
            <input type="file" onchange='onChooseFile(event, onFileLoad.bind(this, "contents"))' id="image" class="imageUploadButton"
                name="image">

            <div class="imageThumbBox">
                <div class="canvasHolder">
                    <canvas id="canvas" />
                </div>
                <button id="rotate-cw" class="userButton hide">Rotate</button>

            </div>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="contentHolder">
                <textarea class="mdl-textfield__input" type="text" rows="3" id="content" name="content"></textarea>
                <label id="contentLabel" class="mdl-textfield__label" for="content">Write your story</label>
            </div>

            <div class="publicCheckboxContainer">
                <input type="checkbox" id="publicStatus" name="interest" class="publicStatusInput" value="">
                <label class="publicStatusLabel" for="publicStatus">Public?</label>
            </div>
        </fieldset>
    </form>`
}

function renderStoryCreateControls() {
    return `
    <button type="button" class="userButton cancelButton" id="closeStory">Cancel</button>
    <button class="userButton" id="createStoryButton">Add to Block</button>
    `
}
function viewCreateStoryInterface() {
    $('.storyBlockView-Title').on('click', 'button.addStory', function (event) {
        event.preventDefault();
        const blockTitle = $(event.target).closest('.storyBlock').find('.blockTitle').text();
        const blockId = $(event.target).closest('.storyBlock').find('.blockId').text();
        const createStoryInterface = renderCreateStoryInterface(blockTitle, blockId);
        const createStoryControls = renderStoryCreateControls();
        $('.blockOptions').removeClass('blockVisibleOptions');
        $('.storyBody').html(createStoryInterface);
        $('.storyFooter').html(createStoryControls);
        $('.storyBody').animate({scrollTop: '0px'}, 0);
        $('.storyBankBody').addClass('noScroll');
        $('html').addClass('noScroll');
        $('.storyViewer').removeClass('hide');
        $('.storyViewer').addClass('showFlex');
        $('#title').focus();
        componentHandler.upgradeDom();
    });
}

function handleStoryCreateSubmit() {
    $('.storyFooter').on('click', 'button#createStoryButton', function() {
        $('#createStory').submit();
    });
}

function renderStory(result) {
    //if user chooses not to provide an image
    let image;
    if (!(result.story.imageURL)) {
        image = `<br>`;
    } else {
        image = `<img class="storyImage" src="${result.story.imageURL}">`;
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
        </div>
    `
}

function renderStoryViewControls() {
    return `
    <button type="button" class="userButton" id="deleteStoryButton">Delete</button>
    <button type="button" class="userButton" id="editStoryButton">Edit</button>
    <button type="button" class="userButton" id="closeStory">Close</button>
    `
}

function displayStory(result) {
    const story = renderStory(result);
    const storyControls = renderStoryViewControls();
    $('.storyBody').html(story);
    $('.storyViewer').removeClass('hide');
    $('.storyViewer').addClass('showFlex');
    $('.storyBody').animate({scrollTop: '0px'}, 0);
    $('.storyViewer').focus();
    $('.storyFooter').html(storyControls);
}

function renderStoryQuickView(result) {

    let storyStyle;

    if (!(result.imageURL)) {
        storyStyle = `background-color: rgba(0, 0, 0, 0.3);`;
    } else {
        storyStyle = `background: linear-gradient( rgba(0, 0, 0, 0.6),
        rgba(0, 0, 0, 0.6) ), url(${result.imageURL});
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;`
    }

    //For converting boolean value into plain english for user
    let publicStatus;
    if (result.publicStatus === true) {
        publicStatus = `Public`;
    } else {
        publicStatus = `Not Public`;
    }

    return `
    <button type="button" class="storyQuickView" style="${storyStyle}">
    <p class="quickViewTitle">${result.title}</p>
    <p class="publicStatusInfo">${publicStatus}</p>
    <p class="storyId">${result.id}</p>
    </button>
    `
}

function handleViewStory() {
    $('.storyBlockView').on('click', 'button.storyQuickView', function (event) {
        event.preventDefault();
        const storyId = $(event.target).closest('.storyQuickView').find('.storyId').text();
        console.log('The story id is:', storyId);
        $('.storyBankBody').addClass('noScroll');
        $('html').addClass('noScroll');
        // $('.storyBody').animate({scrollTop: '0px'}, 0);
        const resultPromise = getStoryById(storyId);
        resultPromise.catch(err => {
            console.error('Error', err);
        })

        resultPromise.then(resultResponse => {
            return displayStory(resultResponse);
        })
    })
}

function handleCloseStory() {
    $('.storyFooter').on('click', 'button#closeStory', function() {
        $('.storyViewer').addClass('hide');
        $('.storyViewer').removeClass('showFlex');
        $('.storyBankBody').removeClass('noScroll');
        $('html').removeClass('noScroll');
    })
}

// for image uploading (lines 182-241)
let angle = 0;

function onFileLoad(elementId, event) {
    let data = event.target.result;
    let updatedData;
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    let degrees = 0;

    var image = document.createElement("img");

    image.onload = function () {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
    }
    image.src = data;
    lastUpload = data;
    // For rotating images
    $('#rotate-cw').removeClass('hide');
    $('#rotate-cw').click(function (event) {
        event.preventDefault();
        degrees += 90
        if (degrees >= 360) degrees = 0;

        if (degrees === 0 || degrees === 180) {
            canvas.width = image.width;
            canvas.height = image.height;
        } else {
            canvas.width = image.height;
            canvas.height = image.width;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(degrees * Math.PI / 180);
        ctx.drawImage(image, -image.width * 0.5, -image.height * 0.5);

        ctx.restore();
        updatedData = canvas.toDataURL('image/jpeg', 0.5);
        lastUpload = updatedData;
    })
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

//POST
function handleCreateStory() {
    const $form = $('#createStory'),
        title = $form.find('input[name="title"]').val(),
        content = $form.find('textarea[name="content"]').val();

    const ckBox = $form.find('#publicStatus')
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
        getBlocksWithStories(data.story.block);
        console.log('story id is', data.story.id);
        $('.storyViewer').addClass('hide');
        $('.storyViewer').removeClass('showFlex');
        $('.storyBankBody').removeClass('noScroll');
        $('html').removeClass('noScroll');
        componentHandler.upgradeDom();
    });
}


function stories() {
    $(handleViewStory);
    $(handleCloseStory);
    $(viewCreateStoryInterface);
    $(handleStoryCreateSubmit);
}

$(stories);