'use strict';

let lastUpload

function getStoryById(storyId, callback) {
    const requestURI = `${API_URLS.getStoryById}/${storyId}`;
    return $.getJSON(requestURI, callback);
}

function renderCreateStoryInterface(title, id) {

    const createURL = API_URLS.createStory

    return `		<h3>Add a story to ${title}</h3>
    <form id="createStory" action="${createURL}/${id}" method="POST">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input id="title" class="mdl-textfield__input" name="title">
            <label id="titleLabel" class="mdl-textfield__label" for="title">Title</label>
        </div>
            
        <input type ="file" 
            onchange='onChooseFile(event, onFileLoad.bind(this, "contents"))' 
            id="image" class="mdl-textfield__input" name="image">

        <div class="imageThumbBox">
            <img id="storyImagePreview" class="imageThumb" src="">
        </div>
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <textarea class="mdl-textfield__input" type="text" rows="3" id="content" name="content"></textarea>
            <label id="contentLabel" class="mdl-textfield__label" for="content">Write your story</label>
        </div>
        <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-2">
            <input type="checkbox" id="switch-2" class="mdl-switch__input" name="publicStatus">
            <span class="mdl-switch__label">publicStatus?</span>
        </label>
        <button type="submit" class="userButton">Add to block</button>
        <button type="button" class="userButton" id="cancelStoryCreate">Cancel</button>
    </form>`
}

function viewCreateStoryInterface() {
    $('.storyBlockView-Title').on('click', 'button.addStory', function (event) {
        event.preventDefault();
        const blockTitle = $(event.target).closest('.storyBlock').find('.blockTitle').text();
        console.log(blockTitle); //for testing needs removal
        const blockId = $(event.target).closest('.storyBlock').find('.blockId').text();
        console.log(blockId); //for testing needs removal
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

function renderStory(result) {
    //if user chooses not to provide an image
    let image;
    if (!(result.story.image)) {
        image = `<br>`;
    } else {
        image = `<img class="storyImage" src="${result.story.image}">`;
    }
    
    return `
        <div class="storyDetailView">
        <h3 class="storyTitle">${result.story.title}</h3>
        <p class="storyId">${result.story.id }</p>
        <div class="imageBox">
        ${image}
        </div>
        <p>${result.story.content}</p>
        <button type="button" id="displayStoryDeleteMenu" class="userButton">Delete</button>
        </div>
    `
}

function displayStory(result) {
    const story = renderStory(result);
    $('.storyBlockView').html(story);
}

function renderStoryQuickView(result) {
    const blockColor = $('.js-block-result').find(`.storyBlock[id="${result.block}"]`).attr('style');
    console.log('kiwi', blockColor);
    let backgroundStyle;
    if (!(result.image)) {
        backgroundStyle = `"${blockColor}"` 
    } else {
        backgroundStyle = `"background: linear-gradient( rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6) ), url(${result.image});
        background-repeat: no-repeat;
        background-position: center;"`
    }

    return `
    <div type="button" class="storyQuickView" style=${backgroundStyle}>
    <h3 class="quickViewTitle">${result.title}</h3>
    <p class="storyId">${ result.id }</p>
    </div>
    `
}

function handleViewStory() {
    $('.storyBlockView').on('click', 'div.storyQuickView', function (event) {
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


function onFileLoad(elementId, event) {
    const data = event.target.result;
    console.log('Got file data', data);
    $('#storyImagePreview').attr('src', data);
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

function renderStoryDeleteMenu(title, id) {

    const deleteUrl = API_URLS.deleteStory;

    return `
    <form id="deleteStory" class="deleteBlockMenu" action="${deleteUrl}/${id}" method="DELETE">
    <p>Are you sure you want to delete <span class="deleteBlockTitle">${title}</span>?</p>
    <button id="deleteStorySubmit" class="deleteButton userButton" type="submit">Yes</button>
    <button id="cancelStoryDeletion" class="cancelDeleteButton userButton" type="button">Cancel</button>
    </form>
    `
}

function displayDeleteStoryMenu() {
    $('.storyBlockView').on('click', 'button', 'button#displayStoryDeleteMenu', function (event) {
        event.preventDefault();
        $('.deleteMenuHolder').removeClass('hide');
        const storyId = $(event.target).closest('.storyDetailView').find('.storyId').text();
        const storyTitle = $(event.target).closest('.storyDetailView').find('.storyTitle').text();
        const deleteMenu = renderStoryDeleteMenu(storyTitle, storyId);
        $('.deleteMenuHolder').html(deleteMenu);
    });
}

function hideStoryDeleteMenu() {
    $('.deleteMenuHolder').on('click', 'button#cancelStoryDeletion', function (event) {
        event.preventDefault();
        $('.deleteMenuHolder').addClass('hide');
    });
}

function handleStoryDeletion() {
    const $form = $('#deleteStory'),
        url = $form.attr('action');

    const deleting = $.ajax({
        type: "DELETE",
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
        }
    })

    deleting.done(function (data) {
        console.log(`${data.message}, kiwi`);
        const message = `<p>${data.message}</p><button id="cancelStoryDeletion" class="userButton" type="button">Ok</button>`;
        $('.deleteMenuHolder').html(message);
        $('.storyBlockView').empty();
        const blockId = $('.storyBlockView-Title').find('.blockId').text();
        console.log(blockId);
        const resultPromise = getBlocksWithStories(blockId);

        resultPromise.catch(err => {
            console.error('Error', err);
        })

        resultPromise.then(resultResponse => {
            return displayBlockWithStories(resultResponse);
        })

    })
}

function stories() {
    $(viewAllStoriesInBlock);
    $(handleViewStory);
    $(viewCreateStoryInterface);
    $(hideStoryCreateInterface);
    $(displayDeleteStoryMenu);
    $(hideStoryDeleteMenu);
}

$(stories);