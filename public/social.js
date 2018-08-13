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
    })
}

function renderStoryPublicQuickView(result) {

    let storyStyle;

    if (result.image === null || undefined) {
        storyStyle = `background-color: rgba(0, 0, 0, 0.8);`; 
    } else {
        storyStyle = `background: linear-gradient( rgba(0, 0, 0, 0.6),
        rgba(0, 0, 0, 0.6) ), url(${result.image});
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;`
    }

    return `
    <button type="button" class="storyQuickView" style="${storyStyle}">${result.title}
    <p class="storyId">${ result.id }</p>
    </button>
    `
}

function displayPublicStories(arr) {
    const results = arr.stories.map((item) => renderStoryPublicQuickView(item));
    $('.discoverView').html(results);
    $('.discoverView').removeClass('hide');
    $('#hideDiscover').removeClass('hide');
}

function handleGetALlPublicStories() {
    $('#discover').on('click', function (event) {
        event.preventDefault();
        $('.discoverView').removeClass('discoverViewStoryFocus');
        getRandomPublicStories();
    });
}

function hidePublicStories() {
    $('#hideDiscover').on('click', function (event) {
        event.preventDefault();
        $('.discoverView').addClass('hide');
        $('.discoverView').empty();
        $('#hideDiscover').addClass('hide');
    });
}

function handleGoBack() {
    $('.publicStoryFooter').on('click', 'button#goBack', function (event) {
        $('.publicStoryViewer').addClass('hide');
    });
}

function renderPublicStory(result) {
    //if user chooses not to provide an image
    let image;
    if (!(result.story.image)) {
        image = `<br>`;
    } else {
        image = `<img class="storyImage" src="${result.story.image}">`;
    }

    let publicStatus;

    if (result.story.publicStatus === true) {
        publicStatus = `Public`;
    } else {
        publicStatus = `Not Public`;
    }

    return `
        <div class="storyDetailView" id="${result.story.id}">
            <h3 class="storyTitle">${result.story.title}</h3>
            <p class="storyId">${result.story.id }</p>
            <p class="publicStatus">${result.story.publicStatus}</p>
            <div class="imageBox">
                ${image}
            </div>
            <p class="storyContent">${result.story.content}</p>
            <p class="publicStatusInfo">${publicStatus}</p>  
        </div>
    `
}

function displayPublicStory(result) {
    const story = renderPublicStory(result);
    $('.publicStoryContent').html(story);
    $('.publicStoryViewer').removeClass('hide');
}

function handleViewPublicStory() {
    $('.discoverView').on('click', 'button.storyQuickView', function (event) {
        event.preventDefault();
        const storyId = $(event.target).closest('.storyQuickView').find('.storyId').text();
        console.log('The story id is:', storyId);
        const resultPromise = getStoryById(storyId);
        $('.storyBlockView').empty();
        resultPromise.catch(err => {
            console.error('Error', err);
        })

        resultPromise.then(resultResponse => {
            return displayPublicStory(resultResponse);
        })
    })
}


function social() {
    $(handleViewPublicStory);
    $(handleGoBack);
    $(handleGetALlPublicStories);
    $(hidePublicStories);
}

$(social);