'use strict';

function renderBlockUpdateMenu(title, color, id) {

    const updateUrl = API_URLS.updateBlock;

    return `
    <form id="editBlock" type="submit" action="${updateUrl}/${id}" method="PUT">
        <fieldset id="storyBankForm">
            <legend>Edit ${title}</legend>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <input id="title" class="mdl-textfield__input" name="title" value="${title}">
                <label class="mdl-textfield__label" for="title">Title</label>
            </div>
            <button id="colorPicker" value="" class="colorButton userButton" type="button" name="selectedColor" style="${color}">Change Color</button>
            <input type="hidden" id="color" />
            <button type="submit" id="js-blockCreateButton" class="userButton">Update</button>
            <button type="button" id="cancelBlockCreate" class="userButton">Cancel</button>
        </fieldset>
    </form>
    `
}
//TODO create a hide blockupdate menu (will not return to regular view if user clicks cancel)
function displayBlockUpdateMenu() {
    $('.storyBlockView-Title').on('click', 'button#editBlock', function (event) {
        event.preventDefault();
        $('.storyBlockView-Title').hide('slow');
        $('.storyBlockView').hide('slow');
        $('.storyCreateInterface').hide('slow');
        const currentTitle = $(event.target).closest('.storyBlockView-Title').find('.blockTitle').text();
        const currentColor = $(event.target).closest('.storyBlockView-Title').find('.storyBlock').attr('style');
        const blockId = $(event.target).closest('.storyBlockView-Title').find('.blockId').text();
        console.log('kiwi', blockId);
        console.log('kiwi', currentColor);
        const blockEditMenu = renderBlockUpdateMenu(currentTitle, currentColor, blockId);
        $('.storyBlockCreateHolder').html(blockEditMenu);

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

function handleBlockUpdate() {
    const $form = $('#editBlock'),
        title = $form.find('input[name="title"]').val(),
        color = $form.find('input[id="color"]').val() || $form.find('input[id="color"]').attr('style'),
        url = $form.attr('action');

    const posting = $.ajax({
        type: "PUT",
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
        console.log(data.message);
        const message = renderMessages(data.message);
        $('.storyBlockCreateHolder').empty();
        const newBlock = renderBlock(data.block);
        const newBlockDashboard = renderInsideBlockViewTitle(data.block);
        const oldBlock = `.storyBlock[id="${data.block.id}"]`;
        $('.js-block-result').find(oldBlock).replaceWith(newBlock);
        $('.storyBlockView-Title').find(oldBlock).replaceWith(newBlockDashboard);
        //TODO this will temporarily replace storyQuickView with background images
        //with the solid color. Must only change for quickviews with NO bg image
        $('.storyBlockView').find('.storyQuickView').attr('style', `background-color: ${data.block.color}`);
        $('.deleteMenuHolder').removeClass('hide');
        $('.deleteMenuHolder').html(message);
        $('.storyBlockView-Title').show('slow');
        $('.storyBlockView').show('slow');
        $('.storyCreateInterface').show('slow');
        componentHandler.upgradeDom();
    })
}

function renderDeleteMenu(title, id) {

    const deleteUrl = API_URLS.deleteBlock;

    return `
    <form id="deleteBlock" class="deleteBlockMenu" action="${deleteUrl}/${id}" method="DELETE">
        <fieldset id="storyBankForm">
            <legend>Delete Block</legend>
            <p>Are you sure you want to delete
                <span class="deleteBlockTitle">${title}</span>? Doing so will also delete all of the stories within!</p>
            <button id="deleteBlockSubmit" class="deleteButton userButton" type="submit">Yes</button>
            <button id="cancelBlockDeletion" class="cancelDeleteButton userButton" type="button">Cancel</button>
        </fieldset>
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
        const message = renderMessages(data.message);
        $('.deleteMenuHolder').html(message);
        // $('.storyBlockView-Title').empty();
        $('.storyBlockView-Title').hide('slow', function() {$('.storyBlockView-Title').empty()});
        $('.storyBlockView').empty();
        // $('.storyBlock').remove(`#${data.block.id}`)
        $(`#${data.block.id}`).hide('slow', function(){ $(`#${data.block.id}`).remove(); });
    });
}


function storyBlock2() {
    $(displayBlockUpdateMenu);
    $(displayDeleteMenu);
    $(hideDeleteMenu);
}

$(storyBlock2);