'use strict';

function renderStoryUpdateMenu(title, image, content, id) {

    const updateUrl = API_URLS.updateStory;

    return `
    <h3>Edit ${title}</h3>
    <form id="editStory" action="${updateUrl}/${id}" method="POST">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input id="title" class="mdl-textfield__input" name="title" value=${title}>
            <label id="titleLabel" class="mdl-textfield__label" for="title">Title</label>
        </div>

        <input type="file" onchange='onChooseFile(event, onFileLoad.bind(this, "contents"))' id="image" class="mdl-textfield__input"
            name="image">

        <div class="imageThumbBox">
            <img id="storyImagePreview" class="imageThumb" src="${image}">
        </div>
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <textarea class="mdl-textfield__input" type="text" rows="3" id="content" name="content">${content}</textarea>
            <label id="contentLabel" class="mdl-textfield__label" for="content">Edit your story</label>
        </div>
        <p>Your story is currently ${publicStatus}</p>
        <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-2">
            <input type="checkbox" id="switch-2" class="mdl-switch__input" name="publicStatus">
            <span class="mdl-switch__label">publicStatus?</span>
        </label>
        <button type="submit" class="userButton">Add to block</button>
        <button type="button" class="userButton" id="cancelStoryCreate">Cancel</button>
    </form>
    `
}

function displayStoryUpdateMenu() {
    $('.storyBlockView').on('click', 'button', 'button#displayStoryEditMenu', function(event) {
        event.preventDefault();
        const currentTitle = $(event.target).closest('.storyDetailView').find('.storyTitle').text();
        const currentImage = $(event.target).closest()
    })
}