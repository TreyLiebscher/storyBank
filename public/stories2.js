'use strict';

function renderStoryUpdateMenu(title, image, content, publicStatus, publicBoolean, id) {

    const updateUrl = API_URLS.updateStory;

    let isPublic;
    if (publicBoolean === false) {
        isPublic = null;
    } else {
        isPublic = `checked`;
    }

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
            <label for="image">Upload a picture</label>
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
            <div class="publicCheckboxContainer">
                <input type="checkbox" id="publicStatus" name="interest" class="publicStatusInput" ${isPublic}>
                <label class="publicStatusLabel" for="publicStatus">Public?</label>
            </div>
        </fieldset>
    </form>
    `
}

function renderStoryUpdateControls() {
    return `
    <button type="button" class="userButton" id="closeStory">Cancel</button>
    <button type="submit" class="userButton" id="updateStory">Update</button>
    `
}

function displayStoryUpdateMenu() {
    $('.storyFooter').on('click', 'button#editStoryButton', function (event) {
        event.preventDefault();
        const storyId = $('.storyViewer').find('.storyId').text();

        const url = `${API_URLS.getStoryById}/${storyId}`;


        const currentStoryInfo = $.ajax({
            type: "GET",
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
        });

        currentStoryInfo.done(function (data) {

            const {
                id,
                title,
                imageURL,
                content,
                publicStatus
            } = data.story;

            const currentTitle = title;
            const currentImage = imageURL;
            const currentContent = content;
            const currentPublicBoolean = publicStatus;
            const currentPublicStatus = $('.storyViewer').find('.publicStatusInfo').text();
            const currentId = id;

            const storyUpdateMenu = renderStoryUpdateMenu(
                currentTitle,
                currentImage,
                currentContent,
                currentPublicStatus,
                currentPublicBoolean,
                currentId
            );
            const storyUpdateControls = renderStoryUpdateControls();

            $('.storyBody').html(storyUpdateMenu);
            $('.storyViewer').focus();
            $('.storyFooter').html(storyUpdateControls);
            $('.storyBody').animate({
                scrollTop: '0px'
            }, 0);
            resizeContentBox();
            componentHandler.upgradeDom();
        })
    });
}

function handleStoryUpdateSubmit() {
    $('.storyFooter').on('click', 'button#updateStory', function() {
        $('#editStory').submit();
    });
}

//PUT
function handleStoryUpdate() {
    const $form = $('#editStory'),
        title = $form.find('input[name="title"]').val(),
        content = $form.find('textarea[name="content"]').val();

    const ckBox = $form.find('#publicStatus')
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
        console.log(data.story.imageURL);
        const message = renderMessages(data.message);
        $('.storyCreateInterface').empty();
        const newStory = renderStory(data);
        $('.storyBlockView').find(`.storyDetailView[id="${data.story.id}"]`).replaceWith(newStory);
        getBlocksWithStories(data.story.block);
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
        $('.deleteStoryHolder').focus();
    });
}

function hideStoryDeleteMenu() {
    $('.deleteStoryHolder').on('click', 'button#cancelStoryDeletion', function (event) {
        event.preventDefault();
        $('.deleteStoryHolder').addClass('hide');
    });
}

//DELETE
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
    $('.deleteStoryHolder').on('click', 'button#acceptMessage', function () {
        $('.deleteStoryHolder').addClass('hide');
        $('.storyViewer').addClass('hide');
        $('.storyBankBody').removeClass('noScroll');
        $('html').removeClass('noScroll');
    })
}

// source https://jsfiddle.net/cferdinandi/mqwwpL6u/
// for resizing textbox when creating a story
var autoExpand = function (field) {

    // Reset field height
    field.style.height = 'inherit';

    // Get the computed styles for the element
    var computed = window.getComputedStyle(field);

    // Calculate the height
    var height = parseInt(computed.getPropertyValue('border-top-width'), 10) +
        parseInt(computed.getPropertyValue('padding-top'), 10) +
        field.scrollHeight +
        parseInt(computed.getPropertyValue('padding-bottom'), 10) +
        parseInt(computed.getPropertyValue('border-bottom-width'), 10);

    field.style.height = height + 'px';

};

document.addEventListener('input', function (event) {
    if (event.target.tagName.toLowerCase() !== 'textarea') return;
    autoExpand(event.target);
}, false);

//for resizing content box upon the opening
//of the editing interface
function resizeContentBox() {
    const boxDOM = document.getElementById('content');
    const box = $('#content').height(0).height(boxDOM.scrollHeight);
    box.find('#content').change();
}


function stories2() {
    $(displayDeleteStoryMenu);
    $(hideStoryDeleteMenu);
    $(displayStoryUpdateMenu);
    $(handleStoryUpdateSubmit);
    $(acceptStoryMessages);
}

$(stories2);