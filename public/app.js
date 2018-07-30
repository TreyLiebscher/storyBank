'use strict';
//block related
function getAllBlocks(callback) {
    const requestURI = `${API_URLS.getBlocks}`
    return $.getJSON(requestURI, callback)
}
//block related
function getBlocksWithStories(blockId, callback) {
    const requestURI = `${API_URLS.getBlocksWithStories}/${blockId}`;
    return $.getJSON(requestURI, callback);
}

//story related
function getStoryById(storyId, callback) {
    const requestURI = `${API_URLS.getStoryById}/${storyId}`;
    return $.getJSON(requestURI, callback);
}
//block related
function renderBlock(result) {
    return `
    <div class="storyBlock" id="${result.id}" style="${result.color}">
        <p class="blockTitle">${result.title}</p>
        <p class="blockId">${result.id}</p>
    </div>`
}
//block related
function displayBlock(arr) {
    const results = arr.blocks.map((item) => renderBlock(item));
    $('.js-block-result').html(results);
    componentHandler.upgradeDom();
}
//block related
function renderCreateBlockInterface() {
    return `
    <h2>Create a new Story Block</h2>
    <form id="createBlock" type="submit" action="/storyblock/block/create" method="POST">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input id="title" class="mdl-textfield__input" name="title">
            <label class="mdl-textfield__label" for="title">Title</label>
        </div>
        <button id="myColorPickerPopover" class="form-control" type="button" name="selectedColor">Select a color</button>
        <button type="submit" id="js-blockCreateButton">Create!</button>
        <button type="button" id="cancelBlockCreate">Cancel</button>
    </form>
    `
}
//block related
function viewCreateBlockInterface() {
    $('.js-create-block-view').on('click', function (event) {
        event.preventDefault();
        const blockInterface = renderCreateBlockInterface();
        $('.storyBlockCreateHolder').html(blockInterface);
        YUI().use(
            'aui-color-picker-popover',
            function (Y) {
                var colorPicker = new Y.ColorPickerPopover({
                    trigger: '#myColorPickerPopover',
                    zIndex: 2
                }).render();

                colorPicker.on('select',
                    function (event) {
                        event.trigger.setStyle('backgroundColor', event.color);
                    }
                );
            }
        );
        componentHandler.upgradeDom();
    });
}
//block related
function hideCreateBlockInterface() {
    $('.storyBlockCreateHolder').on('click', 'button#cancelBlockCreate', function (event) {
        $('.storyBlockCreateHolder').empty();
    });
}


//block related
function handleCreateBlockSubmit() {

    const $form = $('#createBlock'),
        title = $form.find('input[name="title"]').val(),
        color = $form.find('button[name="selectedColor"]').attr('style'),
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
//block related
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
//block related
function renderInsideBlockView(result) {
    return `
    <h3>${result.title}</h3>
    <img class="storyImage" src="${result.image}">
    <p>${result.content}</p>
    <p>Public? ${result.publicStatus}</p>
    `
}

//block related
function displayBlockWithStories(arr) {
    // const results = arr.stories.map((item) => renderInsideBlockView(item));
    const results = arr.stories.map((item) => renderStoryQuickView(item));
    const blockResult = renderInsideBlockViewTitle(arr.block);
    $('.storyBlockView').html(results);
    $('.storyBlockView-Title').html(blockResult);
    componentHandler.upgradeDom();
}


//block related
function handleGetAllBlocksWithStories() {
    $('.js-block-result').on('click', 'div.storyBlock', function (event) {
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
//block related
function renderInsideBlockViewTitle(result) {
    return `
    <div class="storyBlock" id="${result.id}" style="${result.color}">
        <p class="blockTitle">${result.title}</p>
        <p class="blockId">${result.id}</p>
        
        <button class="addStory">Add New Story</button>
        <button id="displayAllStories">Show All Stories</button>
    </div>
   `
}

//story related
function renderCreateStoryInterface(title, id) {

    const createURL = API_URLS.createStory

    return `		<h3>Add a story to ${title}</h3>
    <form id="createStory" action="${createURL}/${id}" method="POST">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input id="title" class="mdl-textfield__input" name="title">
            <label class="mdl-textfield__label" for="title">Title</label>
        </div>
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input id="image" class="mdl-textfield__input" name="image">
            <label class="mdl-textfield__label" for="image">Image</label>
        </div>
        <div class="mdl-textfield mdl-js-textfield">
            <textarea class="mdl-textfield__input" type="text" rows="3" id="content" name="content"></textarea>
            <label class="mdl-textfield__label" for="content">Write your story</label>
        </div>
        <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-2">
            <input type="checkbox" id="switch-2" class="mdl-switch__input" name="publicStatus">
            <span class="mdl-switch__label">publicStatus?</span>
        </label>
        <button type="submit">Add to block</button>
    </form>`
}

//story related
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

//block related
function viewAllStoriesInBlock() {
    $('.storyBlockView-Title').on('click', 'button#displayAllStories', function (event) {
        event.preventDefault();
        $('.storyCreateInterface').empty();
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

//story related
function renderStory(result) {
    return `
        <div class="storyDetailView">
        <h3>${result.story.title}</h3>
        <img class="storyImage" src="${result.story.image}">
        <p>${result.story.content}</p>
        </div>
    `
}

//story related
function displayStory(result) {
    const story = renderStory(result);
    $('.storyBlockView').html(story);
}

//story related
function renderStoryQuickView(result) {
    return `
    <div class="storyQuickView" style="background: linear-gradient( rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6) ), url(${result.image});
    
    background-repeat: no-repeat;
    
    background-position: center;">
    <h3 class="quickViewTitle">${result.title}</h3>
    <p class="storyId">${result._id}</p>
    </div>
    `
}

//story related
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

//story related
function handleCreateStory() {
    const $form = $('#createStory'),
        title = $form.find('input[name="title"]').val(),
        image = $form.find('input[name="image"]').val(),
        content = $form.find('textarea[name="content"]').val();

    const ckBox = $form.find("#switch-2")
    const publicStatus = ckBox.is(':checked')
    const url = $form.attr('action');

    const formData = {
        title: title,
        image: image,
        content: content,
        publicStatus: publicStatus
    }

    const posting = $.post(url, formData);

    posting.done(function (data) {
        // const content = renderStory(data.story);
        const content = renderStoryQuickView(data.story);
        $('.storyBlockView').show('slow');
        $('.storyBlockView').append(content);
        $('.storyCreateInterface').empty();
        componentHandler.upgradeDom();
    });
}

function handleFormsSubmit() {

    $('body').submit(function (event) {
        event.preventDefault();

        const formID = $(event.target).attr('id')
        console.log('Submitted form id is:', formID)

        if (formID === 'createBlock') {
            //create block logic here
            handleCreateBlockSubmit()
        }

        if (formID === 'createStory') {
            //create story logic here
            handleCreateStory()
        }

    });
}

function storyBank() {
    $(getUserBlocks); //block
    $(handleGetAllBlocksWithStories); //block
    $(viewAllStoriesInBlock); //story
    $(handleViewStory); //story
    $(viewCreateBlockInterface); //block
    $(hideCreateBlockInterface); //block
    $(viewCreateStoryInterface); //story
    $(handleFormsSubmit);
}

$(storyBank);