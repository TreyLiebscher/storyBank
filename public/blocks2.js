'use strict';

function renderBlockUpdateMenu(title, color, id) {

    const updateUrl = API_URLS.updateBlock;

    return `
    <h2>Edit ${title}</h2>
    <form id="editBlock" type="submit" action="${updateUrl}/${id}" method="PUT">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input id="title" class="mdl-textfield__input" name="title" value="${title}">
            <label class="mdl-textfield__label" for="title">Title</label>
        </div>

        <button id="colorPicker" value="" class="colorButton userButton" 
        type="button" name="selectedColor" style="${color}">Change Color</button>        
        <input type="hidden" id="color" />
         
        <button type="submit" id="js-blockCreateButton" class="userButton">Update</button>
        <button type="button" id="cancelBlockCreate" class="userButton">Cancel</button>
    </form>
    `
}

function displayBlockUpdateMenu() {
    $('.storyBlockView-Title').on('click', 'button#editBlock', function (event) {
        event.preventDefault();
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
        color = $form.find('input[id="color"]').val(),
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
        const message = `<p>${data.message}</p><button id="cancelBlockDeletion" class="userButton" type="button">Ok</button>`;
        $('.storyBlockCreateHolder').empty();
        console.log('kiwi', data.block.title);
        const newBlock = renderBlock(data.block);
        const newBlockDashboard = renderInsideBlockViewTitle(data.block);
        console.log(newBlock);
        $('.js-block-result').find(`.storyBlock[id="${data.block.id}"]`).replaceWith(newBlock);
        $('.storyBlockView-Title').find(`.storyBlock[id="${data.block.id}"]`).replaceWith(newBlockDashboard);
        $('.storyBlockView').find('.storyQuickView').attr('style', `background-color: ${data.block.color}`);
        $('.deleteMenuHolder').removeClass('hide');
        $('.deleteMenuHolder').html(message);
        componentHandler.upgradeDom();
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
        $('.storyBlockView').empty();
        $('.storyBlock').remove(`#${data.block.id}`)
    });
}

$(document)
    .ajaxStart(function () {
        $('.loadingHolder').show();
    })
    .ajaxStop(function () {
        $('.loadingHolder').hide();
    });


function storyBlock2() {
    $(displayBlockUpdateMenu);
    $(displayDeleteMenu);
    $(hideDeleteMenu);
}

$(storyBlock2);