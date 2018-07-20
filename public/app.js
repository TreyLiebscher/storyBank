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
    <div class="storyBlock" id="${result.id}" style="${result.color}">
        <p class="blockTitle">${result.title}</p>
        <p class="blockId">${result.id}</p>
    </div>`
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
        <input id="myColorPickerPopover" class="form-control" type="text" value="Click to select a color" name="selectedColor">
        <button type="submit" id="js-blockCreateButton">Create!</button>
    </form>
    `
}

function viewCreateBlockInterface() {
    $('.js-create-block-view').on('click', function (event) {
        event.preventDefault();
        const blockInterface = renderCreateBlockInterface();
        $('.storyBlockCreateHolder').html(blockInterface);
        componentHandler.upgradeDom();
    });
}



function handleCreateBlockSubmit() {

    const $form = $('#createBlock'),
        title = $form.find('input[name="title"]').val(),
        color = $form.find('input[name="selectedColor"]').attr('style'),
        url = $form.attr('action');

    const posting = $.post(url, {
        title: title,
        color: color
    });

    posting.done(function (data) {
        const content = renderBlock(data.block);
        $('.storyBlockCreateHolder').empty();
        $('.js-block-result').append(content);
    });

}

function handleGetAllBlocks() {
    $('.js-all-block-display').on('click', function (event) {
        event.preventDefault();
        const blockPromise = getAllBlocks();

        blockPromise.catch(err => {
            console.error('Error', err);
        })

        blockPromise.then(blockResponse => {
            return displayBlock(blockResponse);
        })
    });
}

function renderInsideBlockView(result) {
    return `
    <h3>${result.title}</h3>
    <img src="${result.image}">
    <p>${result.content}</p>
    <p>Public? ${result.publicStatus}</p>
    `
}

function displayBlockWithStories(arr) {
    const results = arr.stories.map((item) => renderInsideBlockView(item));
    const blockResult = renderInsideBlockViewTitle(arr.block);
    $('.storyBlockView').html(results);
    $('.storyBlockView-Title').html(blockResult);
    componentHandler.upgradeDom();
}

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

function renderInsideBlockViewTitle(result) {
    return `
    <div class="storyBlock" id="${result.id}" style="${result.color}">
    <p class="blockTitle">${result.title}</p>
    <p class="blockId">${result.id}</p>
    <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored addStory" type="button">
    <i class="material-icons">add</i>
    </button>
    </div>
   `
}

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

function viewCreateStoryInterface() {
    $('.storyBlockView-Title').on('click', 'button.addStory', function (event) {
        event.preventDefault();
        const blockTitle = $(event.target).closest('.storyBlock').find('.blockTitle').text();
        console.log(blockTitle); //for testing needs removal
        const blockId = $(event.target).closest('.storyBlock').find('.blockId').text();
        console.log(blockId); //for testing needs removal
        const createStoryInterface = renderCreateStoryInterface(blockTitle, blockId);
        $('.storyCreateInterface').html(createStoryInterface);
        componentHandler.upgradeDom();
    });
}

function renderStory(result) {
    return `
        <h3>${result.title}</h3>
        <img src="${result.image}">
        <p>${result.content}</p>
    `
}

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
        const content = renderStory(data.story);
        $('.storyBlockView').append(content);
        $('.storyCreateInterface').empty();
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
//Planned layout of inside block view
function renderPrettyInsideView(result){
    return `
    <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header">
				<header class="mdl-layout__header">
				  <div class="mdl-layout__header-row">
					<!-- Title -->
					<span class="mdl-layout-title">${result.title}</span>
					<!-- Add spacer, to align navigation to the right -->
					<div class="mdl-layout-spacer"></div>
					<!-- Navigation. We hide it in small screens. -->
                    <nav class="mdl-navigation mdl-layout--large-screen-only">
                    <p class="blockId">${result.id}</p>
                    <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored addStory" type="button">
                    <i class="material-icons">add</i>
                    </button>
					</nav>
				  </div>
				</header>
				<div class="mdl-layout__drawer">
				  <span class="mdl-layout-title">Title</span>
				  <nav class="mdl-navigation">
					<p>story 1</p>
				  </nav>
				</div>
				<main class="mdl-layout__content">
                  <div class="page-content">
                  <div class="storyCreateInterface"></div>
                  <div class="storyBlockView"></div>
                  </div>
				</main>
			  </div>`
}

function viewPrettyCreateStoryInterface(){
    $('.storyBlockView-Title').on('click', 'button.addStory', function (event) {
        event.preventDefault();
        const blockTitle = $(event.target).closest('.mdl-layout__header-row').find('.mdl-layout-title').text();
        console.log(blockTitle); //for testing needs removal
        const blockId = $(event.target).closest('.mdl-layout__header-row').find('.blockId').text();
        console.log(blockId); //for testing needs removal
        const createStoryInterface = renderCreateStoryInterface(blockTitle, blockId);
        $('.storyCreateInterface').html(createStoryInterface);
        componentHandler.upgradeDom();
    });
}

YUI().use(
    'aui-color-picker-popover',
    function(Y) {
      var colorPicker = new Y.ColorPickerPopover(
        {
          trigger: '#myColorPickerPopover',
          zIndex: 2
        }
      ).render();
  
      colorPicker.on('select',
        function(event) {
          event.trigger.setStyle('backgroundColor', event.color);
        }
      );
    }
);


function storyBank() {
    $(handleGetAllBlocks);
    $(handleGetAllBlocksWithStories);
    $(viewCreateBlockInterface);
    $(viewCreateStoryInterface);
    $(handleFormsSubmit);
    // $(viewPrettyCreateStoryInterface);
}

$(storyBank);