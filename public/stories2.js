'use strict';

function renderStoryUpdateMenu(title, image, content, publicStatus, publicBoolean, id) {

    const updateUrl = API_URLS.updateStory;

    //TODO need to make the toggle switch the current public
    //setting of the story when rendered. The code below is
    //being ignored by default behavior with mdl
    let isPublic;

    if (publicBoolean === false) {
        isPublic = null;
    } else {
        isPublic = `is-checked`;
        console.log('kiwi', 'should be checked')
    }
    // TODO this should give a helpful message letting user
    // know that there is no image, but instead, they get
    // an ugly image placeholder
    let currentImage;

    if (image === null) {
        currentImage = `<p>This story currently has no image</p>`
    } else {
        currentImage = `<img id="storyCurrentImagePreview" class="currentImageThumb" src="${image}">`
    }

    return `
    <form id="editStory" action="${updateUrl}/${id}" method="PUT">
        <fieldset id="storyBankForm">
            <legend>Edit ${title}</legend>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <input id="title" class="mdl-textfield__input" name="title" value="${title}">
                <label id="titleLabel" class="mdl-textfield__label" for="title">Title</label>
            </div>
            <input type="file" onchange='onChooseFile(event, onFileLoad.bind(this, "contents"))' id="image" class="mdl-textfield__input"
                name="image">
            <div class="imageThumbBox">
                <div class="canvasHolder">
                    <canvas id="canvas" />
                </div>
                <button id="rotate-cw" class="userButton hide">Rotate</button>
                ${currentImage}
            </div>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="contentHolder">
                <textarea class="mdl-textfield__input" type="text" rows="3" id="content" name="content">${content}</textarea>
                <label id="contentLabel" class="mdl-textfield__label" for="content">Edit your story</label>
            </div>
            <p class="publicStatus">${publicBoolean}</p>
            <p name="currentPublicStatus">Your story is currently ${publicStatus}</p>
            <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect ${isPublic}" for="switch-2">
                <input type="checkbox" id="switch-2" class="mdl-switch__input" name="publicStatus">
                <span class="mdl-switch__label">publicStatus?</span>
            </label>
        </fieldset>
    </form>
    `
}

function displayStoryUpdateMenu() {
    $('.storyFooter').on('click', 'button#editStoryButton', function (event) {
        event.preventDefault();

        const currentStorySelect = $('.storyViewer');
        const currentTitle = currentStorySelect.find('.storyTitle').text();
        const currentImage = currentStorySelect.find('.storyImage').attr('src');
        console.log('kiwi currentImg src is', currentImage);
        const currentContent = currentStorySelect.find('.storyContent').text();
        const currentPublicStatus = currentStorySelect.find('.publicStatusInfo').text();
        const currentPublicBoolean = currentStorySelect.find('.publicStatus').text();
        const currentId = currentStorySelect.find('.storyId').text();
        const storyUpdateMenu = renderStoryUpdateMenu(
            currentTitle,
            currentImage,
            currentContent,
            currentPublicStatus,
            currentPublicBoolean,
            currentId
        );

        $('.storyBody').html(storyUpdateMenu);
        $('.storyBody').animate({scrollTop: '0px'}, 0);
        $('#updateStory').removeClass('hide');
        $('#editStoryButton').addClass('hide');
        $('#deleteStoryButton').addClass('hide');
        componentHandler.upgradeDom();
    });
}

function handleStoryUpdateSubmit() {
    $('#updateStory').click(function() {
        $('#editStory').submit();
    })
}

function handleStoryUpdate() {
    const $form = $('#editStory'),
        title = $form.find('input[name="title"]').val(),
        content = $form.find('textarea[name="content"]').val();

    const ckBox = $form.find('#switch-2')
    const publicStatus = ckBox.is(':checked')
    const url = $form.attr('action');

    let imageSrc;

    if (lastUpload === null) {
        imageSrc = $form.find('image[id="storyCurrentImagePreview"]').attr('src');
    } else {
        imageSrc = lastUpload;
    }

    const formData = {
        title: title,
        image: imageSrc,
        content: content,
        publicStatus: publicStatus
    }

    const posting = $.ajax({
        type: "PUT",
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        dataType: 'json',
        data: JSON.stringify(formData)
    });

    posting.done(function (data) {
        console.log(data);
        console.log(data.story.image);
        const message = renderMessages(data.message);
        $('.storyCreateInterface').empty();
        const newStory = renderStory(data);
        $('.storyBlockView').find(`.storyDetailView[id="${data.story.id}"]`).replaceWith(newStory);
        getBlocksWithStories(data.story.block);
        $('#updateStory').addClass('hide');
        $('#editStoryButton').removeClass('hide');
        $('#deleteStoryButton').removeClass('hide');
        $('.deleteStoryHolder').removeClass('hide');
        $('.deleteStoryHolder').html(message);
    })

}

function renderStoryDeleteMenu(title, id) {

    const deleteUrl = API_URLS.deleteStory;

    return `
    <form id="deleteStory" class="deleteBlockMenu" action="${deleteUrl}/${id}" method="DELETE">
        <fieldset id="storyBankForm">
            <legend>Delete Story</legend>
            <p>Are you sure you want to delete
                <span class="deleteBlockTitle">${title}</span>?</p>
            <div class="menuButtonHolder">
                <button id="deleteStorySubmit" class="deleteButton userButton" type="submit">Yes</button>
                <button id="cancelStoryDeletion" class="cancelDeleteButton userButton" type="button">Cancel</button>
            </div>
        </fieldset>
    </form>
    `
}

function displayDeleteStoryMenu() {
    $('.storyFooter').on('click', 'button#deleteStoryButton', function (event) {
        event.preventDefault();
        $('.deleteStoryHolder').removeClass('hide');
        const storyId = $('.storyBody').find('.storyId').text();
        const storyTitle = $('.storyBody').find('.storyTitle').text();
        const deleteMenu = renderStoryDeleteMenu(storyTitle, storyId);
        $('.deleteStoryHolder').html(deleteMenu);
    });
}

function hideStoryDeleteMenu() {
    $('.deleteStoryHolder').on('click', 'button#cancelStoryDeletion', function (event) {
        event.preventDefault();
        $('.deleteStoryHolder').addClass('hide');
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
        const message = renderMessages(data.message);
        $('.deleteStoryHolder').html(message);
        getBlocksWithStories(data.story.block);
    })
}

function acceptStoryMessages() {
    $('.deleteStoryHolder').on('click', 'button#acceptMessage', function() {
        $('.deleteStoryHolder').addClass('hide');
        $('.storyViewer').addClass('hide');
        $('.storyBankBody').removeClass('noScroll');
        $('html').removeClass('noScroll');
    })
}


function stories2() {
    $(displayDeleteStoryMenu);
    $(hideStoryDeleteMenu);
    $(displayStoryUpdateMenu);
    $(handleStoryUpdateSubmit);
    $(acceptStoryMessages);
}

$(stories2);