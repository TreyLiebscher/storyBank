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
            <div class="canvasHolder">
                <canvas id="canvas" />
            </div>
                <button id="rotate-cw" class="userButton hide">Rotate</button>

            </div>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="contentHolder">
                <textarea class="mdl-textfield__input" type="text" rows="3" id="content" name="content"></textarea>
                <label id="contentLabel" class="mdl-textfield__label" for="content">Write your story</label>
            </div>
            <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-2" id="publicSwitch">
                <input type="checkbox" id="switch-2" class="mdl-switch__input" name="publicStatus">
                <span class="mdl-switch__label">Public?</span>
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
        image = `<img class="storyImage hide" src="null">`;
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
        </div>
    `
}

function displayStory(result) {
    const story = renderStory(result);
    // $('.storyBlockView').html(story);
    $('.storyBody').html(story);
    $('.storyViewer').removeClass('hide');
}

function renderStoryQuickView(result) {

    let storyStyle;

    if (!(result.image)) {
        storyStyle = `background-color: rgba(0, 0, 0, 0.8);`;
    } else {
        storyStyle = `background: linear-gradient( rgba(0, 0, 0, 0.6),
        rgba(0, 0, 0, 0.6) ), url(${result.image});
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
        $('#updateStory').addClass('hide');
        $('#editStoryButton').removeClass('hide');
        $('#deleteStoryButton').removeClass('hide');
    })
}

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
    $(handleCloseStory);
    $(viewCreateStoryInterface);
    $(hideStoryCreateInterface);
}

$(stories);