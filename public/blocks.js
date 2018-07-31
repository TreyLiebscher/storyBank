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
    <button class="storyBlock" id="${result.id}" style="${result.color}" type="button">
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

        <button id="myColorPickerPopover" class="form-control" type="button" name="selectedColor">Select a color</button>        
        <input type="hidden" id="color" />
         
        <button type="submit" id="js-blockCreateButton">Create!</button>
        <button type="button" id="cancelBlockCreate">Cancel</button>
    </form>
    `
}



function viewCreateBlockInterface() {
    $('.js-create-block-view').on('click', function (event) {
        event.preventDefault();
        const blockInterface = renderCreateBlockInterface();
        $('.storyBlockCreateHolder').html(blockInterface);

        $("#myColorPickerPopover").spectrum("destroy");
        $("#myColorPickerPopover").spectrum({
            change: function(color) {
                const selectedColor = color.toHexString(); // #ff0000
                console.log('you turned %s', selectedColor)
                $('#color').val(selectedColor)
            },
            color: "#f00"
        });

        
/*         YUI().use(
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
        ); */
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
    // const results = arr.stories.map((item) => renderInsideBlockView(item));
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
    <div class="storyBlock" id="${result.id}" style="${result.color}">
        <p class="blockTitle">${result.title}</p>
        <p class="blockId">${result.id}</p>
        
        <button class="addStory">Add New Story</button>
        <button id="displayAllStories">Show All Stories</button>
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

function storyBlock() {
    $(getUserBlocks);
    $(handleGetAllBlocksWithStories);
    $(viewCreateBlockInterface);
    $(hideCreateBlockInterface);
    $(handleFormsSubmit);
}

$(storyBlock);