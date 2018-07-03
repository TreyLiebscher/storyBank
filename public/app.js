var MOCK_STORIES = {
    "postedStories": [{
            "id": "1111111",
            "title": "first story",
            "content": "this is the first story that was written",
            "image": "image",
            "public": true,
            "publishedAt": 1470016976606
        },
        {
            "id": "2222222",
            "title": "second story",
            "content": "this is the second story that was written",
            "image": "image",
            "public": false,
            "publishedAt": 1470016976607
        },
        {
            "id": "3333333",
            "title": "third story",
            "content": "this is the third story that was written",
            "image": "image",
            "public": true,
            "publishedAt": 1470016976608
        },
        {
            "id": "4444444",
            "title": "fourth story",
            "content": "this is the fourth story that was written",
            "image": "image",
            "public": false,
            "publishedAt": 1470016976609
        }
    ]
};

function getStories(callbackFn) {
    setTimeout(function () {
        callbackFn(MOCK_STORIES)
    }, 1);
}

function displayPostedStories(data) {
    for (index in data.postedStories) {
        $('body').append(
            '<p>' + data.postedStories[index].title + '</p>',
            '<p>' + data.postedStories[index].content + '</p>');
    }
}

function getAndDisplayPostedStories() {
    getStories(displayPostedStories);
}

$(function () {
    getAndDisplayPostedStories();
})