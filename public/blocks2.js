'use strict';

function renderBlockUpdateMenu(title, color, id) {
    
    const updateUrl = API_URLS.updateBlock;

    return `
    <h2>Edit ${title}</h2>
    <form id="editBlock" type="submit" action="${updateUrl}/${id}" method="PUT">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input id="title" class="mdl-textfield__input" name="title" placeholder="${title}">
            <label class="mdl-textfield__label" for="title">Title</label>
        </div>

        <button id="colorPicker" value="" class="colorButton userButton" 
        type="button" name="selectedColor" style="${color}">Change Color</button>        
        <input type="hidden" id="color" />
         
        <button type="submit" id="js-blockCreateButton" class="userButton">Create!</button>
        <button type="button" id="cancelBlockCreate" class="userButton">Cancel</button>
    </form>
    `
}

function displayBlockUpdateMenu() {
    $('.storyBlockView-Title').on('click', 'button#editBlock', function(event) {
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
        type:"PUT",
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
}



$(displayBlockUpdateMenu);