'use strict';

// http://treys-imac.local:8080/

function getBlocks(id, callback) {
    const requestURI = `http://treys-imac.local:8080/storyblock/block/${id}`;
    $.getJSON(requestURI, callback);
}

function displayBlock(data) {
    const results = `
    <div class="storyBlock" style="background-color:${data.color}">
        <h3>${data.title}</h3>        
    </div>`;
    $('.js-block-result').html(results);
}

function watchBlockSearchSubmit() {
    $('.js-block-search-form').on('submit', function (event) {
        event.preventDefault();
        const id = $('.js-query-id').val();
        getBlocks(id, displayBlock);
    });
}

function renderBlock(title, color) {
    return `
    <div class="storyBlock" style="background-color:${color}">
        <h3>${title}</h3>        
    </div>`
}

function handleBlockSubmit() {
    $('#createBlock').on('submit', function (event) {
        event.preventDefault();
        const title = $('#title').val();
        const color = $('#color').val();
        const block = renderBlock(title, color);
        $('.blockHolder').append(block);
    });
}

function storyBank() {
    $(watchBlockSearchSubmit);
    $(handleBlockSubmit);
}

$(storyBank);