'use strict';

function getRandomPublicStories() {
    
    const retrieving = $.ajax({
        type: "GET",
        url: `${API_URLS.getPublicStories}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
        }
    });

    retrieving.done(function (data) {
        return displayPublicStories(data);
        console.log('Kiwi getRPS returns', data);
    })
}

function displayPublicStories(arr) {
    const results = arr.stories.map((item) => renderStoryQuickView(item));
    $('.storyBlockView').html(results);
    componentHandler.upgradeDom();
}

function handleGetALlPublicStories() {
    $('#discover').on('click', function (event) {
        event.preventDefault();
        getRandomPublicStories();
    });
}

$(handleGetALlPublicStories);