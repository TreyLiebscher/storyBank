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

function renderStoryPublicQuickView(result) {

    return `
    <div type="button" class="storyQuickView" style="background: linear-gradient( rgba(0, 0, 0, 0.9),
    rgba(0, 0, 0, 0.6) ), url(${result.image});
    background-repeat: no-repeat;
    background-position: center;">
    <h3 class="quickViewTitle">${result.title}</h3>
    <p class="storyId">${ result.id }</p>
    </div>
    `
}

function displayPublicStories(arr) {
    const results = arr.stories.map((item) => renderStoryPublicQuickView(item));
    $('.discoverView').html(results);
    componentHandler.upgradeDom();
}

function handleGetALlPublicStories() {
    $('#discover').on('click', function (event) {
        event.preventDefault();
        getRandomPublicStories();
    });
}

function handleViewPublicStory() {
    $('.discoverView').on('click', 'div.storyQuickView', function (event) {
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

$(handleViewPublicStory);

$(handleGetALlPublicStories);