'use strict';

function getAllBlocks(callback) {
    const requestURI = `${API_URLS.getBlocks}`
    return $.getJSON(requestURI, callback)
}

function getBlocksWithStories(blockId, callback) {
    const requestURI = `${API_URLS.getBlocksWithStories}/${blockId}`;
    return $.getJSON(requestURI, callback);
}

function renderBlock(result) {
    return `
    <button class="storyBlock" id="${result.id}" style="background-color: ${result.color}" type="button">
        <p class="blockTitle">${result.title}</p>
        <p class="blockId">${result.id}</p>
    </button>`
}

function displayBlock(arr) {
    const results = arr.blocks.map((item) => renderBlock(item));
    $('.js-block-result').html(results);
    componentHandler.upgradeDom();
}

function renderCreateBlockInterface() {
    return `
    <h2>Create a new Story Block</h2>
    <form id="createBlock" type="submit" action="/storyblock/block/create" method="POST">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input id="title" class="mdl-textfield__input" name="title">
            <label class="mdl-textfield__label" for="title">Title</label>
        </div>

        <button id="colorPicker" class="colorButton userButton" type="button" name="selectedColor">Select a color</button>        
        <input type="hidden" id="color" />
         
        <button type="submit" id="js-blockCreateButton" class="userButton">Create!</button>
        <button type="button" id="cancelBlockCreate" class="userButton">Cancel</button>
    </form>
    `
}

function viewCreateBlockInterface() {
    $('.js-create-block-view').on('click', function (event) {
        event.preventDefault();
        const blockInterface = renderCreateBlockInterface();
        $('.storyBlockCreateHolder').html(blockInterface);

        $("#colorPicker").spectrum("destroy");
        $("#colorPicker").spectrum({
            change: function (color) {
                const selectedColor = color.toHexString();
                console.log('you turned %s', selectedColor)
                $('#colorPicker').css("background-color", selectedColor);
                $('#color').val(selectedColor)
            },
            color: "#f00"
        });
        componentHandler.upgradeDom();

    });
}

function hideCreateBlockInterface() {
    $('.storyBlockCreateHolder').on('click', 'button#cancelBlockCreate', function (event) {
        $('.storyBlockCreateHolder').empty();
    });
}

function handleCreateBlockSubmit() {

    const $form = $('#createBlock'),
        title = $form.find('input[name="title"]').val(),
        color = $form.find('input[id="color"]').val(),
        url = $form.attr('action');

    const posting = $.ajax({
        type: "POST",
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        dataType: 'json',
        data: JSON.stringify({
            title: title,
            color: color
        })
    });

    posting.done(function (data) {
        const content = renderBlock(data.block);
        $('.storyBlockCreateHolder').empty();
        $('.js-block-result').append(content);
    });

}

function getUserBlocks() {
    $('.js-all-block-display').on('click', function (event) {
        event.preventDefault();

        const record = $.ajax({
            type: "GET",
            url: `${API_URLS.getUserBlocks}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            }
        });

        record.done(function (data) {
            return displayBlock(data);
        });
    })
}

function renderInsideBlockView(result) {
    return `
    <h3>${result.title}</h3>
    <img class="storyImage" src="${result.image}">
    <p>${result.content}</p>
    <p>Public? ${result.publicStatus}</p>
    `
}

function displayBlockWithStories(arr) {
    const results = arr.stories.map((item) => renderStoryQuickView(item));
    const blockResult = renderInsideBlockViewTitle(arr.block);
    $('.storyBlockView').html(results);
    $('.storyBlockView-Title').html(blockResult);
    componentHandler.upgradeDom();
}

function handleGetAllBlocksWithStories() {
    $('.js-block-result').on('click', 'button.storyBlock', function (event) {
        event.preventDefault();
        const blockId = $(event.target).closest('.storyBlock').find('.blockId').text();
        console.log(blockId);
        const resultPromise = getBlocksWithStories(blockId);
        $('.storyCreateInterface').empty();

        resultPromise.catch(err => {
            console.error('Error', err);
        })

        resultPromise.then(resultResponse => {
            return displayBlockWithStories(resultResponse);
        })

    })
}

function renderInsideBlockViewTitle(result) {
    return `
    <div class="storyBlock" id="${result.id}" style="background-color: ${result.color}">
        <p class="blockTitle">${result.title}</p>
        <p class="blockId">${result.id}</p>
        
        <button class="addStory userButton">Add New Story</button>
        <button id="displayAllStories" class="userButton">Show All Stories</button>
        <button id="displayDeleteMenu" class="userButton">Delete Block</button>
    </div>
   `
}

function viewAllStoriesInBlock() {
    $('.storyBlockView-Title').on('click', 'button#displayAllStories', function (event) {
        event.preventDefault();
        $('.storyCreateInterface').empty();
        $('.storyBlockView').show('slow');
        const blockId = $(event.target).closest('.storyBlockView-Title').find('.blockId').text();
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

function renderDeleteMenu(title, id) {

    const deleteUrl = API_URLS.deleteBlock;

    return `
    <form id="deleteBlock" class="deleteBlockMenu" action="${deleteUrl}/${id}" method="DELETE">
    <p>Are you sure you want to delete <span class="deleteBlockTitle">${title}</span>? Doing so will also delete all of the stories within!</p>
    <button id="deleteBlockSubmit" class="deleteButton userButton" type="submit">Yes</button>
    <button id="cancelBlockDeletion" class="cancelDeleteButton userButton" type="button">Cancel</button>
    </form>
    `
}

function displayDeleteMenu() {
    $('.storyBlockView-Title').on('click', 'button#displayDeleteMenu', function (event) {
        event.preventDefault();
        $('.storyCreateInterface').empty();
        $('.storyBlockCreateHolder').empty();
        $('.deleteMenuHolder').removeClass('hide');
        const blockTitle = $(event.target).closest('.storyBlockView-Title').find('.blockTitle').text();
        const blockId = $(event.target).closest('.storyBlockView-Title').find('.blockId').text();
        const deleteMenu = renderDeleteMenu(blockTitle, blockId);
        $('.deleteMenuHolder').html(deleteMenu);
    });
}

function hideDeleteMenu() {
    $('.deleteMenuHolder').on('click', 'button#cancelBlockDeletion', function (event) {
        event.preventDefault();
        $('.deleteMenuHolder').addClass('hide');
    });
}

function handleBlockDeletion() {
    const $form = $('#deleteBlock'),
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
        console.log(`${data.message}`);
        const message = `<p>${data.message}</p><button id="cancelBlockDeletion" class="userButton" type="button">Ok</button>`;
        $('.deleteMenuHolder').html(message);
        $('.storyBlockView-Title').empty();
        $('.storyBlock').remove(`#${data.block.id}`)
    });
}



function handleFormsSubmit() {

    $('body').submit(function (event) {
        event.preventDefault();

        const formID = $(event.target).attr('id')
        console.log('Submitted form id is:', formID)

        if (formID === 'createBlock') {
            handleCreateBlockSubmit()
        }

        if (formID === 'deleteBlock') {
            handleBlockDeletion()
        }

        if (formID === 'createStory') {
            handleCreateStory()
        }

    });
}

function storyBlock() {
    $(getUserBlocks);
    $(handleGetAllBlocksWithStories);
    $(viewCreateBlockInterface);
    $(hideCreateBlockInterface);
    $(displayDeleteMenu);
    $(hideDeleteMenu);

    $(handleFormsSubmit);
}

$(storyBlock);